import { BreedRepository } from "../../domain/contracts/breed.repository";

export class GetAllBreedUseCase {
  constructor(private readonly breedRepository: BreedRepository) {}

  async execute(userId: string) {
    return await this.breedRepository.getAll(userId);
  }
}
