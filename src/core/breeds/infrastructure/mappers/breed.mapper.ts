import { Prisma } from "@prisma/client";
import { Breed } from "../../domain/entities/breed.entity";

export class BreedMapper {
  static fromDomainToHttpResponse(breed: Breed) {
    return {
      id: breed.id,
      name: breed.name,
      farmId: breed.farmId,
      createdAt: breed.createdAt,
      updatedAt: breed.updatedAt,
    };
  }

  static toDomain(data: Prisma.BreedGetPayload<{}>) {
    return Breed.fromPrimitives({
      id: data.id,
      name: data.name,
      farmId: data.farmId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreateManyPersistence(
    breeds: Breed[]
  ): Prisma.BreedCreateManyInput[] {
    return breeds.map((breed) => ({
      name: breed.name,
      farmId: breed.farmId,
      createdAt: breed.createdAt,
      updatedAt: breed.updatedAt,
    }));
  }

  static toCreatePersistence(breed: Breed): Prisma.BreedCreateInput {
    return {
      id: breed.id,
      name: breed.name,
      farm: {
        connect: { id: breed.farmId },
      },
      createdAt: breed.createdAt,
      updatedAt: breed.updatedAt,
    };
  }
  static toUpdatePersistence(breed: Breed): Prisma.BreedUpdateInput {
    return {
      name: breed.name,
      farm: {
        connect: { id: breed.farmId },
      },
      updatedAt: breed.updatedAt,
    };
  }
}
