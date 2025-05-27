import { PigPhase } from "../../../../shared/domain/enums";
import { ApiError } from "../../../../shared/exceptions/custom-error";
import { PhaseRepository } from "../../../domain/contracts/phase.repository";
import { UpdatePhaseDto } from "../../dtos/phase/update-phase.dto";

export class UpdatePhaseUseCase {
  constructor(private readonly phaseRepository: PhaseRepository) {}

  async execute(userId: string, id: string, dto: UpdatePhaseDto) {
    const alreadyExist = await this.phaseRepository.getByNameAndUserId({
      name: dto.name,
      userId,
    });
    if (alreadyExist) {
      throw ApiError.badRequest("Ya existe una fase con el mismo nombre.");
    }
    const phase = await this.phaseRepository.getByIdAndUserId({
      id: id,
      userId: userId,
    });
    if (!phase) {
      throw ApiError.notFound("Fase no encontrada.");
    }

    if (Object.values(PigPhase).includes(phase.name as PigPhase)) {
      throw ApiError.badRequest(
        "No está permitido actualizar las fases predeterminadas del sistema."
      );
    }

    phase.setName(dto.name);

    await this.phaseRepository.update(phase);

    return phase;
  }
}
