import { NotificationRepository } from "../../domain/notification.repository";

export class DeleteSowNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(params: { farmId: string; code: string }) {
    await this.notificationRepository.delete(params);
  }
}
