import { Prisma } from "@prisma/client";
import { ReproductiveHistory } from "../../domain/entities/reproductive-state-history.entity";
import { BirthMapper } from "./birth.mapper";
import { ReproductiveStateMapper } from "../../../farms/infrastructure/mappers/reproductive-state.mapper";

export class ReproductiveHistoryMapper {
  static fromDomainToHttpResponse(reproductiveHistory: ReproductiveHistory) {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.props.sequential,
      reproductiveState: ReproductiveStateMapper.fromDomainToHttpResponse(
        reproductiveHistory.props.reproductiveState
      ),
      startDate: reproductiveHistory.props.startDate,
      endDate: reproductiveHistory.props.endDate,
      sowId: reproductiveHistory.props.sowId,
      boarId: reproductiveHistory.props.boarId,
      births: reproductiveHistory.props.births.map((history) =>
        BirthMapper.fromDomainToHttpResponse(history)
      ),
    };
  }

  static fromPersistenceToDomain(
    data: Prisma.ReproductiveHistoryGetPayload<{
      include: {
        reproductiveState: true;
        sow: true;
        boar: true;
        births: {
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
                    births: {
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
      births: data.births.map((birth) =>
        BirthMapper.fromPersistenceToDomain(birth)
      ),
    });
  }

  static toCreatePersistence(
    reproductiveHistory: ReproductiveHistory
  ): Prisma.ReproductiveHistoryCreateInput {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.props.sequential,
      startDate: reproductiveHistory.props.startDate,
      endDate: reproductiveHistory.props.endDate,
      sow: {
        connect: {
          id: reproductiveHistory.props.sowId,
        },
      },
      boar: {
        connect: {
          id: reproductiveHistory.props.boarId,
        },
      },
      reproductiveState: {
        connect: { id: reproductiveHistory.props.reproductiveState.id },
      },
    };
  }

  static toUpdatePersistence(
    reproductiveHistory: ReproductiveHistory
  ): Prisma.ReproductiveHistoryUpdateInput {
    return {
      id: reproductiveHistory.id,
      sequential: reproductiveHistory.props.sequential,
      startDate: reproductiveHistory.props.startDate,
      endDate: reproductiveHistory.props.endDate,
      sow: {
        connect: {
          id: reproductiveHistory.props.sowId,
        },
      },
      boar: {
        connect: {
          id: reproductiveHistory.props.boarId,
        },
      },
      reproductiveState: {
        connect: { id: reproductiveHistory.props.reproductiveState.id },
      },
    };
  }
}
