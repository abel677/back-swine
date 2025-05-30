import { Prisma } from "@prisma/client";
import { Product } from "../../domain/entities/product.entity";
import { CategoryMapper } from "./category.mapper";
import { FarmMapper } from "../../../farms/infrastructure/mappers/farm.mapper";

export class ProductMapper {
  static fromDomainToHttpResponse(product: Product) {
    return {
      id: product.id,
      name: product.name,
      farm: FarmMapper.fromDomainToHttpResponse(product.farm),
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
        farm: true;
      };
    }>
  ) {
    return Product.fromPrimitives({
      id: data.id,
      farm: FarmMapper.toDomain(data.farm),
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
        connect: { id: product.farm.id },
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
        connect: { id: product.farm.id },
      },
      updatedAt: product.updatedAt,
    };
  }
}
