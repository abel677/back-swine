import { PrismaClient } from "@prisma/client";
import { FarmRepository } from "../../domain/contracts/farm.repository";
import { Farm } from "../../domain/entities/farm.entity";
import { FarmMapper } from "../mappers/farm.mapper";

export class PrismaFarmRepository implements FarmRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(farm: Farm): Promise<void> {
    await this.prisma.farm.update({
      where: { id: farm.id },
      data: FarmMapper.toUpdatePersistence(farm),
    });
  }

  async create(farm: Farm): Promise<void> {
    await this.prisma.farm.create({
      data: FarmMapper.toCreatePersistence(farm),
    });
  }

  async getAll(userId: string): Promise<Farm[]> {
    const entities = await this.prisma.farm.findMany({
      where: {
        OR: [{ ownerId: userId }, { farmUsers: { some: { userId: userId } } }],
      },
    });
    return entities.map((entity) => FarmMapper.toDomain(entity));
  }

  async getById(id: string): Promise<Farm | null> {
    const entity = await this.prisma.farm.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return FarmMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<Farm | null> {
    const entity = await this.prisma.farm.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return FarmMapper.toDomain(entity);
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Farm | null> {
    const { name, userId } = params;
    const entity = await this.prisma.farm.findFirst({
      where: {
        name,
        OR: [{ ownerId: userId }, { farmUsers: { some: { userId } } }],
      },
    });
    if (!entity) return null;
    return FarmMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Farm | null> {
    const { id, userId } = params;
    const entity = await this.prisma.farm.findFirst({
      where: {
        id,
        OR: [{ ownerId: userId }, { farmUsers: { some: { userId: userId } } }],
      },
    });
    if (!entity) return null;
    return FarmMapper.toDomain(entity);
  }
}
