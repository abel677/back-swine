import { PhaseRepository } from "../../../domain/contracts/phase.repository";

export class GetAllPhaseUseCase {
  constructor(private readonly phaseRepository: PhaseRepository) {}

  async execute(userId: string) {
    return await this.phaseRepository.getAll(userId);
  }
}
