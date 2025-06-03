import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../../farms/domain/contracts/reproductive-state.repository";
import { SettingRepository } from "../../../farms/domain/contracts/setting.repository";
import { CreateSowNotificationsUseCase } from "../../../notifications/application/use-cases/create-sow-notification.usecase";
import { ProductRepository } from "../../../products/domain/contracts/product.repository";
import { ALLOWED_TRANSITIONS } from "../../../shared/domain/allowed-transittion";
import {
  PigPhase,
  PigReproductiveState,
  PigSex,
  PigType,
} from "../../../shared/domain/enums";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigRepository } from "../../domain/contracts/pig.repository";
import { Birth } from "../../domain/entities/birth.entity";
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
      pig.updateFarm(farm);
    }

    // verificar si existe la fase
    if (dto.phaseId && dto.phaseId !== pig.phase.id) {
      const phase = await this.phaseRepository.getByIdAndUserId({
        id: dto.phaseId,
        userId,
      });
      if (!phase) throw ApiError.notFound("Fase no encontrada.");
      pig.updatePhase(phase);
    }

    // verificar si existe la raza
    if (dto.breedId && dto.breedId !== pig.breed.id) {
      const breed = await this.breedRepository.getByIdAndUserId({
        id: dto.breedId,
        userId,
      });
      if (!breed) throw ApiError.notFound("Raza no encontrada.");
      pig.updateBreed(breed);
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
      pig.updateCode(dto.code);
    }
    if (dto.ageDays) {
      pig.updateAgeDays(dto.ageDays);
    }
    if (dto.initialPrice) {
      pig.updateInitialPrice(dto.initialPrice);
    }

    // actualizar pesos
    if (dto.weights) {
      dto.weights.map((weight) => {
        pig.saveWeight(weight);
      });
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
        }

        pig.savePigProduct({
          id: pigProduct.id,
          price: pigProduct.price,
          quantity: pigProduct.quantity,
          product: product,
        });
      }
    }

    // información de cerda reproductora
    if (pig.isSow() && dto.reproductiveStateId) {
      const currentState =
        pig.currentSowReproductiveHistory?.reproductiveState?.name ??
        PigReproductiveState.Rest;

      const nextState = await this.reproductiveStateRepository.getByIdAndUserId(
        {
          userId: userId,
          id: dto.reproductiveStateId,
        }
      );

      if (!nextState) {
        throw ApiError.notFound("Estado reproductivo no encontrado.");
      }

      if (!ALLOWED_TRANSITIONS[currentState].includes(nextState.name)) {
        throw ApiError.badRequest(
          `Transición no permitida de ${currentState} a ${nextState.name}`
        );
      }
      // calcular fecha final del estado reproductivo
      const { endDate } = await this.pigCalculatorUseCase.execute(
        pig.farm.id,
        nextState.name as PigReproductiveState,
        dto.startDate
      );

      //si está en inseminación | gestación | lactancia verificar si hay un reproductor y validar que tenga una fase permitida
      let boar: Pig = undefined;
      if (
        [
          PigReproductiveState.Insemination,
          PigReproductiveState.Gestation,
          PigReproductiveState.Lactation,
        ].includes(nextState.name as PigReproductiveState)
      ) {
        if (dto.boarId) {
          boar = await this.pigRepository.getByIdAndFarmId({
            farmId: pig.farm.id,
            id: dto.boarId,
          });
          if (!boar) {
            throw ApiError.notFound("Cerdo reproductor no encontrado.");
          }
          const disallowedPhases = [
            PigPhase.Neonatal,
            PigPhase.Weaning,
            PigPhase.Starter,
          ];

          if (disallowedPhases.includes(boar.phase.name as PigPhase)) {
            throw ApiError.badRequest(
              "Cerdo reproductor no cumple con edad o fase permitida."
            );
          }
        }
      }
      const history = ReproductiveHistory.create({
        sequential: (pig.currentSowReproductiveHistory?.sequential ?? 0) + 1,
        startDate: dto.startDate,
        endDate: endDate,
        sowId: pig.id,
        reproductiveState: nextState,
        boarId: boar ? boar.id : undefined,
      });

      switch (currentState) {
        case PigReproductiveState.Gestation:
          if (nextState.name === PigReproductiveState.Lactation) {
            const birth = Birth.create({
              reproductiveHistoryId: history.id,
              birthDate: dto.startDate,
              malePiglets: dto.numberMalePiglets,
              femalePiglets: dto.numberFemalePiglets,
              deadPiglets: dto.numberDeadPiglets,
              averageLitterWeight: dto.averageLiterWeight,
            });
            history.addBirth(birth);
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
                count: dto.numberFemalePiglets,
                sex: PigSex.Female,
              },
              {
                count: dto.numberMalePiglets,
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

                birth.addPiglet(piglet);
              }
            });
          }
          break;

        case PigReproductiveState.Lactation:
          if (nextState.name === PigReproductiveState.Weaning) {
            // cambiar el estado a destetado
          }
          break;
      }

      pig.addSowReproductiveHistory(history);
      await this.createSowNotificationUseCase.execute({
        farmId: pig.farm.id,
        code: pig.code,
        dateStart: dto.startDate,
        reproductiveState: nextState.name as PigReproductiveState,
      });
    }

    //await this.pigRepository.update(pig);
    return PigMapper.fromDomainToHttpResponse(pig);
  }
}
