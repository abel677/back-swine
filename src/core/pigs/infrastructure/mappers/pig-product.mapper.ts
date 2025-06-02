import { Prisma } from "@prisma/client";
import { PigProduct } from "../../domain/entities/pig-product.entity";
import { ProductMapper } from "../../../products/infrastructure/mappers/product.mapper";

export class PigProductMapper {
  static fromDomainToHttpResponse(pigProduct: PigProduct) {
    return {
      id: pigProduct.id,
      pigId: pigProduct.pigId,
      product: ProductMapper.fromDomainToHttpResponse(pigProduct.product),
      price: pigProduct.price,
      quantity: pigProduct.quantity,
      createdAt: pigProduct.createdAt,
      updatedAt: pigProduct.updatedAt,
    };
  }

  static fromPersistenceToDomain(
    data: Prisma.PigProductGetPayload<{
      include: {
        product: {
          include: {
            category: true;
            farm: true;
          };
        };
      };
    }>
  ) {
    return PigProduct.fromPrimitives({
      id: data.id,
      pigId: data.pigId,
      product: ProductMapper.toDomain(data.product),
      quantity: data.quantity.toNumber(),
      price: data.price.toNumber(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(
    pigProduct: PigProduct
  ): Prisma.PigProductCreateInput {
    return {
      id: pigProduct.id,
      pig: {
        connect: {
          id: pigProduct.pigId,
        },
      },
      product: {
        connect: {
          id: pigProduct.product.id,
        },
      },
      price: pigProduct.price,
      quantity: pigProduct.quantity,
      createdAt: pigProduct.createdAt,
      updatedAt: pigProduct.updatedAt,
    };
  }
  static toUpdatePersistence(pigProduct: PigProduct): Prisma.PigProductUpdateInput {
    return {
      pig: {
        connect: {
          id: pigProduct.pigId,
        },
      },
      product: {
        connect: {
          id: pigProduct.product.id,
        },
      },
      price: pigProduct.price,
      quantity: pigProduct.quantity,
      updatedAt: pigProduct.updatedAt,
    };
  }
}
