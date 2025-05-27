import { CategoryRepository } from "../../domain/contracts/category.repository";

export class GetAllCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string) {
    return await this.categoryRepository.getAll(userId);
  }
}
