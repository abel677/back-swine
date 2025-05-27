import { UserPlan } from "../entities/user-plan.entity";

export interface UserPlanRepository {
  create(userPlans: UserPlan): Promise<void>;
}
