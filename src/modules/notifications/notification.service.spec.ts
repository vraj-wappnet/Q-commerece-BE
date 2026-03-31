import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { NotificationService } from './notification.service';
import { Notification } from './entity/notification.entity';
import { NotificationType } from '../../common/enum/status.enum';

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: Repository<Notification>;
  let queue: Queue;

  const mockUser = {
    id: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockNotification = {
    id: 'notification-uuid-123',
    user: mockUser,
    title: 'Order Placed',
    message: 'Your order has been placed successfully',
    type: NotificationType.ORDER_PLACED,
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getQueueToken('notification'),
          useValue: {
            add: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repo = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    queue = module.get<Queue>(getQueueToken('notification'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should add notification to queue successfully', async () => {
      const notificationData = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'Test message',
        type: NotificationType.ORDER_PLACED,
      };
      vi.spyOn(queue, 'add').mockResolvedValue({} as any);

      await service.sendNotification(notificationData);

      expect(queue.add).toHaveBeenCalledWith('sendNotification', notificationData);
      expect(queue.add).toHaveBeenCalledTimes(1);
    });

    it('should handle queue add with empty data', async () => {
      vi.spyOn(queue, 'add').mockResolvedValue({} as any);

      await service.sendNotification({});

      expect(queue.add).toHaveBeenCalledWith('sendNotification', {});
    });

    it('should handle queue add with null data', async () => {
      vi.spyOn(queue, 'add').mockResolvedValue({} as any);

      await service.sendNotification(null);

      expect(queue.add).toHaveBeenCalledWith('sendNotification', null);
    });

    it('should handle queue add failure', async () => {
      const error = new Error('Queue error');
      vi.spyOn(queue, 'add').mockRejectedValue(error);

      await expect(service.sendNotification({})).rejects.toThrow('Queue error');
    });

    it('should handle sendNotification with all notification types', async () => {
      vi.spyOn(queue, 'add').mockResolvedValue({} as any);

      await service.sendNotification({ type: NotificationType.ORDER_PLACED });
      await service.sendNotification({ type: NotificationType.ORDER_STATUS });
      await service.sendNotification({ type: NotificationType.ORDER_ASSIGNED });

      expect(queue.add).toHaveBeenCalledTimes(3);
    });
  });

  describe('saveNotification', () => {
    it('should save notification successfully', async () => {
      const notificationData = {
        user: { id: 'user-123' },
        title: 'Order Placed',
        message: 'Your order has been placed',
        type: NotificationType.ORDER_PLACED,
        isRead: false,
        createdAt: new Date(),
      };
      vi.spyOn(repo, 'create').mockReturnValue(mockNotification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(mockNotification as any);

      const result = await service.saveNotification(notificationData);

      expect(repo.create).toHaveBeenCalledWith(notificationData);
      expect(repo.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should save notification with ORDER_STATUS type', async () => {
      const notificationData = {
        user: { id: 'user-123' },
        title: 'Order Status Updated',
        message: 'Your order is out for delivery',
        type: NotificationType.ORDER_STATUS,
        isRead: false,
        createdAt: new Date(),
      };
      const notification = { ...mockNotification, type: NotificationType.ORDER_STATUS };
      vi.spyOn(repo, 'create').mockReturnValue(notification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(notification as any);

      const result = await service.saveNotification(notificationData);

      expect((result as any).type).toBe(NotificationType.ORDER_STATUS);
    });

    it('should save notification with ORDER_ASSIGNED type', async () => {
      const notificationData = {
        user: { id: 'user-123' },
        title: 'Order Assigned',
        message: 'A new order has been assigned to you',
        type: NotificationType.ORDER_ASSIGNED,
        isRead: false,
        createdAt: new Date(),
      };
      const notification = { ...mockNotification, type: NotificationType.ORDER_ASSIGNED };
      vi.spyOn(repo, 'create').mockReturnValue(notification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(notification as any);

      const result = await service.saveNotification(notificationData);

      expect((result as any).type).toBe(NotificationType.ORDER_ASSIGNED);
    });

    it('should handle save failure', async () => {
      const error = new Error('Database error');
      vi.spyOn(repo, 'create').mockReturnValue(mockNotification as any);
      vi.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(service.saveNotification({})).rejects.toThrow('Database error');
    });

    it('should handle notification with very long title', async () => {
      const longTitle = 'A'.repeat(500);
      const notificationData = {
        user: { id: 'user-123' },
        title: longTitle,
        message: 'Test message',
        type: NotificationType.ORDER_PLACED,
        isRead: false,
        createdAt: new Date(),
      };
      const notification = { ...mockNotification, title: longTitle };
      vi.spyOn(repo, 'create').mockReturnValue(notification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(notification as any);

      const result = await service.saveNotification(notificationData);

      expect((result as any).title).toBe(longTitle);
    });

    it('should handle notification with special characters', async () => {
      const specialTitle = 'Order #123 @User <Test> & "Quotes"';
      const notificationData = {
        user: { id: 'user-123' },
        title: specialTitle,
        message: 'Test message',
        type: NotificationType.ORDER_PLACED,
        isRead: false,
        createdAt: new Date(),
      };
      const notification = { ...mockNotification, title: specialTitle };
      vi.spyOn(repo, 'create').mockReturnValue(notification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(notification as any);

      const result = await service.saveNotification(notificationData);

      expect((result as any).title).toBe(specialTitle);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications ordered by createdAt DESC', async () => {
      const notifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-uuid-456', createdAt: new Date(Date.now() - 1000) },
      ];
      vi.spyOn(repo, 'find').mockResolvedValue(notifications as any);

      const result = await service.getUserNotifications('user-uuid-123');

      expect(repo.find).toHaveBeenCalledWith({
        where: {
          user: { id: 'user-uuid-123' },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(notifications);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no notifications', async () => {
      vi.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.getUserNotifications('user-uuid-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle different user IDs correctly', async () => {
      vi.spyOn(repo, 'find').mockResolvedValue([mockNotification] as any);

      await service.getUserNotifications('different-user-id');

      expect(repo.find).toHaveBeenCalledWith({
        where: {
          user: { id: 'different-user-id' },
        },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return only read notifications', async () => {
      const readNotifications = [
        { ...mockNotification, isRead: true },
        { ...mockNotification, id: 'notification-uuid-456', isRead: true },
      ];
      vi.spyOn(repo, 'find').mockResolvedValue(readNotifications as any);

      const result = await service.getUserNotifications('user-uuid-123');

      expect(result.every((n) => n.isRead === true)).toBe(true);
    });

    it('should return only unread notifications', async () => {
      const unreadNotifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-uuid-456' },
      ];
      vi.spyOn(repo, 'find').mockResolvedValue(unreadNotifications as any);

      const result = await service.getUserNotifications('user-uuid-123');

      expect(result.every((n) => n.isRead === false)).toBe(true);
    });

    it('should return mixed read and unread notifications', async () => {
      const mixedNotifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-uuid-456', isRead: true },
      ];
      vi.spyOn(repo, 'find').mockResolvedValue(mixedNotifications as any);

      const result = await service.getUserNotifications('user-uuid-123');

      expect(result).toHaveLength(2);
      expect(result[0].isRead).toBe(false);
      expect(result[1].isRead).toBe(true);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      vi.spyOn(repo, 'find').mockRejectedValue(error);

      await expect(service.getUserNotifications('user-uuid-123')).rejects.toThrow(
        'Database connection error'
      );
    });

    it('should handle empty user ID', async () => {
      vi.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.getUserNotifications('');

      expect(repo.find).toHaveBeenCalledWith({
        where: {
          user: { id: '' },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([]);
    });

    it('should handle very long user ID', async () => {
      const longUserId = 'user-' + 'a'.repeat(500);
      vi.spyOn(repo, 'find').mockResolvedValue([]);

      await service.getUserNotifications(longUserId);

      expect(repo.find).toHaveBeenCalledWith({
        where: {
          user: { id: longUserId },
        },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const unreadNotification = { ...mockNotification, isRead: false };
      const readNotification = { ...mockNotification, isRead: true };
      vi.spyOn(repo, 'findOne').mockResolvedValue(unreadNotification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(readNotification as any);

      const result = await service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-uuid-123', user: { id: 'user-uuid-123' } },
      });
      expect(repo.save).toHaveBeenCalledWith({ ...unreadNotification, isRead: true });
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException when notification not found', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('notification-uuid-999', 'user-uuid-123')
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should throw NotFoundException when notification belongs to different user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('notification-uuid-123', 'different-user-id')
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should handle already read notification', async () => {
      const alreadyReadNotification = { ...mockNotification, isRead: true };
      vi.spyOn(repo, 'findOne').mockResolvedValue(alreadyReadNotification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(alreadyReadNotification as any);

      const result = await service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123');

      expect(result.isRead).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should handle invalid notification ID format', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('invalid-id', 'user-uuid-123')
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should handle invalid user ID format', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('notification-uuid-123', 'invalid-user-id')
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should handle save failure after finding notification', async () => {
      const error = new Error('Database save error');
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockNotification as any);
      vi.spyOn(repo, 'save').mockRejectedValue(error);

      await expect(
        service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123')
      ).rejects.toThrow('Database save error');
    });

    it('should handle whitespace user ID', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('notification-uuid-123', '   ')
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should preserve other notification fields when marking as read', async () => {
      const unreadNotification = {
        ...mockNotification,
        isRead: false,
        title: 'Important',
        message: 'Critical message',
      };
      const readNotification = { ...unreadNotification, isRead: true };
      vi.spyOn(repo, 'findOne').mockResolvedValue(unreadNotification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(readNotification as any);

      const result = await service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123');

      expect(result.title).toBe('Important');
      expect(result.message).toBe('Critical message');
      expect(result.isRead).toBe(true);
    });

    it('should handle concurrent markNotificationAsRead calls', async () => {
      const unreadNotification = { ...mockNotification, isRead: false };
      const readNotification = { ...mockNotification, isRead: true };
      vi.spyOn(repo, 'findOne').mockResolvedValue(unreadNotification as any);
      vi.spyOn(repo, 'save').mockResolvedValue(readNotification as any);

      const result1 = service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123');
      const result2 = service.markNotificationAsRead('notification-uuid-123', 'user-uuid-123');

      await Promise.all([result1, result2]);

      expect(repo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteAllUserNotifications', () => {
    it('should delete all user notifications successfully', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 5 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('user-uuid-123');

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('notification');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Notification);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('notification."userId" = :userId', {
        userId: 'user-uuid-123',
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(result).toEqual({ deleted: 5 });
    });

    it('should return 0 when user has no notifications to delete', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 0 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('user-uuid-123');

      expect(result).toEqual({ deleted: 0 });
    });

    it('should handle affected being null', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: null }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('user-uuid-123');

      expect(result).toEqual({ deleted: 0 });
    });

    it('should handle affected being undefined', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: undefined }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('user-uuid-123');

      expect(result).toEqual({ deleted: 0 });
    });

    it('should delete large number of notifications', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 1000 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('user-uuid-123');

      expect(result).toEqual({ deleted: 1000 });
    });

    it('should handle different user IDs correctly', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 3 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.deleteAllUserNotifications('different-user-id');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('notification."userId" = :userId', {
        userId: 'different-user-id',
      });
    });

    it('should handle database errors during deletion', async () => {
      const error = new Error('Database deletion error');
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(error),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await expect(service.deleteAllUserNotifications('user-uuid-123')).rejects.toThrow(
        'Database deletion error'
      );
    });

    it('should handle empty user ID', async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 0 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.deleteAllUserNotifications('');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('notification."userId" = :userId', {
        userId: '',
      });
      expect(result).toEqual({ deleted: 0 });
    });

    it('should handle SQL injection attempt with parameterized query', async () => {
      const maliciousUserId = "'; DROP TABLE notifications; --";
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 0 }),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.deleteAllUserNotifications(maliciousUserId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('notification."userId" = :userId', {
        userId: maliciousUserId,
      });
    });
  });
});
