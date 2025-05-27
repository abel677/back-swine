import { Notification } from "./notification.entity";

export interface NotificationRepository {
  delete(params: { farmId: string; code: string }): Promise<void>;
  create(notification: Notification): Promise<void>;
  getAll(farmId: string): Promise<Notification[]>;
}
