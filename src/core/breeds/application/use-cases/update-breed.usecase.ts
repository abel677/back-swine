import { ApiError } from "../../../shared/exceptions/custom-error";
import { BreedRepository } from "../../domain/contracts/breed.repository";
import { UpdateBreedDto } from "../dtos/update-breed.dto";

export class UpdateBreedUseCase {
  constructor(private readonly breedRepository: BreedRepository) {}

  async execute(userId: string, id: string, dto: UpdateBreedDto) {
    const alreadyExist = await this.breedRepository.getByNameAndUserId({
      name: dto.name,
      userId,
    });
    if (alreadyExist && alreadyExist.id !== id) {
      throw ApiError.badRequest("Ya existe una raza con el mismo nombre.");
    }
    const breed = await this.breedRepository.getByIdAndUserId({
      id: id,
      userId: userId,
    });
    if (!breed) {
      throw ApiError.notFound("Raza no encontrada.");
    }
    breed.setName(dto.name);

    await this.breedRepository.update(breed);

    return breed;
  }
}
