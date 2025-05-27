import { Plan } from "../entities/plan.entity";

export interface PlanRepository {
  getByName(name: string): Promise<Plan | null>;
  getById(id: string): Promise<Plan | null>;
}
