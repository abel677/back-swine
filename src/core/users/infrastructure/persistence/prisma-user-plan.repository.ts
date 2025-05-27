import { PrismaClient } from "@prisma/client";
import { UserPlanRepository } from "../../domain/contracts/user-plan.repository";
import { UserPlan } from "../../domain/entities/user-plan.entity";

export class PrismaUserPlanRepository implements UserPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userPlan: UserPlan): Promise<void> {
    await this.prisma.userPlan.create({
      data: {
        userId: userPlan.userId,
        planId: userPlan.planId,
      },
    });
  }
}
