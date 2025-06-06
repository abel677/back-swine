import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../../farms/domain/contracts/reproductive-state.repository";
import { SettingRepository } from "../../../farms/domain/contracts/setting.repository";
import { CreateSowNotificationsUseCase } from "../../../notifications/application/use-cases/create-sow-notification.usecase";
import { ProductRepository } from "../../../products/domain/contracts/product.repository";
import { ALLOWED_TRANSITIONS } from "../../../shared/domain/allowed-transition";
import {
  PigPhase,
  PigReproductiveState,
  PigSex,
  PigType,
} from "../../../shared/domain/enums";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigRepository } from "../../domain/contracts/pig.repository";
import { Birth } from "../../domain/entities/birth.entity";
import { PigProduct } from "../../domain/entities/pig-product.entity";
import { PigWeight } from "../../domain/entities/pig-weight";
import { Pig } from "../../domain/entities/pig.entity";
import { ReproductiveHistory } from "../../domain/entities/reproductive-state-history.entity";
import { PigMapper } from "../../infrastructure/mappers/pig.mapper";
import { UpdatePigDto } from "../dtos/update-pig.dto";
import { PigReproductiveCalculatorUseCase } from "./pig-reproductive-calculator.usecase";

export class UpdatePigUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly breedRepository: BreedRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly pigRepository: PigRepository,
    private readonly productRepository: ProductRepository,
    private readonly reproductiveStateRepository: ReproductiveStateRepository,
    private readonly pigCalculatorUseCase: PigReproductiveCalculatorUseCase,
    private readonly createSowNotificationUseCase: CreateSowNotificationsUseCase,
    private readonly settingRepository: SettingRepository
  ) {}

  async execute(userId: string, id: string, dto: UpdatePigDto) {
    // verificar si existe el cerdo
    const pig = await this.pigRepository.getByIdAndUserId({
      id: id,
      userId: userId,
    });
    if (!pig) throw ApiError.notFound("Cerdo no encontrado.");

    // verificar si existe la granja
    if (dto.farmId) {
      const farm = await this.farmRepository.getByIdAndUserId({
        id: dto.farmId,
        userId,
      });
      if (!farm) throw ApiError.notFound("Granja no encontrada.");
      pig.saveFarm(farm);
    }

    // verificar si existe la fase
    if (dto.phaseId && dto.phaseId !== pig.phase.id) {
      const phase = await this.phaseRepository.getByIdAndUserId({
        id: dto.phaseId,
        userId,
      });
      if (!phase) throw ApiError.notFound("Fase no encontrada.");
      pig.savePhase(phase);
    }

    // verificar si existe la raza
    if (dto.breedId && dto.breedId !== pig.breed.id) {
      const breed = await this.breedRepository.getByIdAndUserId({
        id: dto.breedId,
        userId,
      });
      if (!breed) throw ApiError.notFound("Raza no encontrada.");
      pig.saveBreed(breed);
    }

    // verificar si ya existe un cerdo con un mismo código
    if (dto.code && dto.code !== pig.code) {
      const existingPig = await this.pigRepository.getByCodeAndFarmId({
        code: dto.code,
        farmId: dto.farmId ?? pig.farm.id,
      });
      if (existingPig && existingPig.id !== pig.id) {
        throw ApiError.badRequest("Ya existe otro cerdo con ese código.");
      }
      pig.saveCode(dto.code);
    }
    if (dto.ageDays) {
      pig.saveAgeDays(dto.ageDays);
    }
    if (dto.initialPrice) {
      pig.saveInitialPrice(dto.initialPrice);
    }
    // actualizar pesos
    if (dto.weights) {
      for (const pigWeight of dto.weights) {
        const pwFind = pig.weights.find((pw) => pw.id === pigWeight.id);
        if (pwFind) {
          if (pigWeight.days) pwFind.saveDays(pigWeight.days);
          if (pigWeight.weight) pwFind.saveWeight(pigWeight.weight);
          pig.saveWeight(pwFind);
        } else {
          const weight = PigWeight.create({
            days: pigWeight.days,
            weight: pigWeight.weight,
            pigId: pig.id,
          });
          pig.saveWeight(weight);
        }
      }
    }

    // actualizar productos
    if (dto.pigProducts) {
      for (const pigProduct of dto.pigProducts) {
        if (!pigProduct.id && !pigProduct.productId)
          throw ApiError.badRequest(
            "productId: ID producto inválido o faltante."
          );

        let product = undefined;
        if (pigProduct.productId) {
          product = await this.productRepository.getByIdAndUserId({
            id: pigProduct.productId,
            userId: userId,
          });

          const ppFind = pig.pigProducts.find((p) => p.id === pigProduct.id);
          if (ppFind) {
            if (product) ppFind.saveProduct(product);
            if (pigProduct.quantity) ppFind.saveQuantity(pigProduct.quantity);
            if (pigProduct.price) ppFind.savePrice(pigProduct.price);
            pig.savePigProduct(ppFind);
          } else {
            if (!product) throw ApiError.notFound("Producto no encontrado.");
            pig.savePigProduct(
              PigProduct.create({
                pigId: pig.id,
                price: pigProduct.price,
                product: product,
                quantity: pigProduct.quantity,
              })
            );
          }
        }
      }
    }

    // información para cerdas reproductoras
    if (pig.isSow() && dto.sowReproductiveHistoryPayload) {
      // permitir asignar un estado reproductivo a cerdas a partir del crecimiento y mayor = 150 días
      if (pig.cannotAssignReproductiveState()) {
        throw ApiError.badRequest(
          "Cerda reproductora no acta para asignar estado reproductivo."
        );
      }

      const sowHistory = dto.sowReproductiveHistoryPayload;

      if (sowHistory) {
        // verificar si existe el estado reproductivo
        const nextState =
          await this.reproductiveStateRepository.getByIdAndUserId({
            userId,
            id: sowHistory.reproductiveStateId,
          });
        if (!nextState) {
          throw ApiError.notFound("Estado reproductivo no encontrado.");
        }

        const reproductiveState = nextState.name as PigReproductiveState;

        // validar transacción de un estado a otro
        // if (
        //   !ALLOWED_TRANSITIONS[
        //     currentState?.name || PigReproductiveState.Rest
        //   ].includes(nextState.name)
        // ) {
        //   throw ApiError.badRequest(
        //     `Transición no permitida de ${currentState?.name} a ${nextState.name}`
        //   );
        // }

        // validar si hay un cerdo reproductor si el estado reproductivo = inseminación | gestación | lactancia
        let boar: Pig;
        if (this.validatePig(reproductiveState)) {
          if (sowHistory.boarId) {
            boar = await this.pigRepository.getByIdAndFarmId({
              farmId: pig.farm.id,
              id: sowHistory.boarId,
            });
            if (!boar) {
              throw ApiError.notFound("Cerdo reproductor no encontrado.");
            }
            if (
              [PigPhase.Neonatal, PigPhase.Weaning, PigPhase.Starter].includes(
                boar.phase.name as PigPhase
              )
            ) {
              throw ApiError.badRequest(
                "Cerdo reproductor no cumple con edad o fase permitida."
              );
            }
          }
        }

        const startDate = sowHistory.startDate
          ? new Date(sowHistory.startDate)
          : new Date();

        const { endDate } = await this.pigCalculatorUseCase.execute(
          pig.farm.id,
          nextState.name as PigReproductiveState,
          startDate
        );

        const history = ReproductiveHistory.create({
          startDate: startDate,
          endDate: endDate,
          reproductiveState: nextState,
          sowId: pig.id,
          boarId: boar ? boar.id : undefined,
        });

        if (reproductiveState === PigReproductiveState.Lactation) {
          if (sowHistory.birthPayload) {
            this.validateBirthData({
              malePiglets: sowHistory.birthPayload.malePiglets,
              femalePiglets: sowHistory.birthPayload.femalePiglets,
              deadPiglets: sowHistory.birthPayload.deadPiglets,
              averageLitterWeight: sowHistory.birthPayload.averageLitterWeight,
              birthDate: sowHistory.birthPayload.birthDate,
              description: sowHistory.birthPayload.description,
            });
          }

          const birth = Birth.create({
            reproductiveHistoryId: history.id,
            birthDate: startDate,
            malePiglets: sowHistory.birthPayload.malePiglets,
            femalePiglets: sowHistory.birthPayload.femalePiglets,
            deadPiglets: sowHistory.birthPayload.deadPiglets,
            averageLitterWeight: sowHistory.birthPayload.averageLitterWeight,
          });
          history.saveBirth(birth);

          // obtener la raza de los lechones
          const sowBreedName = pig.breed.name;
          const boarBreedName = boar?.breed.name;

          const isSameBreed = boarBreedName === sowBreedName;

          const pigletBreedName =
            boarBreedName && !isSameBreed
              ? `${sowBreedName} x ${boarBreedName}`
              : sowBreedName;

          let pigletBreed = await this.breedRepository.getByNameAndUserId({
            name: pigletBreedName,
            userId,
          });

          if (!pigletBreed) {
            pigletBreed = Breed.create({
              name: pigletBreedName,
              farmId: dto.farmId,
            });
            await this.breedRepository.create(pigletBreed);
          }

          const phasePiglet = await this.phaseRepository.getByNameAndUserId({
            name: PigPhase.Neonatal,
            userId: userId,
          });

          // crear registros para los lechones
          const pigletsConfig = [
            {
              count: sowHistory.birthPayload.femalePiglets,
              sex: PigSex.Female,
            },
            {
              count: sowHistory.birthPayload.malePiglets,
              sex: PigSex.Male,
            },
          ];
          const setting = await this.settingRepository.getByFarmId(dto.farmId);
          pigletsConfig.forEach(({ count, sex }) => {
            for (let i = 0; i < count; i++) {
              const piglet = Pig.create({
                farm: pig.farm,
                breed: pigletBreed,
                phase: phasePiglet,
                code: `P${sex === PigSex.Female ? "H" : "M"}P-${Date.now()}`,
                ageDays: 0,
                initialPrice: setting.initialPigletPrice,
                type: PigType.Production,
                sex: sex,
                birthId: birth.id,
                fatherId: boar ? boar.id : undefined,
                motherId: pig.id,
              });

              birth.savePiglet(piglet);
            }
          });
        }
        if (reproductiveState === PigReproductiveState.Weaning) {
          const phasePiglet = await this.phaseRepository.getByNameAndUserId({
            name: PigPhase.Weaning,
            userId: userId,
          });
          const currentSowReproductiveHistory =
            pig.currentSowReproductiveHistory;
          currentSowReproductiveHistory.birth.weanLitter(phasePiglet);
          pig.saveSowReproductiveHistory(currentSowReproductiveHistory);
        }
        history.saveSequential(pig.sowReproductiveHistory.length + 1);
        pig.saveSowReproductiveHistory(history);
      }
    }

    await this.pigRepository.update(pig);
    return PigMapper.fromDomainToHttpResponse(pig);
  }

  private validatePig = (reproductiveState: PigReproductiveState) => {
    const isInsemination =
      reproductiveState === PigReproductiveState.Insemination;
    const isGestation = reproductiveState === PigReproductiveState.Gestation;
    const isLactation = reproductiveState === PigReproductiveState.Lactation;
    return isInsemination || isGestation || isLactation;
  };
  private validateBirthData(dto: {
    malePiglets: number;
    femalePiglets: number;
    deadPiglets: number;
    averageLitterWeight: number;
    birthDate: string;
    description: string;
  }) {
    if (typeof dto.femalePiglets !== "number" || dto.femalePiglets < 0) {
      throw ApiError.badRequest(
        "femalePiglets: Número de lechones hembras vivas obligatorio y debe ser válido."
      );
    }

    if (typeof dto.malePiglets !== "number" || dto.malePiglets < 0) {
      throw ApiError.badRequest(
        "malePiglets: Número de lechones machos vivos obligatorio y debe ser válido."
      );
    }

    if (typeof dto.deadPiglets !== "number" || dto.deadPiglets < 0) {
      throw ApiError.badRequest(
        "deadPiglets: Número de lechones muertos obligatorio y debe ser válido."
      );
    }

    if (
      typeof dto.averageLitterWeight !== "number" ||
      dto.averageLitterWeight < 0
    ) {
      throw ApiError.badRequest(
        "averageLitterWeight: Peso promedio de la camada obligatorio y debe ser válido."
      );
    }
  }
}
