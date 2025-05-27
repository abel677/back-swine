import { PlanRepository } from "../../domain/contracts/plan.repository";

export class GetPlanByNameUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(name: string) {
    return await this.planRepository.getByName(name);
  }
}
