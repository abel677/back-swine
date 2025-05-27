// import { PigType, PrismaClient } from "@prisma/client";
// import { Sow } from "../../domain/entities/sow.entity";
// import { SowMapper } from "../mappers/sow.mapper";
// import { SowRepository } from "../../domain/contracts/sow.repository";

// export class PrismaSowRepository implements SowRepository {
//   constructor(private readonly prisma: PrismaClient) {}
//   async delete(id: string): Promise<void> {
//     await this.prisma.pig.delete({ where: { id } });
//   }
//   async update(sow: Sow): Promise<void> {
//     const data = SowMapper.toUpdatePersistence(sow);
//     await this.prisma.pig.update({ where: { id: sow.id }, data });
//   }
//   async create(sow: Sow): Promise<void> {
//     const data = SowMapper.toCreatePersistence(sow);

//     await this.prisma.pig.create({ data });
//   }

//   async createMany(pigs: Sow[]): Promise<void> {
//     throw new Error("Method not implemented.");
//   }

//   async getAllByUserId(userId: string): Promise<Sow[]> {
//     const entities = await this.prisma.pig.findMany({
//       where: {
//         type: PigType.Reproducción,
//         farm: {
//           OR: [
//             { ownerId: userId },
//             { farmUsers: { some: { userId: userId } } },
//           ],
//         },
//       },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,
//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return entities.map((entity) => SowMapper.fromPersistenceToDomain(entity));
//   }

//   async getAllByFarmId(farmId: string): Promise<Sow[]> {
//     const entities = await this.prisma.pig.findMany({
//       where: { farmId: farmId, type: PigType.Reproducción },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,
//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return entities.map((entity) => SowMapper.fromPersistenceToDomain(entity));
//   }

//   async getByCodeAndFarmId(params: {
//     code: string;
//     farmId: string;
//   }): Promise<Sow> {
//     const entity = await this.prisma.pig.findFirst({
//       where: { code: params.code, farmId: params.farmId },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,
//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true,
//       },
//     });
//     return entity ? SowMapper.fromPersistenceToDomain(entity) : null;
//   }

//   async getByIdAndFarmId(params: { id: string; farmId: string }): Promise<Sow> {
//     const entity = await this.prisma.pig.findFirst({
//       where: { id: params.id, farmId: params.farmId },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,
//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true,
//       },
//     });
//     return entity ? SowMapper.fromPersistenceToDomain(entity) : null;
//   }

//   async getByCode(code: string): Promise<Sow> {
//     const entity = await this.prisma.pig.findFirst({
//       where: { code: code },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,
//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true,
//       },
//     });
//     return entity ? SowMapper.fromPersistenceToDomain(entity) : null;
//   }

//   async getById(id: string): Promise<Sow> {
//     const entity = await this.prisma.pig.findFirst({
//       where: { id: id },
//       include: {
//         farm: true,
//         breed: true,
//         phase: true,
//         birth: true,
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true,
//             boar: true,
//             sow: true,
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true,

//                     phase: true,
//                     breed: true,
//                     birth: true,
//                     mother: true,
//                     father: true,
//                   },
//                 },
//                 reproductiveHistory: true,
//               },
//               orderBy: {
//                 birthDate: "desc",
//               },
//             },
//           },
//           orderBy: {
//             startDate: "desc",
//           },
//         },
//         weights: true,
//       },
//     });
//     return entity ? SowMapper.fromPersistenceToDomain(entity) : null;
//   }
// }
