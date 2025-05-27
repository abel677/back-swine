import { PlanRepository } from "../../../plans/domain/contracts/plan.repository";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { UserPlanRepository } from "../../domain/contracts/user-plan.repository";
import { UserRepository } from "../../domain/contracts/user.repository";
import { UserPlan } from "../../domain/entities/user-plan.entity";

export class AssignPlanToUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
    private readonly userPlansRepository: UserPlanRepository
  ) {}

  async execute(params: { userId: string; planName: string }) {
    const user = await this.userRepository.getById(params.userId);
    if (!user) throw ApiError.notFound("Usuario no encontrado.");

    const plan = await this.planRepository.getByName(params.planName);
    if (!plan) throw ApiError.notFound("Plan no encontrado.");

    if (user.userPlan) {
      throw ApiError.badRequest("El usuario ya tiene un plan asignado. ");
    }

    const userPlan = UserPlan.create({
      userId: user.id,
      planId: plan.id,
    });

    await this.userPlansRepository.create(userPlan);
  }
}
