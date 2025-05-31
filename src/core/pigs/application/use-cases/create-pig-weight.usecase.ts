import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigRepository } from "../../domain/contracts/pig.repository";
import { PigWeight } from "../../domain/entities/pig-weight";
import { PigMapper } from "../../infrastructure/mappers/pig.mapper";
import { CreateWeightPigDto } from "../dtos/create-weight.dto";

export class CreatePigWeightUseCase {
  constructor(private readonly pigRepository: PigRepository) {}

  async execute(pigId: string, dto: CreateWeightPigDto) {
    const pig = await this.pigRepository.getById(pigId);
    if (!pig) {
      throw ApiError.notFound("Cerdo no encontrado.");
    }

    const pigWeight = PigWeight.create({
      pigId: pig.id,
      days: dto.days,
      weight: dto.weight,
    });


    await this.pigRepository.update(pig);
    return PigMapper.fromDomainToHttpResponse(pig);
  }
}
