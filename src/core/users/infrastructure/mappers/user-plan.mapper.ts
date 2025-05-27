import { Prisma } from "@prisma/client";
import { UserPlan } from "../../domain/entities/user-plan.entity";

export class UserPlanMapper {
  static toDomain(
    data: Prisma.UserPlanGetPayload<{
      include: {};
    }>
  ): UserPlan {
    return UserPlan.fromPrimitives({
      planId: data.planId,
      userId: data.userId,
    });
  }
}
