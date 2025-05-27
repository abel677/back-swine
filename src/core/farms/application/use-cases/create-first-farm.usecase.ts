import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { CategoryRepository } from "../../../products/domain/contracts/category.repository";
import { Category } from "../../../products/domain/entities/category.entity";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { FarmRepository } from "../../domain/contracts/farm.repository";
import { PhaseRepository } from "../../domain/contracts/phase.repository";
import { ReproductiveStateRepository } from "../../domain/contracts/reproductive-state.repository";
import { SettingRepository } from "../../domain/contracts/setting.repository";
import { Farm } from "../../domain/entities/farm.entity";
import { Phase } from "../../domain/entities/phase.entity";
import { ReproductiveState } from "../../domain/entities/reproductive-state.entity";
import { Setting } from "../../domain/entities/setting.entity";
import { FarmMapper } from "../../infrastructure/mappers/farm.mapper";

export class CreateFirstFarmUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly breedRepository: BreedRepository,
    private readonly reproductiveStateRepository: ReproductiveStateRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly settingRepository: SettingRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(dto: { name: string; ownerId: string }) {
    const farms = await this.farmRepository.getAll(dto.ownerId);
    if (farms.length > 0) {
      throw ApiError.badRequest("Ya se ha creado una granja al propietario.");
    }

    const alreadyExit = await this.farmRepository.getByName(dto.name);
    if (alreadyExit) {
      throw ApiError.badRequest("Ya existe una granja con el mismo nombre.");
    }

    const farm = Farm.create({
      name: dto.name,
      ownerId: dto.ownerId,
    });
    await this.farmRepository.create(farm);

    const setting = Setting.create({
      farmId: farm.id,
      matingHeatDurationDays: 3,
      inseminationDurationDays: 28,
      gestationDurationDays: 114,
      lactationDurationDays: 21,
      weaningDurationDays: 0,
      restingDurationDays: 7,
      initialPigletPrice: 60
    });

    await this.settingRepository.create(setting);

    const breeds: Breed[] = [
      Breed.create({ name: "Landrace", farmId: farm.id }),
      Breed.create({ name: "Large White", farmId: farm.id }),
      Breed.create({ name: "Duroc", farmId: farm.id }),
      Breed.create({ name: "Pietrain", farmId: farm.id }),
      Breed.create({ name: "Hampshire", farmId: farm.id }),
      Breed.create({ name: "Berkshire", farmId: farm.id }),
      Breed.create({ name: "Mangalica", farmId: farm.id }),
      Breed.create({ name: "Tamworth", farmId: farm.id }),
      Breed.create({ name: "Meishan", farmId: farm.id }),
      Breed.create({ name: "Chester White", farmId: farm.id }),
    ];
    await this.breedRepository.createMany(breeds);

    const reproductiveStates: ReproductiveState[] = [
      ReproductiveState.create({
        farmId: farm.id,
        name: "Celo",
      }),
      ReproductiveState.create({
        farmId: farm.id,
        name: "Inseminación",
      }),
      ReproductiveState.create({
        farmId: farm.id,
        name: "Gestación",
      }),
      ReproductiveState.create({
        farmId: farm.id,
        name: "Lactancia",
      }),
      ReproductiveState.create({
        farmId: farm.id,
        name: "Destete",
      }),
      ReproductiveState.create({
        farmId: farm.id,
        name: "Descanso",
      }),
    ];

    await this.reproductiveStateRepository.createMany(reproductiveStates);

    const phases: Phase[] = [
      Phase.create({
        farmId: farm.id,
        name: "Neonatal",
      }),
      Phase.create({
        farmId: farm.id,
        name: "Destete",
      }),
      Phase.create({
        farmId: farm.id,
        name: "Inicial",
      }),
      Phase.create({
        farmId: farm.id,
        name: "Crecimiento",
      }),
      Phase.create({
        farmId: farm.id,
        name: "Engorde",
      }),
      Phase.create({
        farmId: farm.id,
        name: "Finalizado",
      }),
    ];
    await this.phaseRepository.createMany(phases);

    const categories: Category[] = [
      Category.create({
        farmId: farm.id,
        name: "Vacuna",
      }),
      Category.create({
        farmId: farm.id,
        name: "Balanceado",
      }),
    ];
    await this.categoryRepository.createMany(categories);

    // todo: crear los productos por defecto

    return FarmMapper.fromDomainToHttpResponse(farm);
  }
}
