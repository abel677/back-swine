import { ProductRepository } from "../../domain/contracts/product.repository";

export class GetAllProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(userId: string) {
    return await this.productRepository.getAll(userId);
  }
}
