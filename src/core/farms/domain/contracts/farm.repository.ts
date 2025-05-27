import { Farm } from "../entities/farm.entity";

export interface FarmRepository {
  update(farm: Farm): Promise<void>;
  create(farm: Farm): Promise<void>;
  getAll(userId: string): Promise<Farm[]>;
  getById(id: string): Promise<Farm | null>;
  getByName(name: string): Promise<Farm | null>;
  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Farm | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Farm | null>;
}
