// import { Prisma } from "@prisma/client";
// import { BreedMapper } from "../../../breeds/infrastructure/mappers/breed.mapper";
// import { FarmMapper } from "../../../farms/infrastructure/mappers/farm.mapper";
// import { PhaseMapper } from "../../../farms/infrastructure/mappers/phase.mapper";
// import { PigSex, PigState, PigType } from "../../../shared/domain/enums";
// import { Sow } from "../../domain/entities/sow.entity";
// import { ReproductiveHistoryMapper } from "./reproductive-state-history.mapper";
// import { PigWeightMapper } from "./pig-weight.mapper";

// export class SowMapper {
//   static fromDomainToHttpResponse(sow: Sow) {
//     return {
//       id: sow.id,
//       farm: FarmMapper.fromDomainToHttpResponse(sow.farm),
//       breed: BreedMapper.fromDomainToHttpResponse(sow.breed),
//       phase: PhaseMapper.fromDomainToHttpResponse(sow.phase),
//       type: sow.props.type,
//       sex: sow.props.sex,
//       code: sow.code,
//       ageDays: sow.ageDays,
//       initialPrice: sow.initialPrice,
//       investedPrice: sow.investedPrice,
//       state: sow.state,
//       motherId: sow.props.motherId,
//       fatherId: sow.props.fatherId,
//       createdAt: sow.createdAt,
//       updatedAt: sow.updatedAt,
//       weights: sow.props.weights.map((w) => PigWeightMapper.fromDomainToHttpResponse(w)),
//       reproductiveHistory: sow.props.reproductiveHistory.map((re) =>
//         ReproductiveHistoryMapper.fromDomainToHttpResponse(re)
//       ),
//     };
//   }

//   static fromPersistenceToDomain(
//     data: Prisma.PigGetPayload<{
//       include: {
//         farm: true;
//         breed: true;
//         phase: true;
//         birth: true;
//         sowReproductiveHistory: {
//           include: {
//             reproductiveState: true;
//             boar: true;
//             sow: true;
//             births: {
//               include: {
//                 piglets: {
//                   include: {
//                     farm: true;
//                     phase: true;
//                     breed: true;
//                     birth: true;
//                     mother: true;
//                     father: true;
//                   };
//                 };
//                 reproductiveHistory: true;
//               };
//             };
//           };
//         };
//         weights: true;
//       };
//     }>
//   ): Sow {
//     return Sow.fromPrimitives({
//       id: data.id,
//       farm: FarmMapper.toDomain(data.farm),
//       breed: BreedMapper.toDomain(data.breed),
//       phase: PhaseMapper.toDomain(data.phase),
//       type: PigType.Reproduction,
//       sex: PigSex.Female,
//       code: data.code,
//       ageDays: data.ageDays,
//       initialPrice: data.initialPrice.toNumber(),
//       investedPrice: data.investedPrice.toNumber(),
//       state: data.state as PigState,
//       createdAt: data.createdAt,
//       updatedAt: data.updatedAt,
//       weights: data.weights.map((w) =>
//         PigWeightMapper.fromPersistenceToDomain(w)
//       ),
//       reproductiveHistory: data.sowReproductiveHistory.map((r) =>
//         ReproductiveHistoryMapper.fromPersistenceToDomain(r)
//       ),
//       currentReproductiveHistory:
//         data.sowReproductiveHistory.length > 0
//           ? ReproductiveHistoryMapper.fromPersistenceToDomain(
//               data.sowReproductiveHistory[0]
//             )
//           : null,

//       fatherId: data.fatherId,
//       motherId: data.motherId,
//     });
//   }

//   static toCreatePersistence(sow: Sow): Prisma.PigCreateInput {
//     return {
//       id: sow.id,
//       code: sow.code,
//       type: sow.props.type,
//       sex: sow.props.sex,
//       ageDays: sow.ageDays,
//       initialPrice: sow.initialPrice,
//       investedPrice: sow.investedPrice,
//       state: sow.state,
//       createdAt: sow.createdAt,
//       updatedAt: sow.updatedAt,
//       farm: { connect: { id: sow.farm.id } },
//       breed: { connect: { id: sow.breed.id } },
//       phase: { connect: { id: sow.phase.id } },
//       sowReproductiveHistory: {
//         create: sow.props.reproductiveHistory.map((history) => ({
//           id: history.id,
//           sequential: history.props.sequential,
//           startDate: history.props.startDate,
//           endDate: history.props.endDate,
//           reproductiveState: {
//             connect: { id: history.props.reproductiveState.id },
//           },
//           boar: history.props.boarId
//             ? { connect: { id: history.props.boarId } }
//             : undefined,
//           births: {
//             create: history.props.births.map((birth) => ({
//               id: birth.id,
//               numberBirth: birth.props.numberBirth,
//               birthDate: birth.props.birthDate,
//               malePiglets: birth.props.malePiglets,
//               femalePiglets: birth.props.femalePiglets,
//               deadPiglets: birth.props.deadPiglets,
//               averageLitterWeight: birth.props.averageLitterWeight,
//               createdAt: birth.props.createdAt,
//               updatedAt: birth.props.updatedAt,
//               piglets: {
//                 create: birth.props.piglets.map((piglet) => ({
//                   id: piglet.id,
//                   code: piglet.code,
//                   type: piglet.props.type,
//                   sex: piglet.props.sex,
//                   ageDays: piglet.props.ageDays,
//                   initialPrice: piglet.props.initialPrice,
//                   investedPrice: piglet.props.investedPrice,
//                   state: piglet.props.state,
//                   mother: {
//                     connect: {
//                       id: sow.id,
//                     },
//                   },
//                   father: {
//                     connect: {
//                       id: history.props.boarId,
//                     },
//                   },
//                   farm: { connect: { id: piglet.props.farm.id } },
//                   breed: { connect: { id: piglet.props.breed.id } },
//                   phase: { connect: { id: piglet.props.phase.id } },
//                   createdAt: piglet.props.createdAt,
//                   updatedAt: piglet.props.updatedAt,
//                 })),
//               },
//             })),
//           },
//         })),
//       },
//       weights: {
//         create: sow.props.weights.map((w) =>
//           PigWeightMapper.toCreatePersistence(w)
//         ),
//       },
//     };
//   }

