import { PigReproductiveState } from "../../../../shared/domain/enums";
import { ApiError } from "../../../../shared/exceptions/custom-error";
import { ReproductiveStateRepository } from "../../../domain/contracts/reproductive-state.repository";
import { UpdateReproductiveStateDto } from "../../dtos/reproductive-state/update-reproductive-state.dto";

export class UpdateReproductiveStateUseCase {
  constructor(
    private readonly reproductiveStateRepository: ReproductiveStateRepository
  ) {}

  async execute(userId: string, id: string, dto: UpdateReproductiveStateDto) {
    const alreadyExist =
      await this.reproductiveStateRepository.getByNameAndUserId({
        name: dto.name,
        userId,
      });
    if (alreadyExist) {
      throw ApiError.badRequest(
        "Ya existe un estado reproductivo con el mismo nombre."
      );
    }
    const reproductiveState =
      await this.reproductiveStateRepository.getByIdAndUserId({
        id: id,
        userId: userId,
      });
    if (!reproductiveState) {
      throw ApiError.notFound("Estado reproductivo no encontrado.");
    }

    if (
      Object.values(PigReproductiveState).includes(
        reproductiveState.name as PigReproductiveState
      )
    ) {
      throw ApiError.badRequest(
        "No está permitido actualizar los estados reproductivos predeterminados del sistema."
      );
    }

    reproductiveState.setName(dto.name);

    await this.reproductiveStateRepository.update(reproductiveState);

    return reproductiveState;
  }
}
