import { Setting } from "../entities/setting.entity";

export interface SettingRepository {
  update(setting: Setting): Promise<void>;
  create(setting: Setting): Promise<void>;
  getByUserId(userId: string): Promise<Setting | null>;
  getByFarmId(farmId: string): Promise<Setting | null>;
}
