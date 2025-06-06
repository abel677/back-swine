import { PrismaClient } from "@prisma/client";
import { PhaseRepository } from "../../domain/contracts/phase.repository";
import { PhaseMapper } from "../mappers/phase.mapper";
import { Phase } from "../../domain/entities/phase.entity";

export class PrismaPhaseRepository implements PhaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.phase.delete({ where: { id } });
  }

  async update(phase: Phase): Promise<void> {
    await this.prisma.phase.update({
      where: { id: phase.id },
      data: PhaseMapper.toUpdatePersistence(phase),
    });
  }
  async create(phase: Phase): Promise<void> {
    await this.prisma.phase.create({
      data: PhaseMapper.toCreatePersistence(phase),
    });
  }

  async createMany(phases: Phase[]): Promise<void> {
    await this.prisma.phase.createMany({
      data: PhaseMapper.toCreateManyPersistence(phases),
    });
  }

  async getAll(userId: string): Promise<Phase[]> {
    const entities = await this.prisma.phase.findMany({
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
        order: "asc",
      },
    });
    return entities.map((entity) => PhaseMapper.toDomain(entity));
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Phase | null> {
    const entity = await this.prisma.phase.findFirst({
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
    return PhaseMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Phase | null> {
    const entity = await this.prisma.phase.findFirst({
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
    return PhaseMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<Phase | null> {
    const entity = await this.prisma.phase.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return PhaseMapper.toDomain(entity);
  }

  async getById(id: string): Promise<Phase | null> {
    const entity = await this.prisma.phase.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return PhaseMapper.toDomain(entity);
  }
}
