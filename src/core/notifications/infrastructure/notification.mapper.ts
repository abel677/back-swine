import { Prisma } from "@prisma/client";
import { Notification } from "../domain/notification.entity";

export class NotificationMapper {
  static toDomain(
    notification: Prisma.NotificationGetPayload<{}>
  ): Notification {
    return Notification.fromPersistence({
      id: notification.id,
      title: notification.title,
      description: notification.description,
      farmId: notification.farmId,
      data: notification.data,
      dateSent: notification.dateSent,
      isRead: notification.isRead,
    });
  }

  static toPersistence(
    notification: Notification
  ): Prisma.NotificationCreateInput {
    return {
      title: notification.title,
      description: notification.description,
      data: notification.data,
      dateSent: notification.dateSent,
      isRead: notification.isRead,
      farm: {
        connect: {
          id: notification.farmId,
        },
      },
    };
  }
}
