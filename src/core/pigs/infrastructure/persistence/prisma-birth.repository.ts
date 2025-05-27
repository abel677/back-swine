import { PrismaClient } from "@prisma/client";
import { BirthRepository } from "../../domain/contracts/birth.repository";
import { Birth } from "../../domain/entities/birth.entity";
import { BirthMapper } from "../mappers/birth.mapper";

export class PrismaBirthRepository implements BirthRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async create(birth: Birth): Promise<void> {
    const data = BirthMapper.toCreatePersistence(birth);
    await this.prisma.birth.create({ data });
  }

  async createMany(births: Birth[]): Promise<void> {
    const data = BirthMapper.toCreateManyPersistence(births);
    await this.prisma.birth.createMany({ data });
  }
}
