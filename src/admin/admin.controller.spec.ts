import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { userServices } from 'src/users/users.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AdminController', () => {
  let controller: AdminController;
  let service: userServices;

  const mockUserServices = {
    adminApproveUser: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: userServices,
          useValue: mockUserServices,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<userServices>(userServices);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('approveSellerOrDelivery', () => {
    it('should approve a user', async () => {
      const mockResult = { message: 'user approved successfully' };
      mockUserServices.adminApproveUser.mockResolvedValue(mockResult);
      
      const result = await controller.approveSellerOrDelivery('1');
      
      expect(result).toEqual(mockResult);
      expect(mockUserServices.adminApproveUser).toHaveBeenCalledWith('1');
    });
  });
});
