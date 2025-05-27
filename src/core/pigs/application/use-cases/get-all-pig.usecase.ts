import { PigRepository } from "../../domain/contracts/pig.repository";
import { PigMapper } from "../../infrastructure/mappers/pig.mapper";

export class GetAllPigUseCase {
  constructor(private readonly pigRepository: PigRepository) {}

  async execute(userId: string) {
    const pigs = await this.pigRepository.getAllByUserId(userId);
    return pigs.map((pig) => PigMapper.fromDomainToHttpResponse(pig));
  }
}
