import { PrismaClient } from "@prisma/client";
import { PlanRepository } from "../../domain/contracts/plan.repository";
import { Plan } from "../../domain/entities/plan.entity";
import { PlanMapper } from "../mappers/plan.mapper";

export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(id: string): Promise<Plan> {
    const entity = await this.prisma.plan.findUnique({
      where: { id },
    });
    if (!entity) return null;
    return PlanMapper.toDomain({ ...entity, price: entity.price.toNumber() });
  }

  async getByName(name: string): Promise<Plan> {
    const entity = await this.prisma.plan.findFirst({
      where: { name },
    });
    if (!entity) return null;
    return PlanMapper.toDomain({ ...entity, price: entity.price.toNumber() });
  }
}
