import { Prisma } from "@prisma/client";
import { Category } from "../../domain/entities/category.entity";

export class CategoryMapper {
  static fromDomainToHttpResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      farmId: category.farmId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toDomain(data: Prisma.CategoryGetPayload<{}>) {
    return Category.fromPrimitives({
      id: data.id,
      name: data.name,
      farmId: data.farmId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(category: Category): Prisma.CategoryCreateInput {
    return {
      id: category.id,
      name: category.name,
      farm: {
        connect: { id: category.farmId },
      },
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toCreateManyPersistence(
    categories: Category[]
  ): Prisma.CategoryCreateManyInput[] {
    return categories.map((category) => ({
      name: category.name,
      farmId: category.farmId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  static toUpdatePersistence(category: Category): Prisma.CategoryUpdateInput {
    return {
      name: category.name,
      farm: {
        connect: { id: category.farmId },
      },
      updatedAt: category.updatedAt,
    };
  }
}
