import { Prisma } from "@prisma/client";
import { PigWeight } from "../../domain/entities/pig-weight";

export class PigWeightMapper {
  static fromDomainToHttpResponse(pigWeight: PigWeight) {
    return {
      id: pigWeight.id,
      pigId: pigWeight.pigId,
      days: pigWeight.days,
      weight: pigWeight.weight,
      createdAt: pigWeight.createdAt,
      updatedAt: pigWeight.updatedAt,
    };
  }

  static fromPersistenceToDomain(data: Prisma.PigWeightGetPayload<{}>) {
    return PigWeight.fromPrimitives({
      id: data.id,
      pigId: data.pigId,
      days: data.days,
      weight: data.weight.toNumber(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(
    pigWeight: PigWeight
  ): Prisma.PigWeightCreateInput {
    return {
      id: pigWeight.id,
      days: pigWeight.days,
      weight: pigWeight.weight,
      createdAt: pigWeight.createdAt,
      updatedAt: pigWeight.updatedAt,
      pig: {
        connect: {
          id: pigWeight.pigId,
        },
      },
    };
  }
  static toUpdatePersistence(weight: PigWeight): Prisma.PigWeightUpdateInput {
    return {
      weight: weight.weight,
      days: weight.days,
      updatedAt: weight.updatedAt,
    };
  }
}
