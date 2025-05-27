import { Prisma } from "@prisma/client";
import { Birth } from "../../domain/entities/birth.entity";
import { PigMapper } from "./pig.mapper";

export class BirthMapper {
  static fromDomainToHttpResponse(birth: Birth) {
    return {
      numberBirth: birth.numberBirth,
      birthDate: birth.birthDate,
      malePiglets: birth.malePiglets,
      femalePiglets: birth.femalePiglets,
      deadPiglets: birth.deadPiglets,
      averageLitterWeight: birth.averageLitterWeight,
      piglets: birth.piglets.map((p) => PigMapper.fromDomainToHttpResponse(p)),
      isLitterWeaned: birth.isLitterWeaned,
      reproductiveHistoryId: birth.reproductiveHistoryId,
      createdAt: birth.createdAt,
      updatedAt: birth.updatedAt,
    };
  }

  static fromPersistenceToDomain(
    data: Prisma.BirthGetPayload<{
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
    }>
  ) {
    return Birth.fromPrimitives({
      id: data.id,
      reproductiveHistoryId: data.reproductiveHistoryId,
      numberBirth: data.numberBirth,
      birthDate: data.birthDate,
      malePiglets: data.malePiglets,
      femalePiglets: data.femalePiglets,
      deadPiglets: data.deadPiglets,
      averageLitterWeight: data.averageLitterWeight.toNumber(),
      isLitterWeaned: data.isLitterWeaned,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      piglets: data.piglets.map((piglet) =>
        PigMapper.fromPersistenceToDomain(piglet)
      ),
    });
  }
  static toCreatePersistence(birth: Birth): Prisma.BirthCreateInput {
    return {
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
      reproductiveHistory: {
        connect: {
          id: birth.reproductiveHistoryId,
        },
      },
    };
  }
  static toCreateManyPersistence(
    births: Birth[]
  ): Prisma.BirthCreateManyInput[] {
    return births.map((birth) => ({
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
      reproductiveHistoryId: birth.reproductiveHistoryId,
    }));
  }
}
