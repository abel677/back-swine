import { PigRepository } from "../../domain/contracts/pig.repository";
import { ApplyProductDto } from "../dtos/apply-product-pig.dto";

export class ApplyProductPigUseCase {
  constructor(private readonly pigRepository: PigRepository) {}

  async execute(userId: string, dto: ApplyProductDto) {
    /**
     * todo: aplicar producto a cerdos
     */
    const pigs = await this.pigRepository.getAllByIdsAndUserId({
      userId: userId,
      ids: dto.pigs,
    });
    
  }
}
