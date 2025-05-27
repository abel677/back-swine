import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "../../domain/contracts/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { ProductMapper } from "../mappers/product.mapper";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async update(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.id },
      data: ProductMapper.toUpdatePersistence(product),
    });
  }

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: ProductMapper.toCreatePersistence(product),
    });
  }

  async getAll(userId: string): Promise<Product[]> {
    const entities = await this.prisma.product.findMany({
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
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return entities.map((entity) => ProductMapper.toDomain(entity));
  }

  async getByNameAndUserId(params: {
    name: string;
    userId: string;
  }): Promise<Product | null> {
    const entity = await this.prisma.product.findFirst({
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
      include: {
        category: true,
      },
    });
    if (!entity) return null;
    return ProductMapper.toDomain(entity);
  }

  async getByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<Product | null> {
    const entity = await this.prisma.product.findFirst({
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
      include: {
        category: true,
      },
    });
    if (!entity) return null;
    return ProductMapper.toDomain(entity);
  }

  async getByName(name: string): Promise<Product | null> {
    const entity = await this.prisma.product.findFirst({
      where: { name },
      include: {
        category: true,
      },
    });
    if (!entity) return null;
    return ProductMapper.toDomain(entity);
  }

  async getById(id: string): Promise<Product | null> {
    const entity = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!entity) return null;
    return ProductMapper.toDomain(entity);
  }
}
