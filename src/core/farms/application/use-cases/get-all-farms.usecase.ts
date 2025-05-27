import { FarmRepository } from "../../domain/contracts/farm.repository";
import { FarmMapper } from "../../infrastructure/mappers/farm.mapper";

export class GetAllFarmsUseCase {
  constructor(private readonly farmRepository: FarmRepository) {}

  async execute(userId: string) {
    const farms = await this.farmRepository.getAll(userId);
    return farms.map((farm) => FarmMapper.fromDomainToHttpResponse(farm));
  }
}
