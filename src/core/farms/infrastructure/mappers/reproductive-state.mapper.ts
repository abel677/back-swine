import { Prisma } from "@prisma/client";
import { ReproductiveState } from "../../domain/entities/reproductive-state.entity";

export class ReproductiveStateMapper {
  static fromDomainToHttpResponse(reproductiveState: ReproductiveState) {
    return {
      id: reproductiveState.id,
      name: reproductiveState.name,
      farmId: reproductiveState.farmId,
      createdAt: reproductiveState.createdAt,
      updatedAt: reproductiveState.updatedAt,
    };
  }

  static toDomain(data: Prisma.ReproductiveStateGetPayload<{}>) {
    return ReproductiveState.fromPrimitives({
      id: data.id,
      name: data.name,
      farmId: data.farmId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(
    reproductiveState: ReproductiveState
  ): Prisma.ReproductiveStateCreateInput {
    return {
      id: reproductiveState.id,
      name: reproductiveState.name,
      farm: {
        connect: { id: reproductiveState.farmId },
      },
      createdAt: reproductiveState.createdAt,
      updatedAt: reproductiveState.updatedAt,
    };
  }

  static toCreateManyPersistence(
    reproductiveStates: ReproductiveState[]
  ): Prisma.ReproductiveStateCreateManyInput[] {
    return reproductiveStates.map((reproductiveState) => ({
      name: reproductiveState.name,
      farmId: reproductiveState.farmId,
      createdAt: reproductiveState.createdAt,
      updatedAt: reproductiveState.updatedAt,
    }));
  }

  static toUpdatePersistence(
    reproductiveState: ReproductiveState
  ): Prisma.ReproductiveStateUpdateInput {
    return {
      name: reproductiveState.name,
      farm: {
        connect: { id: reproductiveState.farmId },
      },
      updatedAt: reproductiveState.updatedAt,
    };
  }
}
