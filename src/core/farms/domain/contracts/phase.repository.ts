import { Phase } from "../entities/phase.entity";

export interface PhaseRepository {
  delete(id: string): Promise<void>;
  update(phase: Phase): Promise<void>;
  create(phase: Phase): Promise<void>;
  createMany(phases: Phase[]): Promise<void>;

  getAll(userId: string): Promise<Phase[]>;
  getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Phase | null>;
  getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Phase | null>;
  getByName(name: string): Promise<Phase | null>;
  getById(id: string): Promise<Phase | null>;
}
