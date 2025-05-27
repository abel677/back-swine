import { Category } from "../entities/category.entity";

export interface CategoryRepository {
  delete(id: string): Promise<void>;
  update(category: Category): Promise<void>;
  create(category: Category): Promise<void>;
  createMany(categories: Category[]): Promise<void>;

  getAll(userId: string): Promise<Category[]>;
  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Category | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Category | null>;
  getByName(name: string): Promise<Category | null>;
  getById(id: string): Promise<Category | null>;
}
