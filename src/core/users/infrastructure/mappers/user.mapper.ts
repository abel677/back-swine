import { Prisma } from "@prisma/client";
import { User } from "../../domain/entities/user.entity";
import { UserPlanMapper } from "./user-plan.mapper";

export class UserMapper {
  static toDomain(
    data: Prisma.UserGetPayload<{
      include: {
        userPlan: true;
      };
    }>
  ): User {
    return User.fromPrimitives({
      id: data.id,
      //name: data.name,
      email: data.email,
      password: data.password,
      isOwner: data.isOwner,
      validated: data.validated,
      verificationToken: data.verificationToken,
      state: data.state,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userPlan: data.userPlan ? UserPlanMapper.toDomain(data.userPlan) : null,
    });
  }

  static toPersistence(user: User): Prisma.UserCreateInput {
    return {
      id: user.id,
      //name: user.name,
      email: user.email,
      password: user.password,
      isOwner: user.isOwner,
      validated: user.validated,
      verificationToken: user.verificationToken,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
