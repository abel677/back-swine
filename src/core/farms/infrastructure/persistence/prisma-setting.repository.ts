import { PrismaClient } from "@prisma/client";
import { SettingRepository } from "../../domain/contracts/setting.repository";
import { Setting } from "../../domain/entities/setting.entity";
import { SettingMapper } from "../mappers/setting.mapper";

export class PrismaSettingRepository implements SettingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(setting: Setting): Promise<void> {
    await this.prisma.setting.update({
      where: { id: setting.id },
      data: SettingMapper.toUpdatePersistence(setting),
    });
  }
  async create(setting: Setting): Promise<void> {
    await this.prisma.setting.create({
      data: SettingMapper.toCreatePersistence(setting),
    });
  }

  async getByFarmId(farmId: string): Promise<Setting | null> {
    const data = await this.prisma.setting.findFirst({
      where: { farmId },
    });

    if (!data) return null;
    return SettingMapper.toDomain(data);
  }

  async getByUserId(userId: string): Promise<Setting | null> {
    const data = await this.prisma.setting.findFirst({
      where: { farm: { farmUsers: { some: { userId } } } },
    });

    if (!data) return null;
    return SettingMapper.toDomain(data);
  }
}
