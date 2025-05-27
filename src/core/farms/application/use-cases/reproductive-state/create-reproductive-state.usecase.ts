import { ApiError } from "../../../../shared/exceptions/custom-error";
import { ReproductiveStateRepository } from "../../../domain/contracts/reproductive-state.repository";
import { ReproductiveState } from "../../../domain/entities/reproductive-state.entity";

export class CreateReproductiveStateUseCase {
  constructor(
    private readonly reproductiveStateRepository: ReproductiveStateRepository
  ) {}

  async execute(
    userId: string,
    dto: {
      name: string;
      farmId: string;
    }
  ) {
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
    const reproductiveState = ReproductiveState.create({
      farmId: dto.farmId,
      name: dto.name,
    });
    await this.reproductiveStateRepository.create(reproductiveState);

    return reproductiveState;
  }
}
