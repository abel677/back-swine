import { PrismaClient } from "@prisma/client";
import { ReproductiveHistoryRepository } from "../../domain/contracts/reproductive-history.repository";
import { ReproductiveHistoryMapper } from "../mappers/reproductive-state-history.mapper";
import { ReproductiveHistory } from "../../domain/entities/reproductive-state-history.entity";

export class PrismaReproductiveHistory
  implements ReproductiveHistoryRepository
{
  constructor(private readonly prisma: PrismaClient) {}
  async getAllBySowId(sowId: string): Promise<ReproductiveHistory[]> {
    const entities = await this.prisma.reproductiveHistory.findMany({
      where: {
        sowId: sowId,
      },
      include: {
        reproductiveState: true,
        sow: true,
        boar: true,
        births: {
          include: {
            piglets: {
              include: {
                farm: true,
                phase: true,
                breed: true,
                birth: true,
              },
            },
            reproductiveHistory: true,
          },
        },
      },
    });
    return entities.map((entity) =>
      ReproductiveHistoryMapper.fromPersistenceToDomain(entity)
    );
  }

  async getOneBySowId(sowId: string): Promise<ReproductiveHistory | null> {
    const entity = await this.prisma.reproductiveHistory.findFirst({
      where: {
        sowId: sowId,
      },
      include: {
        reproductiveState: true,
        sow: true,
        boar: true,
        births: {
          include: {
            piglets: {
              include: {
                farm: true,
                phase: true,
                breed: true,
                birth: true,
              },
            },
            reproductiveHistory: true,
          },
        },
      },
    });
    return entity
      ? ReproductiveHistoryMapper.fromPersistenceToDomain(entity)
      : null;
  }

  async create(reproductiveHistory: ReproductiveHistory): Promise<void> {
    const data =
      ReproductiveHistoryMapper.toCreatePersistence(reproductiveHistory);
    await this.prisma.reproductiveHistory.create({ data });
  }
}
