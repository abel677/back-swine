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
      initialPigletPrice: 60,
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
        name: "Vacunas",
      }),
      Category.create({
        farmId: farm.id,
        name: "Balanceados",
      }),
    ];

    await this.categoryRepository.createMany(categories);

    // todo: crear los productos por defecto

    return FarmMapper.fromDomainToHttpResponse(farm);
  }
}
/**
 * 
 * 
 * [
  {
    "nombre": "Mycoplasma hyopneumoniae",
    "descripcion": "Previene la neumonía enzoótica porcina. Se aplica principalmente en lechones.",
    "precio": 2.00
  },
  {
    "nombre": "Circovirus porcino tipo 2 (PCV2)",
    "descripcion": "Protege contra enfermedades asociadas al circovirus, como el síndrome multisistémico posdestete.",
    "precio": 2.80
  },
  {
    "nombre": "Peste Porcina Clásica (PPC)",
    "descripcion": "Vacuna obligatoria en zonas endémicas. Protege contra una enfermedad viral altamente contagiosa.",
    "precio": 1.50
  },
  {
    "nombre": "Erisipela Porcina",
    "descripcion": "Previene la erisipela, que causa fiebre, lesiones en la piel y artritis en cerdos.",
    "precio": 1.70
  },
  {
    "nombre": "Leptospira",
    "descripcion": "Protege contra varias especies de Leptospira que pueden causar abortos y otros problemas reproductivos.",
    "precio": 2.30
  },
  {
    "nombre": "Parvovirus Porcino (PPV)",
    "descripcion": "Vacuna reproductiva para prevenir abortos y nacimientos muertos.",
    "precio": 2.10
  },
  {
    "nombre": "Mal Rojo (Erysipelothrix rhusiopathiae)",
    "descripcion": "Previene infecciones bacterianas que afectan piel, articulaciones y corazón.",
    "precio": 1.90
  },
  {
    "nombre": "Vacuna combinada (PPV + Leptospira + Mal Rojo)",
    "descripcion": "Protección múltiple en una sola aplicación para cerdas reproductoras.",
    "precio": 4.50
  }
]

 */
