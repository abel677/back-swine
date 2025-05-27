import { Breed } from "../entities/breed.entity";

export interface BreedRepository {
  delete(id: string): Promise<void>;
  update(breed: Breed): Promise<void>;
  create(breed: Breed): Promise<void>;
  createMany(breeds: Breed[]): Promise<void>;

  getAll(userId: string): Promise<Breed[]>;

  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Breed | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Breed | null>;

  getByName(name: string): Promise<Breed | null>;
  getById(id: string): Promise<Breed | null>;
}
