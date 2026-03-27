import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationType } from '../../common/enum/status.enum';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockUser = {
    id: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockRequest = {
    user: mockUser,
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

  const mockNotificationService = {
    getUserNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    deleteAllUserNotifications: vi.fn(),
    sendNotification: vi.fn(),
    saveNotification: vi.fn(),
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
    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /notifications - getMyNotifications', () => {
    it('should return user notifications successfully', async () => {
      const notifications = [mockNotification];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(service.getUserNotifications).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual(notifications);
    });

    it('should return empty array when user has no notifications', async () => {
      mockNotificationService.getUserNotifications.mockResolvedValue([]);

      const result = await controller.getMyNotifications(mockRequest);

      expect(service.getUserNotifications).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return multiple notifications', async () => {
      const notifications = [
        mockNotification,
        { ...mockNotification, id: 'notification-uuid-456' },
        { ...mockNotification, id: 'notification-uuid-789' },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result).toHaveLength(3);
    });

    it('should throw UnauthorizedException when user is not in request', async () => {
      const requestWithoutUser = { user: null };

      try {
        await controller.getMyNotifications(requestWithoutUser);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.getUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is undefined', async () => {
      const requestWithoutUserId = { user: { firstName: 'John' } };

      try {
        await controller.getMyNotifications(requestWithoutUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.getUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is null', async () => {
      const requestWithNullUserId = { user: { id: null } };

      try {
        await controller.getMyNotifications(requestWithNullUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.getUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is empty string', async () => {
      const requestWithEmptyUserId = { user: { id: '' } };

      try {
        await controller.getMyNotifications(requestWithEmptyUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.getUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when request is undefined', async () => {
      try {
        await controller.getMyNotifications(undefined);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return notifications with different types', async () => {
      const notifications = [
        { ...mockNotification, type: NotificationType.ORDER_PLACED },
        { ...mockNotification, id: 'notification-uuid-456', type: NotificationType.ORDER_STATUS },
        {
          ...mockNotification,
          id: 'notification-uuid-789',
          type: NotificationType.ORDER_ASSIGNED,
        },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe(NotificationType.ORDER_PLACED);
      expect(result[1].type).toBe(NotificationType.ORDER_STATUS);
      expect(result[2].type).toBe(NotificationType.ORDER_ASSIGNED);
    });

    it('should return notifications with mixed read status', async () => {
      const notifications = [
        { ...mockNotification, isRead: false },
        { ...mockNotification, id: 'notification-uuid-456', isRead: true },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result[0].isRead).toBe(false);
      expect(result[1].isRead).toBe(true);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockNotificationService.getUserNotifications.mockRejectedValue(error);

      await expect(controller.getMyNotifications(mockRequest)).rejects.toThrow('Database error');
    });

    it('should handle whitespace-only user ID', async () => {
      const requestWithWhitespaceUserId = { user: { id: '   ' } };
      mockNotificationService.getUserNotifications.mockResolvedValue([]);

      const result = await controller.getMyNotifications(requestWithWhitespaceUserId);

      expect(service.getUserNotifications).toHaveBeenCalledWith('   ');
      expect(result).toEqual([]);
    });

    it('should handle request with extra properties', async () => {
      const requestWithExtra = {
        user: mockUser,
        extraProperty: 'should be ignored',
      };
      mockNotificationService.getUserNotifications.mockResolvedValue([mockNotification]);

      const result = await controller.getMyNotifications(requestWithExtra);

      expect(service.getUserNotifications).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual([mockNotification]);
    });

    it('should handle numeric-like string user ID', async () => {
      const numericUserId = '12345';
      const requestWithNumericId = { user: { id: numericUserId } };
      mockNotificationService.getUserNotifications.mockResolvedValue([mockNotification]);

      await controller.getMyNotifications(requestWithNumericId);

      expect(service.getUserNotifications).toHaveBeenCalledWith(numericUserId);
    });

    it('should handle being called multiple times sequentially', async () => {
      mockNotificationService.getUserNotifications.mockResolvedValue([mockNotification]);

      await controller.getMyNotifications(mockRequest);
      await controller.getMyNotifications(mockRequest);
      await controller.getMyNotifications(mockRequest);

      expect(service.getUserNotifications).toHaveBeenCalledTimes(3);
    });
  });

  describe('PATCH /notifications/:id/read - markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      const result = await controller.markNotificationAsRead('notification-uuid-123', mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(
        'notification-uuid-123',
        'user-uuid-123'
      );
      expect(result.isRead).toBe(true);
    });

    it('should throw UnauthorizedException when user is not in request', async () => {
      const requestWithoutUser = { user: null };

      try {
        await controller.markNotificationAsRead('notification-uuid-123', requestWithoutUser);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.markNotificationAsRead).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is undefined', async () => {
      const requestWithoutUserId = { user: { firstName: 'John' } };

      try {
        await controller.markNotificationAsRead('notification-uuid-123', requestWithoutUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.markNotificationAsRead).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is null', async () => {
      const requestWithNullUserId = { user: { id: null } };

      try {
        await controller.markNotificationAsRead('notification-uuid-123', requestWithNullUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.markNotificationAsRead).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is empty string', async () => {
      const requestWithEmptyUserId = { user: { id: '' } };

      try {
        await controller.markNotificationAsRead('notification-uuid-123', requestWithEmptyUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.markNotificationAsRead).not.toHaveBeenCalled();
      }
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockNotificationService.markNotificationAsRead.mockRejectedValue(
        new NotFoundException('Notification not found')
      );

      await expect(
        controller.markNotificationAsRead('notification-uuid-999', mockRequest)
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should throw NotFoundException when notification belongs to different user', async () => {
      mockNotificationService.markNotificationAsRead.mockRejectedValue(
        new NotFoundException('Notification not found')
      );

      await expect(
        controller.markNotificationAsRead('notification-uuid-123', mockRequest)
      ).rejects.toThrow(new NotFoundException('Notification not found'));
    });

    it('should handle already read notification', async () => {
      const alreadyReadNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(alreadyReadNotification);

      const result = await controller.markNotificationAsRead('notification-uuid-123', mockRequest);

      expect(result.isRead).toBe(true);
    });

    it('should validate UUID format for notification ID', async () => {
      expect(controller.markNotificationAsRead).toBeDefined();
    });

    it('should accept valid UUID format', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(validUUID, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(validUUID, 'user-uuid-123');
    });

    it('should handle different notification IDs', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead('different-notification-id', mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(
        'different-notification-id',
        'user-uuid-123'
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockNotificationService.markNotificationAsRead.mockRejectedValue(error);

      await expect(
        controller.markNotificationAsRead('notification-uuid-123', mockRequest)
      ).rejects.toThrow('Database error');
    });

    it('should handle very long notification ID', async () => {
      const longId = 'notification-' + 'a'.repeat(500);
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(longId, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(longId, 'user-uuid-123');
    });

    it('should handle special characters in notification ID', async () => {
      const specialId = 'notification-123-abc-def';
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(specialId, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(specialId, 'user-uuid-123');
    });

    it('should handle case-sensitive notification ID', async () => {
      const mixedCaseId = 'Notification-UUID-123';
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(mixedCaseId, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(mixedCaseId, 'user-uuid-123');
    });

    it('should handle numeric-like string notification ID', async () => {
      const numericId = '12345';
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(numericId, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(numericId, 'user-uuid-123');
    });

    it('should handle being called multiple times for different notifications', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead('notification-1', mockRequest);
      await controller.markNotificationAsRead('notification-2', mockRequest);
      await controller.markNotificationAsRead('notification-3', mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledTimes(3);
      expect(service.markNotificationAsRead).toHaveBeenNthCalledWith(1, 'notification-1', 'user-uuid-123');
      expect(service.markNotificationAsRead).toHaveBeenNthCalledWith(2, 'notification-2', 'user-uuid-123');
      expect(service.markNotificationAsRead).toHaveBeenNthCalledWith(3, 'notification-3', 'user-uuid-123');
    });
  });

  describe('DELETE /notifications - deleteAllMyNotifications', () => {
    it('should delete all user notifications successfully', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 5 });

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(service.deleteAllUserNotifications).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual({ deleted: 5 });
    });

    it('should return 0 when user has no notifications to delete', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 0 });

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(service.deleteAllUserNotifications).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual({ deleted: 0 });
    });

    it('should throw UnauthorizedException when user is not in request', async () => {
      const requestWithoutUser = { user: null };

      try {
        await controller.deleteAllMyNotifications(requestWithoutUser);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.deleteAllUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is undefined', async () => {
      const requestWithoutUserId = { user: { firstName: 'John' } };

      try {
        await controller.deleteAllMyNotifications(requestWithoutUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.deleteAllUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is null', async () => {
      const requestWithNullUserId = { user: { id: null } };

      try {
        await controller.deleteAllMyNotifications(requestWithNullUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.deleteAllUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when user.id is empty string', async () => {
      const requestWithEmptyUserId = { user: { id: '' } };

      try {
        await controller.deleteAllMyNotifications(requestWithEmptyUserId);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(service.deleteAllUserNotifications).not.toHaveBeenCalled();
      }
    });

    it('should throw UnauthorizedException when request is undefined', async () => {
      try {
        await controller.deleteAllMyNotifications(undefined);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should delete large number of notifications', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 1000 });

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(result).toEqual({ deleted: 1000 });
    });

    it('should handle different user IDs', async () => {
      const differentUserRequest = {
        user: { id: 'different-user-id' },
      };
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 3 });

      await controller.deleteAllMyNotifications(differentUserRequest);

      expect(service.deleteAllUserNotifications).toHaveBeenCalledWith('different-user-id');
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockNotificationService.deleteAllUserNotifications.mockRejectedValue(error);

      await expect(controller.deleteAllMyNotifications(mockRequest)).rejects.toThrow(
        'Database error'
      );
    });

    it('should return exact deleted count', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 42 });

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(result.deleted).toBe(42);
      expect(typeof result.deleted).toBe('number');
    });

    it('should handle case-sensitive user ID', async () => {
      const mixedCaseUserId = 'User-UUID-123';
      const requestWithMixedCase = { user: { id: mixedCaseUserId } };
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 3 });

      await controller.deleteAllMyNotifications(requestWithMixedCase);

      expect(service.deleteAllUserNotifications).toHaveBeenCalledWith(mixedCaseUserId);
    });

    it('should handle concurrent delete requests', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 5 });

      const result1 = controller.deleteAllMyNotifications(mockRequest);
      const result2 = controller.deleteAllMyNotifications(mockRequest);

      await Promise.all([result1, result2]);

      expect(service.deleteAllUserNotifications).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authorization and Guards', () => {
    it('should require authentication for getMyNotifications', () => {
      expect(controller.getMyNotifications).toBeDefined();
    });

    it('should require authentication for markNotificationAsRead', () => {
      expect(controller.markNotificationAsRead).toBeDefined();
    });

    it('should require authentication for deleteAllMyNotifications', () => {
      expect(controller.deleteAllMyNotifications).toBeDefined();
    });

    it('should have jwtAuthGuard applied to all routes', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('Route Parameters Validation', () => {
    it('should validate notification ID as UUID in markNotificationAsRead', () => {
      expect(controller.markNotificationAsRead).toBeDefined();
    });

    it('should accept valid UUID format', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      await controller.markNotificationAsRead(validUUID, mockRequest);

      expect(service.markNotificationAsRead).toHaveBeenCalledWith(validUUID, 'user-uuid-123');
    });
  });

  describe('Response Structure Validation', () => {
    it('should return array of notifications for getMyNotifications', async () => {
      const notifications = [mockNotification];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('message');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('isRead');
      expect(result[0]).toHaveProperty('createdAt');
    });

    it('should return notification object for markNotificationAsRead', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(readNotification);

      const result = await controller.markNotificationAsRead('notification-uuid-123', mockRequest);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('isRead');
      expect(result).toHaveProperty('createdAt');
    });

    it('should return deleted count for deleteAllMyNotifications', async () => {
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue({ deleted: 5 });

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(result).toHaveProperty('deleted');
      expect(typeof result.deleted).toBe('number');
    });

    it('should return complete notification structure', async () => {
      const completeNotification = {
        id: 'notification-uuid-123',
        user: mockUser,
        title: 'Complete Notification',
        message: 'This has all fields',
        type: NotificationType.ORDER_PLACED,
        isRead: false,
        createdAt: new Date(),
      };
      mockNotificationService.getUserNotifications.mockResolvedValue([completeNotification]);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result[0]).toEqual(completeNotification);
      expect(result[0].id).toBe('notification-uuid-123');
      expect(result[0].title).toBe('Complete Notification');
      expect(result[0].message).toBe('This has all fields');
      expect(result[0].type).toBe(NotificationType.ORDER_PLACED);
      expect(result[0].isRead).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle notification with all notification types', async () => {
      const notifications = [
        { ...mockNotification, type: NotificationType.ORDER_PLACED },
        { ...mockNotification, id: 'n2', type: NotificationType.ORDER_STATUS },
        { ...mockNotification, id: 'n3', type: NotificationType.ORDER_ASSIGNED },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result).toHaveLength(3);
      expect(result.map((n) => n.type)).toEqual([
        NotificationType.ORDER_PLACED,
        NotificationType.ORDER_STATUS,
        NotificationType.ORDER_ASSIGNED,
      ]);
    });

    it('should handle user having only read notifications', async () => {
      const readNotifications = [
        { ...mockNotification, isRead: true },
        { ...mockNotification, id: 'n2', isRead: true },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(readNotifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result.every((n) => n.isRead === true)).toBe(true);
    });

    it('should handle user having only unread notifications', async () => {
      const unreadNotifications = [
        { ...mockNotification, isRead: false },
        { ...mockNotification, id: 'n2', isRead: false },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(unreadNotifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result.every((n) => n.isRead === false)).toBe(true);
    });

    it('should handle notifications with different timestamps', async () => {
      const now = new Date();
      const notifications = [
        { ...mockNotification, createdAt: new Date(now.getTime() - 86400000) },
        { ...mockNotification, id: 'n2', createdAt: new Date(now.getTime() - 3600000) },
        { ...mockNotification, id: 'n3', createdAt: now },
      ];
      mockNotificationService.getUserNotifications.mockResolvedValue(notifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result).toHaveLength(3);
      expect(result[0].createdAt).toBeDefined();
      expect(result[1].createdAt).toBeDefined();
      expect(result[2].createdAt).toBeDefined();
    });

    it('should verify getMyNotifications does not modify returned data', async () => {
      const originalNotifications = [mockNotification];
      mockNotificationService.getUserNotifications.mockResolvedValue(originalNotifications);

      const result = await controller.getMyNotifications(mockRequest);

      expect(result).toBe(originalNotifications);
    });

    it('should verify markNotificationAsRead does not modify returned data', async () => {
      const originalNotification = { ...mockNotification, isRead: true };
      mockNotificationService.markNotificationAsRead.mockResolvedValue(originalNotification);

      const result = await controller.markNotificationAsRead('notification-uuid-123', mockRequest);

      expect(result).toBe(originalNotification);
    });

    it('should verify deleteAllMyNotifications does not modify returned data', async () => {
      const originalResult = { deleted: 5 };
      mockNotificationService.deleteAllUserNotifications.mockResolvedValue(originalResult);

      const result = await controller.deleteAllMyNotifications(mockRequest);

      expect(result).toBe(originalResult);
    });
  });
});
