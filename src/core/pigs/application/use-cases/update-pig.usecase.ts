import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../../farms/domain/contracts/reproductive-state.repository";
import { SettingRepository } from "../../../farms/domain/contracts/setting.repository";
import { CreateSowNotificationsUseCase } from "../../../notifications/application/use-cases/create-sow-notification.usecase";
import { DeleteSowNotificationUseCase } from "../../../notifications/application/use-cases/delete-sow-notification.usecase";
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
    private readonly deleteSowNotificationUseCase: DeleteSowNotificationUseCase,
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

    // todo: cambiar por fecha de nacimiento
    // edad en días
    if (dto.ageDays) {
      pig.saveAgeDays(dto.ageDays);
    }

    if (dto.initialPrice) {
      pig.saveInitialPrice(dto.initialPrice);
    }

    const farmId = dto.farmId ?? pig.farm.id;

    // verificar si ya existe un cerdo con un mismo código
    if (dto.code && dto.code !== pig.code) {
      const existingPig = await this.pigRepository.getByCodeAndFarmId({
        code: dto.code,
        farmId,
      });

      if (existingPig && existingPig.id !== pig.id) {
        throw ApiError.badRequest(
          "La etiqueta ingresada ya está en uso por otro cerdo en esta granja."
        );
      }
      pig.saveCode(dto.code);
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

    // todo: Cerdas reproductoras
    if (pig.isSow() && dto.sowReproductiveHistory) {
      // permitir asignar un estado reproductivo a cerdas a partir del crecimiento y mayor = 150 días
      if (pig.cannotAssignReproductiveState()) {
        throw ApiError.badRequest(
          "Cerda reproductora no acta para asignar estado reproductivo."
        );
      }

      // actualizar el historial de la cerda reproductora
      // la reproductora tiene historiales de cada cambio de estado reproductivo
      // estos historiales para el caso de lactancia, registrar los datos del parto
      for (const sowHistory of dto.sowReproductiveHistory.reverse()) {
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
              farmId: farmId,
              id: sowHistory.boarId,
            });
            if (!boar) {
              throw ApiError.notFound("Cerdo reproductor no encontrado.");
            }
            if (boar.cannotAssignBoar()) {
              throw ApiError.badRequest(
                "Cerdo reproductor no cumple con edad o fase permitida."
              );
            }
          }
        }

        // calcular la fecha final acorde al estado reproductivo
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

        // estado reproductivo Lactancia
        if (reproductiveState === PigReproductiveState.Lactation) {
          if (sowHistory.birth) {
            // validar los datos del parto
            this.validateBirthData({
              malePiglets: sowHistory.birth.malePiglets,
              femalePiglets: sowHistory.birth.femalePiglets,
              deadPiglets: sowHistory.birth.deadPiglets,
              averageLitterWeight: sowHistory.birth.averageLitterWeight,
              birthDate: sowHistory.birth.birthDate,
            });

            // crear registro de parto
            const birth = Birth.create({
              reproductiveHistoryId: history.id,
              birthDate: startDate,
              malePiglets: sowHistory.birth.malePiglets,
              femalePiglets: sowHistory.birth.femalePiglets,
              deadPiglets: sowHistory.birth.deadPiglets,
              averageLitterWeight: sowHistory.birth.averageLitterWeight,
            });

            // obtener última secuencia de parto
            const currentBirth = pig.currentSowReproductiveHistory.birth;
            if (currentBirth) {
              birth.saveNumberBirth(currentBirth.numberBirth + 1);
            }

            // guardar registro del parto
            history.saveBirth(birth);

            // obtener la raza de los lechones, si existe un reproductor se genera una combinación
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
                farmId: farmId,
              });
              await this.breedRepository.create(pigletBreed);
            }

            // obtener la fase para los lechones
            const phasePiglet = await this.phaseRepository.getByNameAndUserId({
              name: PigPhase.Neonatal,
              userId: userId,
            });

            // crear registros para los lechones
            const pigletsConfig = [
              {
                count: sowHistory.birth.femalePiglets,
                sex: PigSex.Female,
              },
              {
                count: sowHistory.birth.malePiglets,
                sex: PigSex.Male,
              },
            ];
            const setting = await this.settingRepository.getByFarmId(
              dto.farmId
            );
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
                // guardar lechones del parto
                birth.savePiglet(piglet);
              }
            });
          }
        }

        // estado reproductivo es Destete
        if (reproductiveState === PigReproductiveState.Weaning) {
          // verificar si la cerda está con historial reproductivo = Lactancia
          const birth = pig.currentSowReproductiveHistory.birth;
          if (!birth)
            throw ApiError.badRequest(
              "La cerda no registra historial de parto."
            );

          // obtener la fase destete para asignar a los lechones a destetar
          const phasePiglet = await this.phaseRepository.getByNameAndUserId({
            name: PigPhase.Weaning,
            userId: userId,
          });

          pig.currentSowReproductiveHistory.birth.weanLitter(phasePiglet);
          pig.saveSowReproductiveHistory(pig.currentSowReproductiveHistory);
        }

        history.saveSequential(pig.sowReproductiveHistory.length + 1);
        // guardar historial
        pig.saveSowReproductiveHistory(history);

        // eliminar alertas anteriores
        await this.deleteSowNotificationUseCase.execute({
          farmId: pig.farm.id,
          code: pig.code,
        });
        // crear nuevas notificaciones para el estado reproductivo
        await this.createSowNotificationUseCase.execute({
          farmId: pig.farm.id,
          code: pig.code,
          reproductiveState: nextState.name as PigReproductiveState,
          dateStart: history.startDate,
        });
      }
    }

    await this.pigRepository.update(pig);
    return PigMapper.fromDomainToHttpResponse(pig);
  }

  private validatePig = (state: PigReproductiveState): boolean => {
    return [
      PigReproductiveState.Insemination,
      PigReproductiveState.Gestation,
      PigReproductiveState.Lactation,
    ].includes(state);
  };

  private validateBirthData(dto: {
    malePiglets: number;
    femalePiglets: number;
    deadPiglets: number;
    averageLitterWeight: number;
    birthDate: string;
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
