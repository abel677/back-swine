import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../../farms/domain/contracts/reproductive-state.repository";
import { CreateSowNotificationsUseCase } from "../../../notifications/application/use-cases/create-sow-notification.usecase";
import { DeleteSowNotificationUseCase } from "../../../notifications/application/use-cases/delete-sow-notification.usecase";
import { DomainDateTime } from "../../../shared/domain-datetime";
import {
  PigPhase,
  PigReproductiveState,
  PigSex,
  PigState,
  PigType,
} from "../../../shared/domain/enums";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigReproductiveCalculator } from "./pig-reproductive-calculator.usecase";
import { BoarRepository } from "../../domain/contracts/boar.repository";
import { SowRepository } from "../../domain/contracts/sow.repository";
import { Boar } from "../../domain/entities/boar.entity";
import { Pig } from "../../domain/entities/pig.entity";
import { SowProps } from "../../domain/entities/sow.entity";
import { SowMapper } from "../../infrastructure/mappers/sow.mapper";
import { UpdateSowDto } from "../dtos/update-sow.dto";

export class UpdateSowUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly breedRepository: BreedRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly pigSowRepository: SowRepository,
    private readonly pigBoarRepository: BoarRepository,
    private readonly reproductiveStateRepository: ReproductiveStateRepository,
    private readonly createSowNotificationUseCase: CreateSowNotificationsUseCase,
    private readonly deleteSowNotificationUseCase: DeleteSowNotificationUseCase
  ) {}

  async execute(userId: string, sowId: string, dto: UpdateSowDto) {
    const updates: Partial<SowProps> = {};

    if (dto.farmId) {
      const farm = await this.farmRepository.getByIdAndUserId({
        id: dto.farmId,
        userId,
      });
      if (!farm) throw ApiError.notFound("Granja no encontrada.");
      updates.farm = farm;
    }

    if (dto.breedId) {
      const breed = await this.breedRepository.getByIdAndUserId({
        id: dto.breedId,
        userId,
      });
      if (!breed) throw ApiError.notFound("Raza no encontrada.");
      updates.breed = breed;
    }

    if (dto.phaseId) {
      const phase = await this.phaseRepository.getByIdAndUserId({
        id: dto.phaseId,
        userId,
      });
      if (!phase) throw ApiError.notFound("Fase no encontrada.");
      updates.phase = phase;
    }

    const sow = await this.pigSowRepository.getByIdAndFarmId({
      id: sowId,
      farmId: dto.farmId,
    });
    if (!sow) throw ApiError.notFound("Cerda reproductora no encontrada.");

    if (dto.code && dto.code !== sow.code) {
      const pig = await this.pigSowRepository.getByCodeAndFarmId({
        code: dto.code,
        farmId: dto.farmId,
      });
      if (pig)
        throw ApiError.badRequest("Ya existe un cerdo con el mismo código.");
      updates.code = dto.code;
    }

    if (dto.ageDays !== undefined) updates.ageDays = dto.ageDays;
    if (dto.initialPrice !== undefined) updates.initialPrice = dto.initialPrice;

    // actualizar campos generales
    sow.update(updates);

    // todo: si hay un estado reproductivo hay que registrar en el historial

    // verificar si existe un estado reproductivo
    if (dto.reproductiveStateId) {
      const reproductiveState =
        await this.reproductiveStateRepository.getByIdAndUserId({
          id: dto.reproductiveStateId,
          userId: userId,
        });
      if (!reproductiveState) {
        throw ApiError.badRequest("Estado reproductivo no encontrado.");
      }

      const reproductiveStateName = reproductiveState.name;
      const isInsemination =
        reproductiveStateName === PigReproductiveState.Insemination;
      const isGestation =
        reproductiveStateName === PigReproductiveState.Gestation;
      const isLactation =
        reproductiveStateName === PigReproductiveState.Lactation;
      const isWeaning = reproductiveStateName === PigReproductiveState.Weaning;

      // obtener el reproductor acorde el estado reproductivo
      let boar: Boar | undefined;
      if (dto.boarId && (isInsemination || isGestation || isLactation)) {
        boar = await this.pigBoarRepository.getByIdAndFarmId({
          id: dto.boarId,
          farmId: dto.farmId,
        });
        if (!boar) throw ApiError.badRequest("Reproductor no encontrado.");
      }

      // calcular fecha final del estado reproductivo
      const { endDate } = PigReproductiveCalculator.calculateStateTimeline(
        reproductiveState.name as PigReproductiveState,
        dto.startDate
      );

      // crear el historial reproductivo
      const history = sow.addHistoryReproductiveState(
        reproductiveState,
        dto.startDate,
        endDate,
        boar
      );

      // si el estado es destete
      if (isWeaning) {
        const phasePiglet = await this.phaseRepository.getByNameAndUserId({
          name: PigPhase.Weaning,
          userId: userId,
        });

        sow.weanLitter(phasePiglet);
      }

      // agregar partos solo si es lactancia
      if (isLactation) {
        this.validateDataBirth(dto);

        const birth = history.addBirth({
          numberBirth: 1,
          birthDate: DomainDateTime.now(),
          malePiglets: dto.numberMalePiglets,
          femalePiglets: dto.numberFemalePiglets,
          deadPiglets: dto.numberDeadPiglets,
          averageLitterWeight: dto.averageLiterWeight,
          piglets: [],
          isLitterWeaned: false,
        });

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

        const sowBreedName = sow.breed.name;
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

        const piglets = pigletsConfig.flatMap(({ count, sex }) =>
          Array.from({ length: count }).map(() =>
            Pig.create({
              farm: sow.farm,
              breed: pigletBreed,
              phase: phasePiglet,
              code: crypto.randomUUID(),
              ageDays: 0,
              initialPrice: 60,
              type: PigType.Production,
              sex: sex,
              state: PigState.Alive,
              birthId: birth.id,
              createdAt: DomainDateTime.now(),
            })
          )
        );
        birth.addPiglets(piglets);

        // administrar notificaciones
        await this.deleteSowNotificationUseCase.execute({
          farmId: sow.farm.id,
          code: sow.code,
        });
      }

      await this.createSowNotificationUseCase.execute({
        farmId: sow.farm.id,
        code: sow.code,
        dateStart: dto.startDate,
        reproductiveState: reproductiveStateName as PigReproductiveState,
      });
    }
    await this.pigSowRepository.update(sow);
    return SowMapper.fromDomainToHttpResponse(sow);
  }

  private validateDataBirth(dto: UpdateSowDto) {
    if (
      dto.numberFemalePiglets === null ||
      dto.numberFemalePiglets === undefined
    ) {
      throw ApiError.badRequest(
        "numberFemalePiglets: Número de lechones hembras vivas faltante."
      );
    }

    if (dto.numberDeadPiglets === null || dto.numberDeadPiglets === undefined) {
      throw ApiError.badRequest(
        "numberDeadPiglets: Número de lechones muertos faltante."
      );
    }

    if (
      dto.averageLiterWeight === null ||
      dto.averageLiterWeight === undefined
    ) {
      throw ApiError.badRequest(
        "averageLiterWeight: Peso promedio de la camada faltante."
      );
    }
  }
}
