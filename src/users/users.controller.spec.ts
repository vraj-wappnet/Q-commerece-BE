import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { userServices } from './users.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UsersController', () => {
  let controller: UsersController;
  let service: userServices;

  const mockUserServices = {
    getProfile: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: userServices,
          useValue: mockUserServices,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<userServices>(userServices);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockResult = { id: '1', email: 'test@test.com' };
      mockUserServices.getProfile.mockResolvedValue(mockResult);
      
      const req = { user: { id: '1' } };
      const result = await controller.getProfile(req);
      
      expect(result).toEqual(mockResult);
      expect(mockUserServices.getProfile).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockResult = [{ id: '1' }];
      mockUserServices.getAllUsers.mockResolvedValue(mockResult);
      
      const result = await controller.getAllUsers();
      
      expect(result).toEqual(mockResult);
      expect(mockUserServices.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockResult = { id: '1' };
      mockUserServices.getUserById.mockResolvedValue(mockResult);
      
      const result = await controller.getUserById('1');
      
      expect(result).toEqual(mockResult);
      expect(mockUserServices.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const dto = { firstName: 'Updated' };
      const mockResult = { message: 'success' };
      mockUserServices.updateProfile.mockResolvedValue(mockResult);
      
      const req = { user: { id: '1' } };
      const result = await controller.updateProfile(req, dto as any);
      
      expect(result).toEqual(mockResult);
      expect(mockUserServices.updateProfile).toHaveBeenCalledWith('1', dto);
    });
  });
});
