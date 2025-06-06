import { ApiError } from "../../../../shared/exceptions/custom-error";
import { PhaseRepository } from "../../../domain/contracts/phase.repository";
import { Phase } from "../../../domain/entities/phase.entity";
import { CreatePhaseDto } from "../../dtos/phase/create-phase.dto";

export class CreatePhaseUseCase {
  constructor(private readonly phaseRepository: PhaseRepository) {}

  async execute(userId: string, dto: CreatePhaseDto) {
    const alreadyExist = await this.phaseRepository.getByNameAndUserId({
      name: dto.name,
      userId,
    });
    if (alreadyExist) {
      throw ApiError.badRequest("Ya existe una fase con el mismo nombre.");
    }
    const phases = await this.phaseRepository.getAll(userId);
    const phase = Phase.create({
      farmId: dto.farmId,
      name: dto.name,
      order: phases.length > 0 ? phases[0].order + 1 : 1,
    });
    await this.phaseRepository.create(phase);

    return phase;
  }
}
