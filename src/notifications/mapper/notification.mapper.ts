import { Notification } from "../entity/notification.entity";
import { 
  NotificationVm, 
  NotificationSummaryVm, 
  NotificationCreateVm, 
  NotificationCountVm 
} from "../vm/notification.vm";

export class NotificationMapper {
  static toNotificationVm(notification: Notification): NotificationVm {
    return {
      id: notification.id,
      user: notification.user ? {
        id: notification.user.id,
        firstName: notification.user.firstName,
        lastName: notification.user.lastName,
        email: notification.user.email,
      } : undefined,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      timeAgo: this.getTimeAgo(notification.createdAt),
    };
  }

  static toNotificationSummaryVm(notification: Notification): NotificationSummaryVm {
    return {
      id: notification.id,
      title: notification.title,
      type: notification.type,
      isRead: notification.isRead,
      timeAgo: this.getTimeAgo(notification.createdAt),
    };
  }

  static toNotificationCountVm(unreadCount: number, totalCount: number): NotificationCountVm {
    return {
      unreadCount,
      totalCount,
    };
  }

  static toNotificationVmList(notifications: Notification[]): NotificationVm[] {
    return notifications.map(notification => this.toNotificationVm(notification));
  }

  static toNotificationSummaryVmList(notifications: Notification[]): NotificationSummaryVm[] {
    return notifications.map(notification => this.toNotificationSummaryVm(notification));
  }

  static toNotificationEntity(createVm: NotificationCreateVm, user: any): Partial<Notification> {
    return {
      user: user,
      title: createVm.title,
      message: createVm.message,
      type: createVm.type,
      isRead: false,
      createdAt: new Date(),
    };
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  }
}
