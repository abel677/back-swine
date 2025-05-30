import { Product } from "../entities/product.entity";

export interface ProductRepository {
  delete(id: string): Promise<void>;
  update(category: Product): Promise<void>;
  create(category: Product): Promise<void>;
  getAll(userId: string): Promise<Product[]>;
  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Product | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Product | null>;
  getByIdAndFarmId(params: {
    id: string;
    farmId: string;
  }): Promise<Product | null>;
  getByName(name: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
}
