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
    if (newPig.isSow() && dto.reproductiveStateId) {
      // permitir asignar un estado reproductivo a cerdas a partir del crecimiento y mayor = 150 días
      if (newPig.cannotAssignReproductiveState()) {
        throw ApiError.badRequest(
          "Cerda reproductora no acta para asignar estado reproductivo."
        );
      }

      // verificar si existe el estado reproductivo
      const reproductiveStateModel =
        await this.reproductiveStateRepository.getByIdAndUserId({
          userId,
          id: dto.reproductiveStateId,
        });
      if (!reproductiveStateModel) {
        throw ApiError.notFound("Estado reproductivo no encontrado.");
      }
      const reproductiveState =
        reproductiveStateModel.name as PigReproductiveState;

      const isInsemination =
        reproductiveState === PigReproductiveState.Insemination;
      const isGestation = reproductiveState === PigReproductiveState.Gestation;
      const isLactation = reproductiveState === PigReproductiveState.Lactation;

      // validar si hay un cerdo reproductor si el estado reproductivo = inseminación | gestación | lactancia
      let boar: Pig;
      if (isInsemination || isGestation || isLactation) {
        if (dto.boarId) {
          boar = await this.pigRepository.getByIdAndFarmId({
            farmId: dto.farmId,
            id: dto.boarId,
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

      // calcular fecha final del estado reproductivo
      const { endDate } = await this.pigCalculatorUseCase.execute(
        farm.id,
        reproductiveState,
        dto.startDate
      );

      // crear historial reproductivo
      const history = ReproductiveHistory.create({
        sowId: newPig.id,
        startDate: dto.startDate,
        endDate: endDate,
        reproductiveState: reproductiveStateModel,
        boarId: boar ? boar.id : undefined,
      });

      // crear registro de parto
      if (isLactation) {
        this.validateBirthData(dto);
        const birth = Birth.create({
          reproductiveHistoryId: history.id,
          birthDate: dto.startDate,
          malePiglets: dto.numberMalePiglets,
          femalePiglets: dto.numberFemalePiglets,
          deadPiglets: dto.numberDeadPiglets,
          averageLitterWeight: dto.averageLiterWeight,
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
            count: dto.numberFemalePiglets,
            sex: PigSex.Female,
          },
          {
            count: dto.numberMalePiglets,
            sex: PigSex.Male,
          },
        ];
        const setting = await this.settingRepository.getByFarmId(dto.farmId);
        pigletsConfig.forEach(({ count, sex }) => {
          for (let i = 0; i < count; i++) {
            const piglet = Pig.create({
              farm: farm,
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
      newPig.saveSowReproductiveHistory(history);
      await this.createSowNotificationUseCase.execute({
        farmId: dto.farmId,
        code: newPig.code,
        dateStart: dto.startDate,
        reproductiveState: reproductiveState,
      });
    }


    await this.pigRepository.create(newPig);

    return PigMapper.fromDomainToHttpResponse(newPig);
  }

  private validateBirthData(dto: CreatePigDto) {
    if (
      typeof dto.numberFemalePiglets !== "number" ||
      dto.numberFemalePiglets < 0
    ) {
      throw ApiError.badRequest(
        "numberFemalePiglets: Número de lechones hembras vivas obligatorio y debe ser válido."
      );
    }

    if (
      typeof dto.numberMalePiglets !== "number" ||
      dto.numberMalePiglets < 0
    ) {
      throw ApiError.badRequest(
        "numberMalePiglets: Número de lechones machos vivos obligatorio y debe ser válido."
      );
    }

    if (
      typeof dto.numberDeadPiglets !== "number" ||
      dto.numberDeadPiglets < 0
    ) {
      throw ApiError.badRequest(
        "numberDeadPiglets: Número de lechones muertos obligatorio y debe ser válido."
      );
    }

    if (
      typeof dto.averageLiterWeight !== "number" ||
      dto.averageLiterWeight < 0
    ) {
      throw ApiError.badRequest(
        "averageLiterWeight: Peso promedio de la camada obligatorio y debe ser válido."
      );
    }
  }
}
