import { Prisma } from "@prisma/client";
import { Phase } from "../../domain/entities/phase.entity";

export class PhaseMapper {
  static fromDomainToHttpResponse(phase: Phase) {
    return {
      id: phase.id,
      name: phase.name,
      order: phase.order,
      farmId: phase.farmId,
      createdAt: phase.createdAt,
      updatedAt: phase.updatedAt,
    };
  }

  static toDomain(data: Prisma.PhaseGetPayload<{}>) {
    return Phase.fromPrimitives({
      id: data.id,
      name: data.name,
      order: data.order,
      farmId: data.farmId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(phase: Phase): Prisma.PhaseCreateInput {
    return {
      id: phase.id,
      name: phase.name,
      order: phase.order,
      farm: {
        connect: { id: phase.farmId },
      },
      createdAt: phase.createdAt,
      updatedAt: phase.updatedAt,
    };
  }

  static toCreateManyPersistence(
    phases: Phase[]
  ): Prisma.PhaseCreateManyInput[] {
    return phases.map((phase) => ({
      name: phase.name,
      farmId: phase.farmId,
      order: phase.order,
      createdAt: phase.createdAt,
      updatedAt: phase.updatedAt,
    }));
  }

  static toUpdatePersistence(phase: Phase): Prisma.PhaseUpdateInput {
    return {
      name: phase.name,
      farm: {
        connect: { id: phase.farmId },
      },
      updatedAt: phase.updatedAt,
    };
  }
}
