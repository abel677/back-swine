import { PrismaClient } from "@prisma/client";
import { Pig } from "../../domain/entities/pig.entity";
import { PigMapper } from "../mappers/pig.mapper";
import { PigRepository } from "../../domain/contracts/pig.repository";

export class PrismaPigRepository implements PigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(id: string): Promise<void> {
    await this.prisma.pig.delete({ where: { id } });
  }
  async update(pig: Pig): Promise<void> {
    const data = PigMapper.toUpdatePersistence(pig);
    await this.prisma.pig.update({ where: { id: pig.id }, data });
  }
  async create(pig: Pig): Promise<void> {
    const data = PigMapper.toCreatePersistence(pig);
    await this.prisma.pig.create({ data });
  }

  async createMany(pigs: Pig[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // consultas
  async getAllByUserId(userId: string): Promise<Pig[]> {
    const entities = await this.prisma.pig.findMany({
      where: {
        farm: {
          OR: [
            { ownerId: userId },
            { farmUsers: { some: { userId: userId } } },
          ],
        },
      },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entities.map((entity) => PigMapper.fromPersistenceToDomain(entity));
  }

  async getAllByFarmId(farmId: string): Promise<Pig[]> {
    const entities = await this.prisma.pig.findMany({
      where: { farmId: farmId },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entities.map((entity) => PigMapper.fromPersistenceToDomain(entity));
  }

  async getByCodeAndFarmId(params: {
    code: string;
    farmId: string;
  }): Promise<Pig> {
    const entity = await this.prisma.pig.findFirst({
      where: { code: params.code, farmId: params.farmId },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entity ? PigMapper.fromPersistenceToDomain(entity) : null;
  }

  async getByIdAndFarmId(params: { id: string; farmId: string }): Promise<Pig> {
    const entity = await this.prisma.pig.findFirst({
      where: { id: params.id, farmId: params.farmId },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entity ? PigMapper.fromPersistenceToDomain(entity) : null;
  }

  async getByCode(code: string): Promise<Pig> {
    const entity = await this.prisma.pig.findFirst({
      where: { code: code },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entity ? PigMapper.fromPersistenceToDomain(entity) : null;
  }

  async getById(id: string): Promise<Pig> {
    const entity = await this.prisma.pig.findFirst({
      where: { id: id },
      include: {
        farm: true,
        breed: true,
        phase: true,
        birth: true,
        sowReproductiveHistory: {
          include: {
            reproductiveState: true,
            boar: true,
            sow: true,
            births: {
              include: {
                piglets: {
                  include: {
                    farm: true,
                    phase: true,
                    breed: true,
                    birth: true,
                    mother: true,
                    father: true,
                  },
                },
                reproductiveHistory: true,
              },
              orderBy: {
                birthDate: "desc",
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        weights: true,
      },
    });
    return entity ? PigMapper.fromPersistenceToDomain(entity) : null;
  }
}
