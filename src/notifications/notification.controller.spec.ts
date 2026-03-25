import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;

  const mockNotificationService = {
    getUserNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    deleteAllUserNotifications: vi.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'user@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyNotifications', () => {
    it('should get user notifications successfully', async () => {
      const mockNotifications = [
        { id: '1', message: 'Test notification', isRead: false },
      ];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await controller.getMyNotifications({ user: mockUser });

      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockNotifications);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = { user: null };

      expect(() => controller.getMyNotifications(req))
        .toThrow(UnauthorizedException);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = '1';
      const mockNotification = { id: '1', isRead: true };

      mockNotificationService.markNotificationAsRead.mockResolvedValue(mockNotification);

      const result = await controller.markNotificationAsRead(notificationId, { user: mockUser });

      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith(notificationId, mockUser.id);
      expect(result).toEqual(mockNotification);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const notificationId = '1';
      const req = { user: null };

      expect(() => controller.markNotificationAsRead(notificationId, req))
        .toThrow(UnauthorizedException);
    });
  });

  describe('deleteAllMyNotifications', () => {
    it('should delete all user notifications successfully', async () => {
      const mockResult = { message: 'All notifications deleted' };

      mockNotificationService.deleteAllUserNotifications.mockResolvedValue(mockResult);

      const result = await controller.deleteAllMyNotifications({ user: mockUser });

      expect(notificationService.deleteAllUserNotifications).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockResult);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = { user: null };

      expect(() => controller.deleteAllMyNotifications(req))
        .toThrow(UnauthorizedException);
    });
  });
});
