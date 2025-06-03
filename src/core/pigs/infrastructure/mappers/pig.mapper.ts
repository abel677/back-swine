import { Prisma } from "@prisma/client";
import { BreedMapper } from "../../../breeds/infrastructure/mappers/breed.mapper";
import { FarmMapper } from "../../../farms/infrastructure/mappers/farm.mapper";
import { PhaseMapper } from "../../../farms/infrastructure/mappers/phase.mapper";
import { PigSex, PigState, PigType } from "../../../shared/domain/enums";
import { Pig } from "../../domain/entities/pig.entity";
import { PigWeightMapper } from "./pig-weight.mapper";
import { ReproductiveHistoryMapper } from "./reproductive-state-history.mapper";
import { PigProductMapper } from "./pig-product.mapper";

export class PigMapper {
  static fromDomainToHttpResponse(pig: Pig) {
    const currentSowReproductiveHistory =
      pig.sowReproductiveHistory?.length > 0
        ? pig.sowReproductiveHistory[0]
        : null;

    return {
      id: pig.id,
      farm: FarmMapper.fromDomainToHttpResponse(pig.farm),
      breed: BreedMapper.fromDomainToHttpResponse(pig.breed),
      phase: PhaseMapper.fromDomainToHttpResponse(pig.phase),
      type: pig.type,
      sex: pig.sex,
      code: pig.code,
      ageDays: pig.ageDays,
      initialPrice: pig.initialPrice,
      investedPrice: pig.investedPrice,
      state: pig.state,
      motherId: pig.motherId ?? null,
      fatherId: pig.fatherId ?? null,
      weights: pig.weights?.map((w) =>
        PigWeightMapper.fromDomainToHttpResponse(w)
      ),
      pigProducts: pig.pigProducts?.map((p) =>
        PigProductMapper.fromDomainToHttpResponse(p)
      ),
      sowReproductiveHistory: pig.sowReproductiveHistory?.map((re) =>
        ReproductiveHistoryMapper.fromDomainToHttpResponse(re)
      ),
      currentSowReproductiveHistory: currentSowReproductiveHistory
        ? ReproductiveHistoryMapper.fromDomainToHttpResponse(
            currentSowReproductiveHistory
          )
        : null,
      createdAt: pig.createdAt,
      updatedAt: pig.updatedAt,
    };
  }

