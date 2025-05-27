import { Prisma } from "@prisma/client";
import { Farm } from "../../domain/entities/farm.entity";

export class FarmMapper {
  static fromDomainToHttpResponse(farm: Farm) {
    return {
      id: farm.id,
      name: farm.name,
      ownerId: farm.ownerId,
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
    };
  }

  static toDomain(data: Prisma.FarmGetPayload<{}>) {
    return Farm.fromPrimitives({
      id: data.id,
      name: data.name,
      ownerId: data.ownerId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(farm: Farm): Prisma.FarmCreateInput {
    return {
      id: farm.id,
      name: farm.name,
      owner: {
        connect: { id: farm.ownerId },
      },
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
    };
  }
  static toUpdatePersistence(farm: Farm): Prisma.FarmUpdateInput {
    return {
      name: farm.name,
      owner: {
        connect: { id: farm.ownerId },
      },
      updatedAt: farm.updatedAt,
    };
  }
}
