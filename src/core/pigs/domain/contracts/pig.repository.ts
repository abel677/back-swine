import { Pig } from "../entities/pig.entity";

export interface PigRepository {
  delete(id: string): Promise<void>;
  update(pig: Pig): Promise<void>;
  create(pig: Pig): Promise<void>;

  createMany(pigs: Pig[]): Promise<void>;

  getAllByUserId(userId: string): Promise<Pig[]>;
  getAllByFarmId(farmId: string): Promise<Pig[]>;

  getByCodeAndFarmId(params: {
    code: string;
    farmId: string;
  }): Promise<Pig | null>;

  getByIdAndFarmId(params: { id: string; farmId: string }): Promise<Pig | null>;
  getByIdAndUserId(params: { id: string; userId: string }): Promise<Pig | null>;
  getAllByIdsAndUserId(params: {
    ids: string[];
    userId: string;
  }): Promise<Pig[] | null>;

  getByCode(code: string): Promise<Pig | null>;
  getById(id: string): Promise<Pig | null>;
}
