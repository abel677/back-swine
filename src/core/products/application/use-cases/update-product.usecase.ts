import { FarmRepository } from "../../../farms/domain/contracts/farm.repository";
import { Farm } from "../../../farms/domain/entities/farm.entity";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { CategoryRepository } from "../../domain/contracts/category.repository";
import { ProductRepository } from "../../domain/contracts/product.repository";
import { Category } from "../../domain/entities/category.entity";
import { UpdateProductDto } from "../dtos/update-product.dto";

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly farmRepository: FarmRepository
  ) {}

  async execute(userId: string, productId: string, dto: UpdateProductDto) {
    
    const existingProduct = await this.productRepository.getByIdAndUserId({
      id: productId,
      userId: userId,
    });

    if (!existingProduct) {
      throw ApiError.notFound("Producto no encontrado.");
    }

    if (dto.name && dto.name !== existingProduct.name) {
      const nameExists = await this.productRepository.getByNameAndUserId({
        name: dto.name,
        userId: userId,
      });

      if (nameExists) {
        throw ApiError.badRequest("Ya existe un producto con el mismo nombre.");
      }
    }

    let farm: Farm;
    if (dto.categoryId) {
      farm = await this.farmRepository.getByIdAndUserId({
        id: dto.farmId,
        userId: userId,
      });

      if (!farm) {
        throw ApiError.notFound("Categoría no encontrada.");
      }
    } else {
      farm = existingProduct.farm;
    }

    let category: Category;
    if (dto.categoryId) {
      category = await this.categoryRepository.getByIdAndUserId({
        id: dto.categoryId,
        userId: userId,
      });

      if (!category) {
        throw ApiError.notFound("Categoría no encontrada.");
      }
    } else {
      category = existingProduct.category;
    }

    existingProduct.update({
      name: dto.name ?? existingProduct.name,
      description: dto.description ?? existingProduct.description,
      price: dto.price ?? existingProduct.price,
      category: category,
      farm: farm,
    });

    

    await this.productRepository.update(existingProduct);

    return existingProduct;
  }
}
