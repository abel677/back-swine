import { ApiError } from "../../../shared/exceptions/custom-error";
import { CategoryRepository } from "../../domain/contracts/category.repository";
import { Category } from "../../domain/entities/category.entity";
import { CreateCategoryDto } from "../dtos/create-category.dto";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, dto: CreateCategoryDto) {
    const alreadyExist = await this.categoryRepository.getByNameAndUserId({
      name: dto.name,
      userId: userId,
    });
    if (alreadyExist) {
      throw ApiError.badRequest("Ya existe una categoria con el mismo nombre.");
    }
    const category = Category.create({
      farmId: dto.farmId,
      name: dto.name,
    });
    await this.categoryRepository.create(category);
    return category;
  }
}
