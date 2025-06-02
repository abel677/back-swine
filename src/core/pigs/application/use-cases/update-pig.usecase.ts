import { BreedRepository } from "../../../breeds/domain/contracts/breed.repository";
import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { PhaseRepository } from "../../../farms/domain/contracts/phase.repository";
import { ProductRepository } from "../../../products/domain/contracts/product.repository";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigRepository } from "../../domain/contracts/pig.repository";
import { PigMapper } from "../../infrastructure/mappers/pig.mapper";
import { UpdatePigDto } from "../dtos/update-pig.dto";

export class UpdatePigUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly breedRepository: BreedRepository,
    private readonly phaseRepository: PhaseRepository,
    private readonly pigRepository: PigRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(userId: string, id: string, dto: UpdatePigDto) {
    // verificar si existe el cerdo
    const pig = await this.pigRepository.getByIdAndUserId({
      id: id,
      userId: userId,
    });
    if (!pig) throw ApiError.notFound("Cerdo no encontrado.");

    // verificar si existe la granja
    if (dto.farmId) {
      const farm = await this.farmRepository.getByIdAndUserId({
        id: dto.farmId,
        userId,
      });
      if (!farm) throw ApiError.notFound("Granja no encontrada.");
      pig.updateFarm(farm);
    }

    // verificar si existe la fase
    if (dto.phaseId && dto.phaseId !== pig.phase.id) {
      const phase = await this.phaseRepository.getByIdAndUserId({
        id: dto.phaseId,
        userId,
      });
      if (!phase) throw ApiError.notFound("Fase no encontrada.");
      pig.updatePhase(phase);
    }

    // verificar si existe la raza
    if (dto.breedId && dto.breedId !== pig.breed.id) {
      const breed = await this.breedRepository.getByIdAndUserId({
        id: dto.breedId,
        userId,
      });
      if (!breed) throw ApiError.notFound("Raza no encontrada.");
      pig.updateBreed(breed);
    }

    // verificar si ya existe un cerdo con un mismo código
    if (dto.code && dto.code !== pig.code) {
      const existingPig = await this.pigRepository.getByCodeAndFarmId({
        code: dto.code,
        farmId: dto.farmId,
      });
      if (existingPig && existingPig.id !== pig.id) {
        throw ApiError.badRequest("Ya existe otro cerdo con ese código.");
      }
      pig.updateCode(dto.code);
    }
    if (dto.ageDays) {
      pig.updateAgeDays(dto.ageDays);
    }
    if (dto.initialPrice) {
      pig.updateInitialPrice(dto.initialPrice);
    }

    // actualizar pesos
    if (dto.weights) {
      dto.weights.map((weight) => {
        pig.saveWeight(weight);
      });
    }

    // actualizar productos
    if (dto.pigProducts) {
      for (const pigProduct of dto.pigProducts) {
        if (!pigProduct.id && !pigProduct.productId)
          throw ApiError.badRequest(
            "productId: ID producto inválido o faltante."
          );

        let product = undefined;
        if (pigProduct.productId) {
          product = await this.productRepository.getByIdAndUserId({
            id: pigProduct.productId,
            userId: userId,
          });
        }

        pig.savePigProduct({
          id: pigProduct.id,
          price: pigProduct.price,
          quantity: pigProduct.quantity,
          product: product,
        });
      }
    }

    await this.pigRepository.update(pig);
    return PigMapper.fromDomainToHttpResponse(pig);
  }
}
