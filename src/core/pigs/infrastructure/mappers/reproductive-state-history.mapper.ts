import { Prisma } from "@prisma/client";
import { ReproductiveHistory } from "../../domain/entities/reproductive-state-history.entity";
import { BirthMapper } from "./birth.mapper";
import { ReproductiveStateMapper } from "../../../farms/infrastructure/mappers/reproductive-state.mapper";

export class ReproductiveHistoryMapper {
  static fromDomainToHttpResponse(reproductiveHistory: ReproductiveHistory) {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.sequential,
      reproductiveState: ReproductiveStateMapper.fromDomainToHttpResponse(
        reproductiveHistory.reproductiveState
      ),
      startDate: reproductiveHistory.startDate,
      endDate: reproductiveHistory.endDate,
      sowId: reproductiveHistory.sowId,
      boarId: reproductiveHistory.boarId,
      birth: reproductiveHistory.birth
        ? BirthMapper.fromDomainToHttpResponse(reproductiveHistory.birth)
        : null,
    };
  }

  static fromPersistenceToDomain(
    data: Prisma.ReproductiveHistoryGetPayload<{
      include: {
        reproductiveState: true;
        sow: true;
        boar: true;
        birth: {
          include: {
            piglets: {
              include: {
                farm: true;
                phase: true;
                breed: true;
                birth: true;
                weights: true;
                sowReproductiveHistory: {
                  include: {
                    reproductiveState: true;
                    sow: true;
                    boar: true;
                    birth: {
                      include: {
                        piglets: {
                          include: {
                            farm: true;
                            phase: true;
                            breed: true;
                            birth: true;
                            weights: true;
                          };
                        };
                        reproductiveHistory: true;
                      };
                    };
                  };
                };
                products: {
                  include: {
                    product: {
                      include: {
                        category: true;
                        farm: true;
                      };
                    };
                  };
                };
              };
            };
            reproductiveHistory: true;
          };
        };
      };
    }>
  ): ReproductiveHistory {
    return ReproductiveHistory.fromPrimitives({
      id: data.id,
      sequential: data.sequential,
      reproductiveState: ReproductiveStateMapper.toDomain(
        data.reproductiveState
      ),
      startDate: data.startDate,
      endDate: data.endDate,
      sowId: data.sowId,
      boarId: data.boarId,
      birth: data.birth
        ? BirthMapper.fromPersistenceToDomain(data.birth)
        : null,
    });
  }

  static toCreatePersistence(
    reproductiveHistory: ReproductiveHistory
  ): Prisma.ReproductiveHistoryCreateInput {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.sequential,
      startDate: reproductiveHistory.startDate,
      endDate: reproductiveHistory.endDate,
      sow: {
        connect: {
          id: reproductiveHistory.sowId,
        },
      },
      boar: {
        connect: {
          id: reproductiveHistory.boarId,
        },
      },
      reproductiveState: {
        connect: { id: reproductiveHistory.reproductiveState.id },
      },
    };
  }

  static toUpdatePersistence(
    reproductiveHistory: ReproductiveHistory
  ): Prisma.ReproductiveHistoryUpdateInput {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.sequential,
      startDate: reproductiveHistory.startDate,
      endDate: reproductiveHistory.endDate,
      sow: {
        connect: {
          id: reproductiveHistory.sowId,
        },
      },
      boar: {
        connect: {
          id: reproductiveHistory.boarId,
        },
      },
      reproductiveState: {
        connect: { id: reproductiveHistory.reproductiveState.id },
      },
    };
  }
}
