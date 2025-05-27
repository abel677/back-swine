import { Prisma } from "@prisma/client";
import { Product } from "../../domain/entities/product.entity";
import { CategoryMapper } from "./category.mapper";

export class ProductMapper {
  static fromDomainToHttpResponse(product: Product) {
    return {
      id: product.id,
      name: product.name,
      farmId: product.farmId,
      category: CategoryMapper.fromDomainToHttpResponse(product.category),
      description: product.description ?? "",
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toDomain(
    data: Prisma.ProductGetPayload<{
      include: {
        category: true;
      };
    }>
  ) {
    return Product.fromPrimitives({
      id: data.id,
      farmId: data.farmId,
      category: CategoryMapper.toDomain(data.category),
      name: data.name,
      description: data.description,
      price: data.price.toNumber(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(product: Product): Prisma.ProductCreateInput {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: {
        connect: { id: product.category.id },
      },
      farm: {
        connect: { id: product.farmId },
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
  static toUpdatePersistence(product: Product): Prisma.ProductUpdateInput {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      category: {
        connect: { id: product.category.id },
      },
      farm: {
        connect: { id: product.farmId },
      },
      updatedAt: product.updatedAt,
    };
  }
}
