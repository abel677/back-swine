import { Prisma } from "@prisma/client";
import { Setting } from "../../domain/entities/setting.entity";

export class SettingMapper {
  static fromDomainToHttpResponse(setting: Setting) {
    return {
      id: setting.id,
      farmId: setting.farmId,
      matingHeatDurationDays: setting.matingHeatDurationDays,
      inseminationDurationDays: setting.inseminationDurationDays,
      gestationDurationDays: setting.gestationDurationDays,
      lactationDurationDays: setting.lactationDurationDays,
      weaningDurationDays: setting.weaningDurationDays,
      restingDurationDays: setting.restingDurationDays,
      initialPigletPrice: setting.initialPigletPrice,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }

  static toDomain(data: Prisma.SettingGetPayload<{}>) {
    return Setting.fromPrimitives({
      id: data.id,
      farmId: data.farmId,
      matingHeatDurationDays: data.matingHeatDurationDays,
      inseminationDurationDays: data.inseminationDurationDays,
      gestationDurationDays: data.gestationDurationDays,
      lactationDurationDays: data.lactationDurationDays,
      weaningDurationDays: data.weaningDurationDays,
      restingDurationDays: data.restingDurationDays,
      initialPigletPrice: data.initialPigletPrice.toNumber(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toCreatePersistence(setting: Setting): Prisma.SettingCreateInput {
    return {
      id: setting.id,
      farm: {
        connect: {
          id: setting.farmId,
        },
      },
      matingHeatDurationDays: setting.matingHeatDurationDays,
      inseminationDurationDays: setting.inseminationDurationDays,
      gestationDurationDays: setting.gestationDurationDays,
      lactationDurationDays: setting.lactationDurationDays,
      weaningDurationDays: setting.weaningDurationDays,
      restingDurationDays: setting.restingDurationDays,
      initialPigletPrice: setting.initialPigletPrice,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
  static toUpdatePersistence(setting: Setting): Prisma.SettingUpdateInput {
    return {
      farm: {
        connect: {
          id: setting.farmId,
        },
      },
      matingHeatDurationDays: setting.matingHeatDurationDays,
      inseminationDurationDays: setting.inseminationDurationDays,
      gestationDurationDays: setting.gestationDurationDays,
      lactationDurationDays: setting.lactationDurationDays,
      weaningDurationDays: setting.weaningDurationDays,
      restingDurationDays: setting.restingDurationDays,
      initialPigletPrice: setting.initialPigletPrice,
      updatedAt: setting.updatedAt,
    };
  }
}
