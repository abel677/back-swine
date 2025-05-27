import { PrismaClient } from "@prisma/client";
import { NotificationRepository } from "../domain/notification.repository";
import { NotificationMapper } from "./notification.mapper";
import { Notification } from "../domain/notification.entity";

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async delete(params: { farmId: string; code: string }): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        farmId: params.farmId,
        data: {
          contains: `"code":"${params.code}"`,
        },
      },
    });
  }

  async getAll(farmId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        farmId,
      },
    });

    return notifications.map((notification) =>
      NotificationMapper.toDomain(notification)
    );
  }

  async create(notification: Notification): Promise<void> {
    const toPersistence = NotificationMapper.toPersistence(notification);
    await this.prisma.notification.create({
      data: toPersistence,
    });
  }
}
