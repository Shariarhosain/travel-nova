import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, skip = 0, take = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: { userAccountId: userId },
      skip,
      take,
      include: {
        relatedPost: {
          select: {
            id: true,
            caption: true,
            imageLinks: true,
          },
        },
        relatedItinerary: {
          select: {
            id: true,
            title: true,
            mainImageLink: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.notification.count({
      where: { userAccountId: userId },
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userAccountId: userId, isRead: false },
    });

    return { data: notifications, total, unreadCount, skip, take };
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userAccountId: userId,
      },
      data: { isRead: true },
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userAccountId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(userId: string, notificationId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userAccountId: userId,
      },
    });

    return { message: 'Notification deleted' };
  }
}