  static fromPersistenceToDomain(
    data: Prisma.PigGetPayload<{
      include: {
        farm: true;
        breed: true;
        phase: true;
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
    }>
  ): Pig {
    return Pig.fromPrimitives({
      id: data.id,
      farm: FarmMapper.toDomain(data.farm),
      breed: BreedMapper.toDomain(data.breed),
      phase: PhaseMapper.toDomain(data.phase),

      type: data.type as PigType.Reproduction,
      sex: data.sex as PigSex.Male,

      code: data.code,
      ageDays: data.ageDays,
      initialPrice: data.initialPrice.toNumber(),
      investedPrice: data.investedPrice.toNumber(),
      state: data.state as PigState,

      motherId: data.motherId,
      fatherId: data.fatherId,

      birthId: data.birthId,
      weights: data.weights?.map((w) =>
        PigWeightMapper.fromPersistenceToDomain(w)
      ),
      pigProducts: data.products?.map((p) =>
        PigProductMapper.fromPersistenceToDomain(p)
      ),
      sowReproductiveHistory: data.sowReproductiveHistory?.map((r) =>
        ReproductiveHistoryMapper.fromPersistenceToDomain(r)
      ),
      currentSowReproductiveHistory:
        data.sowReproductiveHistory?.length > 0
          ? ReproductiveHistoryMapper.fromPersistenceToDomain(
              data.sowReproductiveHistory[0]
            )
          : undefined,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(pig: Pig): Prisma.PigCreateInput {
    return {
      id: pig.id,
      farm: { connect: { id: pig.farm.id } },
      type: pig.type,
      sex: pig.sex,
      phase: { connect: { id: pig.phase.id } },
      breed: { connect: { id: pig.breed.id } },
      code: pig.code,
      ageDays: pig.ageDays,
      initialPrice: pig.initialPrice,
      investedPrice: pig.investedPrice,
      state: pig.state,

      mother: pig.motherId ? { connect: { id: pig.motherId } } : undefined,
      father: pig.fatherId ? { connect: { id: pig.fatherId } } : undefined,
      birth: pig.birthId ? { connect: { id: pig.birthId } } : undefined,

      sowReproductiveHistory: {
        create: pig.sowReproductiveHistory?.map((history) => ({
          id: history.id,
          sequential: history.sequential,
          startDate: history.startDate,
          endDate: history.endDate,
          reproductiveState: {
            connect: { id: history.reproductiveState.id },
          },
          boar: history.boarId
            ? { connect: { id: history.boarId } }
            : undefined,
          birth: history.birth
            ? {
                create: {
                  id: history.birth.id,
                  numberBirth: history.birth.numberBirth,
                  birthDate: history.birth.birthDate,
                  malePiglets: history.birth.malePiglets,
                  femalePiglets: history.birth.femalePiglets,
                  deadPiglets: history.birth.deadPiglets,
                  averageLitterWeight: history.birth.averageLitterWeight,
                  isLitterWeaned: history.birth.isLitterWeaned,
                  createdAt: history.birth.createdAt,
                  updatedAt: history.birth.updatedAt,
                  piglets: {
                    create: history.birth.piglets.map((piglet) => ({
                      id: piglet.id,
                      code: piglet.code,
                      type: piglet.type,
                      sex: piglet.sex,
                      ageDays: piglet.ageDays,
                      initialPrice: piglet.initialPrice,
                      investedPrice: piglet.investedPrice,
                      state: piglet.state,
                      mother: {
                        connect: {
                          id: history.sowId,
                        },
                      },
                      father: history.boarId
                        ? {
                            connect: {
                              id: history.boarId,
                            },
                          }
                        : undefined,
                      farm: { connect: { id: piglet.farm.id } },
                      breed: { connect: { id: piglet.breed.id } },
                      phase: { connect: { id: piglet.phase.id } },
                      createdAt: piglet.createdAt,
                      updatedAt: piglet.updatedAt,
                    })),
                  },
                },
              }
            : undefined,
        })),
      },

      createdAt: pig.createdAt,
      updatedAt: pig.updatedAt,
    };
  }
  static toUpdatePersistence(pig: Pig): Prisma.PigUpdateInput {
    return {
      farm: { connect: { id: pig.farm.id } },
      type: pig.type,
      sex: pig.sex,
      phase: { connect: { id: pig.phase.id } },
      breed: { connect: { id: pig.breed.id } },
      id: pig.id,
      code: pig.code,
      ageDays: pig.ageDays,
      initialPrice: pig.initialPrice,
      investedPrice: pig.investedPrice,
      state: pig.state,
      updatedAt: pig.updatedAt,
      weights: {
        upsert: pig.weights.map((w) => ({
          where: { id: w.id },
          update: PigWeightMapper.toUpdatePersistence(w),
          create: {
            id: w.id,
            days: w.days,
            weight: w.weight,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
          },
        })),
      },
      products: {
        upsert: pig.pigProducts.map((p) => {
          return {
            where: { id: p.id },
            update: {
              quantity: p.quantity,
              price: p.price,
              product: p.product
                ? {
                    connect: {
                      id: p.product.id,
                    },
                  }
                : undefined,
              updatedAt: p.updatedAt,
            },
            create: {
              id: p.id,
              quantity: p.quantity,
              price: p.price,
              product: p.product
                ? {
                    connect: {
                      id: p.product.id,
                    },
                  }
                : undefined,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            },
          };
        }),
      },
      sowReproductiveHistory: {
        upsert: pig.sowReproductiveHistory?.map((history) => {
          return {
            where: { id: history.id },
            update: {
              sequential: history.sequential,
              startDate: history.startDate,
              endDate: history.endDate,
              reproductiveState: history.reproductiveState
                ? {
                    connect: { id: history.reproductiveState.id },
                  }
                : undefined,
              boar: history.boarId
                ? { connect: { id: history.boarId } }
                : undefined,
              birth: history.birth
                ? {
                    update: {
                      numberBirth: history.birth.numberBirth,
                      birthDate: history.birth.birthDate,
                      malePiglets: history.birth.malePiglets,
                      femalePiglets: history.birth.femalePiglets,
                      deadPiglets: history.birth.deadPiglets,
                      averageLitterWeight: history.birth.averageLitterWeight,
                      isLitterWeaned: history.birth.isLitterWeaned,
                      updatedAt: history.birth.updatedAt,
                      piglets: {
                        upsert: history.birth.piglets?.map((piglet) => ({
                          where: { id: piglet.id },
                          update: {
                            code: piglet.code,
                            type: piglet.type,
                            sex: piglet.sex,
                            ageDays: piglet.ageDays,
                            initialPrice: piglet.initialPrice,
                            investedPrice: piglet.investedPrice,
                            state: piglet.state,
                            updatedAt: piglet.updatedAt,
                            farm: { connect: { id: piglet.farm.id } },
                            breed: { connect: { id: piglet.breed.id } },
                            phase: { connect: { id: piglet.phase.id } },
                          },
                          create: {
                            id: piglet.id,
                            code: piglet.code,
                            type: piglet.type,
                            sex: piglet.sex,
                            ageDays: piglet.ageDays,
                            initialPrice: piglet.initialPrice,
                            investedPrice: piglet.investedPrice,
                            state: piglet.state,
                            createdAt: piglet.createdAt,
                            updatedAt: piglet.updatedAt,
                            farm: { connect: { id: piglet.farm.id } },
                            breed: { connect: { id: piglet.breed.id } },
                            phase: { connect: { id: piglet.phase.id } },
                            mother: { connect: { id: history.sowId } },
                            father: history.boarId
                              ? { connect: { id: history.boarId } }
                              : undefined,
                          },
                        })),
                      },
                    },
                  }
                : undefined,
            },
            create: {
              id: history.id,
              sequential: history.sequential,
              startDate: history.startDate,
              endDate: history.endDate,
              reproductiveState: {
                connect: { id: history.reproductiveState.id },
              },
              boar: history.boarId
                ? { connect: { id: history.boarId } }
                : undefined,
              birth: history.birth
                ? {
                    create: {
                      id: history.birth.id,
                      numberBirth: history.birth.numberBirth,
                      birthDate: history.birth.birthDate,
                      malePiglets: history.birth.malePiglets,
                      femalePiglets: history.birth.femalePiglets,
                      deadPiglets: history.birth.deadPiglets,
                      averageLitterWeight: history.birth.averageLitterWeight,
                      isLitterWeaned: history.birth.isLitterWeaned,
                      createdAt: history.birth.createdAt,
                      updatedAt: history.birth.updatedAt,
                      piglets: {
                        create: history.birth.piglets.map((piglet) => ({
                          id: piglet.id,
                          code: piglet.code,
                          type: piglet.type,
                          sex: piglet.sex,
                          ageDays: piglet.ageDays,
                          initialPrice: piglet.initialPrice,
                          investedPrice: piglet.investedPrice,
                          state: piglet.state,
                          createdAt: piglet.createdAt,
                          updatedAt: piglet.updatedAt,
                          farm: { connect: { id: piglet.farm.id } },
                          breed: { connect: { id: piglet.breed.id } },
                          phase: { connect: { id: piglet.phase.id } },
                          mother: { connect: { id: history.sowId } },
                          father: history.boarId
                            ? { connect: { id: history.boarId } }
                            : undefined,
                        })),
                      },
                    },
                  }
                : undefined,
            },
          };
        }),
      },
    };
  }
}
