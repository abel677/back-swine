import { ReproductiveStateRepository } from "../../../domain/contracts/reproductive-state.repository";

export class GetAllReproductiveStateUseCase {
  constructor(
    private readonly reproductiveStateRepository: ReproductiveStateRepository
  ) {}

  async execute(userId: string) {
    return await this.reproductiveStateRepository.getAll(userId);
  }
}
