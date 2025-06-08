import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../../farms/domain/contracts/reproductive-state.repository";
import { CreateSowNotificationsUseCase } from "../../../notifications/application/use-cases/create-sow-notification.usecase";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigReproductiveCalculatorUseCase } from "./pig-reproductive-calculator.usecase";
import { PigRepository } from "../../domain/contracts/pig.repository";
import { Pig } from "../../domain/entities/pig.entity";
import { ReproductiveHistory } from "../../domain/entities/reproductive-state-history.entity";
import { CreatePigDto } from "../dtos/create-pig.dto";
import {
  PigPhase,
  PigReproductiveState,
  PigSex,
  PigType,
} from "../../../shared/domain/enums";
import { PigMapper } from "../../infrastructure/mappers/pig.mapper";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { Birth } from "../../domain/entities/birth.entity";
import { SettingRepository } from "../../../farms/domain/contracts/setting.repository";

export class CreatePigUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly breedRepository: BreedRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly pigRepository: PigRepository,
    private readonly reproductiveStateRepository: ReproductiveStateRepository,
    private readonly pigCalculatorUseCase: PigReproductiveCalculatorUseCase,
    private readonly createSowNotificationUseCase: CreateSowNotificationsUseCase,
    private readonly settingRepository: SettingRepository
  ) {}

  async execute(userId: string, dto: CreatePigDto) {
    //1. verificar si existe la granja del usuario
    const farm = await this.farmRepository.getByIdAndUserId({
      id: dto.farmId,
      userId: userId,
    });
    if (!farm) throw ApiError.notFound("Granja no encontrada.");

    //2. verificar si existe la raza en la granja del usuario
    const breed = await this.breedRepository.getByIdAndUserId({
      id: dto.breedId,
      userId: userId,
    });
    if (!breed) throw ApiError.notFound("Raza no encontrada.");

    //3. verificar si existe la fase en la granja del usuario
    const phase = await this.phaseRepository.getByIdAndUserId({
      id: dto.phaseId,
      userId: userId,
    });
    if (!phase) throw ApiError.notFound("Fase no encontrada.");

    //4. verificar si existe un cerdo con el mismo código de etiqueta
    const pig = await this.pigRepository.getByCodeAndFarmId({
      code: dto.code,
      farmId: dto.farmId,
    });
    if (pig) {
      throw ApiError.badRequest("Ya existe un cerdo con un mismo código.");
    }

    // guardar datos generales de un cerdo
    const newPig = Pig.create({
      farm: farm,
      type: dto.type,
      sex: dto.sex,
      phase: phase,
      breed: breed,
      code: dto.code,
      ageDays: dto.ageDays,
      initialPrice: dto.initialPrice,
    });

    // información para cerdas reproductoras

    if (newPig.isSow() && dto.sowReproductiveHistory) {
      for (const sowHistory of dto.sowReproductiveHistory) {
        // permitir asignar un estado reproductivo a cerdas a partir del crecimiento y mayor = 150 días
        if (newPig.cannotAssignReproductiveState()) {
          throw ApiError.badRequest(
            "Cerda reproductora no acta para asignar estado reproductivo."
          );
        }

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
              farmId: newPig.farm.id,
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
          newPig.farm.id,
          nextState.name as PigReproductiveState,
          startDate
        );

        const history = ReproductiveHistory.create({
          startDate: startDate,
          endDate: endDate,
          reproductiveState: nextState,
          sowId: newPig.id,
          boarId: boar ? boar.id : undefined,
        });

        if (
          reproductiveState === PigReproductiveState.Lactation &&
          sowHistory.birth
        ) {
          this.validateBirthData(sowHistory.birth);

          const birth = Birth.create({
            reproductiveHistoryId: history.id,
            birthDate: startDate,
            malePiglets: sowHistory.birth.malePiglets,
            femalePiglets: sowHistory.birth.femalePiglets,
            deadPiglets: sowHistory.birth.deadPiglets,
            averageLitterWeight: sowHistory.birth.averageLitterWeight,
            description: sowHistory.birth.description,
          });
          history.saveBirth(birth);

          // obtener la raza de los lechones
          const sowBreedName = newPig.breed.name;
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
              count: sowHistory.birth.femalePiglets,
              sex: PigSex.Female,
            },
            {
              count: sowHistory.birth.malePiglets,
              sex: PigSex.Male,
            },
          ];
          const setting = await this.settingRepository.getByFarmId(dto.farmId);
          pigletsConfig.forEach(({ count, sex }) => {
            for (let i = 0; i < count; i++) {
              const piglet = Pig.create({
                farm: newPig.farm,
                breed: pigletBreed,
                phase: phasePiglet,
                code: `P${sex === PigSex.Female ? "H" : "M"}P-${Date.now()}`,
                ageDays: 0,
                initialPrice: setting.initialPigletPrice,
                type: PigType.Production,
                sex: sex,
                birthId: birth.id,
                fatherId: boar ? boar.id : undefined,
                motherId: newPig.id,
              });

              birth.savePiglet(piglet);
            }
          });
        }

        // está buscando los lechones para marcar como destetado
        if (
          reproductiveState === PigReproductiveState.Weaning &&
          sowHistory.boarId
        ) {
          const phasePiglet = await this.phaseRepository.getByNameAndUserId({
            name: PigPhase.Weaning,
            userId: userId,
          });
          const currentSowReproductiveHistory =
            newPig.currentSowReproductiveHistory;
          currentSowReproductiveHistory.birth.weanLitter(phasePiglet);
          newPig.saveSowReproductiveHistory(currentSowReproductiveHistory);
        }
        history.saveSequential(newPig.sowReproductiveHistory.length + 1);
        newPig.saveSowReproductiveHistory(history);
        await this.createSowNotificationUseCase.execute({
          farmId: newPig.farm.id,
          reproductiveState: nextState.name as PigReproductiveState,
          code: newPig.code,
          dateStart: history.startDate,
        });
      }
    }

    await this.pigRepository.create(newPig);
    return PigMapper.fromDomainToHttpResponse(newPig);
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
    boarId?: string;
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
