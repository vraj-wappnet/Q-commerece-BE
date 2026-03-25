import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { Notification } from './entity/notification.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepo: Repository<Notification>;
  let notificationQueue: Queue;

  const mockNotificationRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockNotificationQueue = {
    add: vi.fn(),
  };

  const mockNotification: Notification = {
    id: '1',
    message: 'Test notification',
    isRead: false,
    user: { id: '1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepo,
        },
        {
          provide: 'BullQueue_notification',
          useValue: mockNotificationQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepo = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should add notification to queue', async () => {
      const notificationData = {
        userId: '1',
        message: 'Test notification',
        type: 'ORDER_STATUS',
      };

      mockNotificationQueue.add.mockResolvedValue({ id: 'job1' });

      await service.sendNotification(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith('sendNotification', notificationData);
    });
  });

  describe('saveNotification', () => {
    it('should save notification successfully', async () => {
      const notificationData = {
        userId: '1',
        message: 'Test notification',
        type: 'ORDER_STATUS',
      };

      mockNotificationRepo.create.mockReturnValue(mockNotification);
      mockNotificationRepo.save.mockResolvedValue(mockNotification);

      const result = await service.saveNotification(notificationData);

      expect(notificationRepo.create).toHaveBeenCalledWith(notificationData);
      expect(notificationRepo.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications', async () => {
      const userId = '1';
      const mockNotifications = [mockNotification];

      mockNotificationRepo.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications(userId);

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId }
        },
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = '1';
      const userId = '1';

      mockNotificationRepo.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepo.save.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markNotificationAsRead(notificationId, userId);

      expect(notificationRepo.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, user: { id: userId } }
      });
      expect(mockNotificationRepo.save).toHaveBeenCalledWith({
        ...mockNotification,
        isRead: true,
      });
      expect(result).toEqual(
        expect.objectContaining({
          isRead: true,
        })
      );
    });

    it('should throw NotFoundException if notification not found', async () => {
      const notificationId = '999';
      const userId = '1';

      mockNotificationRepo.findOne.mockResolvedValue(null);

      await expect(service.markNotificationAsRead(notificationId, userId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAllUserNotifications', () => {
    it('should delete all user notifications', async () => {
      const userId = '1';
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 5 }),
      };

      mockNotificationRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.deleteAllUserNotifications(userId);

      expect(mockNotificationRepo.createQueryBuilder).toHaveBeenCalledWith('notification');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Notification);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('notification."userId" = :userId', { userId });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(result).toEqual({ deleted: 5 });
    });
  });
});
