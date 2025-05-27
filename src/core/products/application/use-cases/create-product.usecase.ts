import { ApiError } from "../../../shared/exceptions/custom-error";
import { CategoryRepository } from "../../domain/contracts/category.repository";
import { ProductRepository } from "../../domain/contracts/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { CreateProductDto } from "../dtos/create-product.dto";

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(userId: string, dto: CreateProductDto) {
    const alreadyExist = await this.productRepository.getByNameAndUserId({
      name: dto.name,
      userId: userId,
    });
    if (alreadyExist) {
      throw ApiError.badRequest("Ya existe una categoria con el mismo nombre.");
    }

    const findCategory = await this.categoryRepository.getByIdAndUserId({
      id: dto.categoryId,
      userId: userId,
    });
    if (!findCategory) {
      throw ApiError.notFound("Categoria no encontrada.");
    }

    const product = Product.create({
      farmId: dto.farmId,
      category: findCategory,
      name: dto.name,
      price: dto.price,
      description: dto.description,
    });
    await this.productRepository.create(product);
    return product;
  }
}
