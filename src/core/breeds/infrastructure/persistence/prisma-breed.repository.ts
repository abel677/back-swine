import { PrismaClient } from "@prisma/client";
import { BreedRepository } from "../../domain/contracts/breed.repository";
import { Breed } from "../../domain/entities/breed.entity";
import { BreedMapper } from "../mappers/breed.mapper";

export class PrismaBreedRepository implements BreedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.breed.delete({
      where: {
        id: id,
      },
    });
  }

  async update(breed: Breed): Promise<void> {
    await this.prisma.breed.update({
      where: { id: breed.id },
      data: BreedMapper.toCreatePersistence(breed),
    });
  }

  async create(breed: Breed): Promise<void> {
    await this.prisma.breed.create({
      data: BreedMapper.toCreatePersistence(breed),
    });
  }

  async createMany(breeds: Breed[]): Promise<void> {
    await this.prisma.breed.createMany({
      data: BreedMapper.toCreateManyPersistence(breeds),
    });
  }

  async getAll(userId: string): Promise<Breed[]> {
    const entities = await this.prisma.breed.findMany({
      where: {
        farm: {
          OR: [
            { ownerId: userId },
            { farmUsers: { some: { userId: userId } } },
          ],
        },
      },
      include: {
        farm: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return entities.map((entity) => BreedMapper.toDomain(entity));
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Breed | null> {
    const entity = await this.prisma.breed.findFirst({
      where: {
        name: params.name,
        farm: {
          OR: [
            { ownerId: params.userId },
            { farmUsers: { some: { userId: params.userId } } },
          ],
        },
      },
      include: {
        farm: true,
      },
    });
    if (!entity) return null;
    return BreedMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Breed | null> {
    const entity = await this.prisma.breed.findFirst({
      where: {
        id: params.id,
        farm: {
          OR: [
            { ownerId: params.userId },
            { farmUsers: { some: { userId: params.userId } } },
          ],
        },
      },
      include: {
        farm: true,
      },
    });
    if (!entity) return null;
    return BreedMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<Breed | null> {
    const entity = await this.prisma.breed.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return BreedMapper.toDomain(entity);
  }

  async getById(id: string): Promise<Breed | null> {
    const entity = await this.prisma.breed.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return BreedMapper.toDomain(entity);
  }
}
