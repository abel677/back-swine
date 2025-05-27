import { ReproductiveState } from "../entities/reproductive-state.entity";

export interface ReproductiveStateRepository {
  delete(id: string): Promise<void>;
  update(reproductiveState: ReproductiveState): Promise<void>;
  create(reproductiveState: ReproductiveState): Promise<void>;
  createMany(reproductiveStates: ReproductiveState[]): Promise<void>;

  getAll(userId: string): Promise<ReproductiveState[]>;
  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<ReproductiveState | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<ReproductiveState | null>;
  getByName(name: string): Promise<ReproductiveState | null>;
  getById(id: string): Promise<ReproductiveState | null>;
}
