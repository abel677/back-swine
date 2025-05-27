import { PrismaClient } from "@prisma/client";
import { ReproductiveStateRepository } from "../../domain/contracts/reproductive-state.repository";
import { ReproductiveState } from "../../domain/entities/reproductive-state.entity";
import { ReproductiveStateMapper } from "../mappers/reproductive-state.mapper";

export class PrismaReproductiveStateRepository
  implements ReproductiveStateRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.reproductiveState.delete({ where: { id } });
  }

  async update(reproductiveState: ReproductiveState): Promise<void> {
    await this.prisma.reproductiveState.update({
      where: { id: reproductiveState.id },
      data: ReproductiveStateMapper.toUpdatePersistence(reproductiveState),
    });
  }
  async create(reproductiveState: ReproductiveState): Promise<void> {
    await this.prisma.reproductiveState.create({
      data: ReproductiveStateMapper.toCreatePersistence(reproductiveState),
    });
  }

  async createMany(reproductiveStates: ReproductiveState[]): Promise<void> {
    await this.prisma.reproductiveState.createMany({
      data: ReproductiveStateMapper.toCreateManyPersistence(reproductiveStates),
    });
  }

  async getAll(userId: string): Promise<ReproductiveState[]> {
    const entities = await this.prisma.reproductiveState.findMany({
      where: {
        farm: {
          OR: [
            {
              ownerId: userId,
            },
            { farmUsers: { some: { userId: userId } } },
          ],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return entities.map((entity) => ReproductiveStateMapper.toDomain(entity));
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<ReproductiveState | null> {
    const entity = await this.prisma.reproductiveState.findFirst({
      where: {
        name: params.name,
        farm: {
          OR: [
            {
              ownerId: params.userId,
            },
            { farmUsers: { some: { userId: params.userId } } },
          ],
        },
      },
    });
    if (!entity) return null;
    return ReproductiveStateMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<ReproductiveState | null> {
    const entity = await this.prisma.reproductiveState.findFirst({
      where: {
        id: params.id,
        farm: {
          OR: [
            {
              ownerId: params.userId,
            },
            { farmUsers: { some: { userId: params.userId } } },
          ],
        },
      },
    });
    if (!entity) return null;
    return ReproductiveStateMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<ReproductiveState | null> {
    const entity = await this.prisma.reproductiveState.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return ReproductiveStateMapper.toDomain(entity);
  }

  async getById(id: string): Promise<ReproductiveState | null> {
    const entity = await this.prisma.reproductiveState.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return ReproductiveStateMapper.toDomain(entity);
  }
}
