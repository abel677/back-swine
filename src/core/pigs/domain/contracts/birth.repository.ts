import { Birth } from "../entities/birth.entity";

export interface BirthRepository {
  create(birth: Birth): Promise<void>;
  createMany(births: Birth[]): Promise<void>;
}
