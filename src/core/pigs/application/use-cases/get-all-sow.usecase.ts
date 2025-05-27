import { SowRepository } from "../../domain/contracts/sow.repository";
import { SowMapper } from "../../infrastructure/mappers/sow.mapper";

export class GetAllSowUseCase {
  constructor(private readonly pigSowRepository: SowRepository) {}

  async execute(userId: string) {
    const sows = await this.pigSowRepository.getAllByUserId(userId)
    return sows.map((s) => SowMapper.fromDomainToHttpResponse(s))
  }
}
