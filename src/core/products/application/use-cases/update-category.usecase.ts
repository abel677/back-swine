import { ApiError } from "../../../shared/exceptions/custom-error";
import { CategoryRepository } from "../../domain/contracts/category.repository";
import { UpdateCategoryDto } from "../dtos/update-category.dto";
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const existingCategory = await this.categoryRepository.getByIdAndUserId({
      id: categoryId,
      userId: userId,
    });

    if (!existingCategory) {
      throw ApiError.notFound("Categoría no encontrada.");
    }

    if (dto.name && dto.name !== existingCategory.name) {
      const nameExists = await this.categoryRepository.getByNameAndUserId({
        name: dto.name,
        userId: userId,
      });

      if (nameExists) {
        throw ApiError.badRequest(
          "Ya existe una categoría con el mismo nombre."
        );
      }
    }

    existingCategory.update({ name: dto.name ?? existingCategory.name });

    await this.categoryRepository.update(existingCategory);

    return existingCategory;
  }
}
