import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { BreedRepository } from "../../domain/contracts/breed.repository";
import { Breed } from "../../domain/entities/breed.entity";
import { CreateBreedDto } from "../dtos/create-breed.dto";

export class CreateBreedUseCase {
  constructor(
    private readonly breedRepository: BreedRepository,
    private readonly farmRepository: FarmRepository
  ) {}

  async execute(userId: string, dto: CreateBreedDto) {
    const farm = await this.farmRepository.getById(dto.farmId);
    if (!farm) {
      throw ApiError.notFound("Granja no encontrada.");
    }

    const alreadyExist = await this.breedRepository.getByNameAndUserId({
      name: dto.name,
      userId: userId,
    });
    if (alreadyExist) {
      throw ApiError.badRequest("Ya existe una raza con el mismo nombre.");
    }

    const breed = Breed.create({
      name: dto.name,
      farmId: dto.farmId,
    });

    await this.breedRepository.create(breed);

    return breed;
  }
}
