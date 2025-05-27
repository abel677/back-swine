import { Prisma } from "@prisma/client";
import { BreedMapper } from "../../../breeds/infrastructure/mappers/breed.mapper";
import { FarmMapper } from "../../../farms/infrastructure/mappers/farm.mapper";
import { PhaseMapper } from "../../../farms/infrastructure/mappers/phase.mapper";
import { PigSex, PigState, PigType } from "../../../shared/domain/enums";
import { Pig } from "../../domain/entities/pig.entity";
import { PigWeightMapper } from "./pig-weight.mapper";
import { ReproductiveHistoryMapper } from "./reproductive-state-history.mapper";

export class PigMapper {
  static fromDomainToHttpResponse(pig: Pig) {
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
      motherId: pig.motherId,
      fatherId: pig.fatherId,
      weights: pig.weights?.map((w) =>
        PigWeightMapper.fromDomainToHttpResponse(w)
      ),
      sowReproductiveHistory: pig.sowReproductiveHistory?.map((re) =>
        ReproductiveHistoryMapper.fromDomainToHttpResponse(re)
      ),
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
      fatherId: data.farmId,

      birthId: data.birthId,
      weights: data.weights?.map((w) =>
        PigWeightMapper.fromPersistenceToDomain(w)
      ),
      sowReproductiveHistory: data.sowReproductiveHistory?.map((r) =>
        ReproductiveHistoryMapper.fromPersistenceToDomain(r)
      ),

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
        create: pig.sowReproductiveHistory.map((history) => ({
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
          births: {
            create: history.births.map((birth) => ({
              id: birth.id,
              numberBirth: birth.numberBirth,
              birthDate: birth.birthDate,
              malePiglets: birth.malePiglets,
              femalePiglets: birth.femalePiglets,
              deadPiglets: birth.deadPiglets,
              averageLitterWeight: birth.averageLitterWeight,
              isLitterWeaned: birth.isLitterWeaned,
              createdAt: birth.createdAt,
              updatedAt: birth.updatedAt,
              piglets: {
                create: birth.piglets.map((piglet) => ({
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
            })),
          },
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
    };
  }
}