//   static toUpdatePersistence(sow: Sow): Prisma.PigUpdateInput {
//     return {
//       code: sow.code,
//       type: sow.props.type,
//       sex: sow.props.sex,
//       ageDays: sow.ageDays,
//       initialPrice: sow.initialPrice,
//       investedPrice: sow.investedPrice,
//       state: sow.state,
//       updatedAt: sow.updatedAt,
//       birth: sow.birthId
//         ? { connect: { id: sow.birthId } }
//         : { disconnect: true },
//       farm: { connect: { id: sow.farm.id } },
//       breed: { connect: { id: sow.breed.id } },
//       phase: { connect: { id: sow.phase.id } },

//       sowReproductiveHistory: {
//         upsert: sow.props.reproductiveHistory.map((history) => ({
//           where: { id: history.id },
//           update: {
//             sequential: history.props.sequential,
//             startDate: history.props.startDate,
//             endDate: history.props.endDate,
//             reproductiveState: {
//               connect: { id: history.props.reproductiveState.id },
//             },
//             boar: history.props.boarId
//               ? { connect: { id: history.props.boarId } }
//               : undefined,
//             births: {
//               upsert: history.props.births.map((birth) => ({
//                 where: { id: birth.id },
//                 update: {
//                   numberBirth: birth.props.numberBirth,
//                   birthDate: birth.props.birthDate,
//                   malePiglets: birth.props.malePiglets,
//                   femalePiglets: birth.props.femalePiglets,
//                   deadPiglets: birth.props.deadPiglets,
//                   averageLitterWeight: birth.props.averageLitterWeight,
//                   updatedAt: birth.props.updatedAt,
//                   piglets: {
//                     update: birth.props.piglets.map((piglet) => ({
//                       where: { id: piglet.id },
//                       data: {
//                         code: piglet.code,
//                         type: piglet.props.type,
//                         sex: piglet.props.sex,
//                         ageDays: piglet.ageDays,
//                         initialPrice: piglet.initialPrice,
//                         investedPrice: piglet.investedPrice,
//                         state: piglet.state,
//                         updatedAt: piglet.updatedAt,
//                         farm: { connect: { id: piglet.farm.id } },
//                         breed: { connect: { id: piglet.breed.id } },
//                         phase: { connect: { id: piglet.phase.id } },
//                       },
//                     })),
//                   },
//                 },
//                 create: {
//                   id: birth.id,
//                   numberBirth: birth.props.numberBirth,
//                   birthDate: birth.props.birthDate,
//                   malePiglets: birth.props.malePiglets,
//                   femalePiglets: birth.props.femalePiglets,
//                   deadPiglets: birth.props.deadPiglets,
//                   averageLitterWeight: birth.props.averageLitterWeight,
//                   createdAt: birth.props.createdAt,
//                   updatedAt: birth.props.updatedAt,
//                   piglets: {
//                     connect: birth.props.piglets.map((piglet) => ({
//                       id: piglet.id,
//                     })),
//                   },
//                 },
//               })),
//             },
//           },
//           create: {
//             id: history.id,
//             sequential: history.props.sequential,
//             startDate: history.props.startDate,
//             endDate: history.props.endDate,
//             reproductiveState: {
//               connect: { id: history.props.reproductiveState.id },
//             },
//             boar: history.props.boarId
//               ? { connect: { id: history.props.boarId } }
//               : undefined,
//             births: {
//               create: history.props.births.map((birth) => ({
//                 id: birth.id,
//                 numberBirth: birth.props.numberBirth,
//                 birthDate: birth.props.birthDate,
//                 malePiglets: birth.props.malePiglets,
//                 femalePiglets: birth.props.femalePiglets,
//                 deadPiglets: birth.props.deadPiglets,
//                 averageLitterWeight: birth.props.averageLitterWeight,
//                 createdAt: birth.props.createdAt,
//                 updatedAt: birth.props.updatedAt,
//                 piglets: {
//                   connect: birth.props.piglets.map((piglet) => ({
//                     id: piglet.id,
//                   })),
//                 },
//               })),
//             },
//           },
//         })),
//       },
//       weights: {
//         upsert: sow.props.weights.map((w) => ({
//           where: { id: w.id },
//           update: PigWeightMapper.toUpdatePersistence(w),
//           create: PigWeightMapper.toCreatePersistence(w),
//         })),
//       },
//     };
//   }
// }
