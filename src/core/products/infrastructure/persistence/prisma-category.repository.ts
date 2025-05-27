import { PrismaClient } from "@prisma/client";
import { CategoryRepository } from "../../domain/contracts/category.repository";
import { CategoryMapper } from "../mappers/category.mapper";
import { Category } from "../../domain/entities/category.entity";

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async update(category: Category): Promise<void> {
    await this.prisma.category.update({
      where: { id: category.id },
      data: CategoryMapper.toUpdatePersistence(category),
    });
  }

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: CategoryMapper.toCreatePersistence(category),
    });
  }
  async createMany(categories: Category[]): Promise<void> {
    await this.prisma.category.createMany({
      data: CategoryMapper.toCreateManyPersistence(categories),
    });
  }

  async getAll(userId: string): Promise<Category[]> {
    const entities = await this.prisma.category.findMany({
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
    return entities.map((entity) => CategoryMapper.toDomain(entity));
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Category | null> {
    const entity = await this.prisma.category.findFirst({
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
    return CategoryMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Category | null> {
    const entity = await this.prisma.category.findFirst({
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
    return CategoryMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<Category | null> {
    const entity = await this.prisma.category.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return CategoryMapper.toDomain(entity);
  }

  async getById(id: string): Promise<Category | null> {
    const entity = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return CategoryMapper.toDomain(entity);
  }
}
