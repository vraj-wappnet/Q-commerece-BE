import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProfileService } from './delivery-profile.service';
import { DeliveryProfile } from './entity/delivery-profile.entity';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { UserRole } from 'src/common/enum/roles.enum';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeliveryProfileService', () => {
  let service: DeliveryProfileService;
  let repo: Repository<DeliveryProfile>;

  const mockRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'delivery@example.com',
    role: UserRole.DELIVERY,
  };

  const mockAdminUser = {
    id: '2',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockDeliveryProfile: DeliveryProfile = {
    id: 1,
    name: 'Test Delivery Profile',
    phone: '1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    pincode: '400001',
    vehicleNumber: 'MH12AB3456',
    vehicleType: 'motorcycle',
    drivingLicense: 'DL123456',
    user: { id: '1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryProfileService,
        {
          provide: getRepositoryToken(DeliveryProfile),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<DeliveryProfileService>(DeliveryProfileService);
    repo = module.get<Repository<DeliveryProfile>>(getRepositoryToken(DeliveryProfile));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create delivery profile successfully', async () => {
      const dto: CreateDeliveryProfileDto = {
        vehicleType: 'motorcycle',
        vehicleName: 'Honda Activa',
        rcBookPhoto: 'rc_book.jpg',
        licensePhoto: 'license.jpg',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '400001',
        latitude: 19.076090,
        longitude: 72.877426,
      };

      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockDeliveryProfile);
      mockRepo.save.mockResolvedValue(mockDeliveryProfile);

      const result = await service.create(dto, mockUser);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        user: { id: mockUser.id },
      });
      expect(repo.save).toHaveBeenCalledWith(mockDeliveryProfile);
      expect(result).toEqual(mockDeliveryProfile);
    });

    it('should throw error if profile already exists', async () => {
      const dto: CreateDeliveryProfileDto = {
        vehicleType: 'motorcycle',
        vehicleName: 'Honda Activa',
        rcBookPhoto: 'rc_book.jpg',
        licensePhoto: 'license.jpg',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '400001',
        latitude: 19.076090,
        longitude: 72.877426,
      };

      mockRepo.findOne.mockResolvedValue(mockDeliveryProfile);

      await expect(service.create(dto, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should get all delivery profiles', async () => {
      const mockProfiles = [mockDeliveryProfile];

      mockRepo.find.mockResolvedValue(mockProfiles);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        relations: ['user']
      });
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('findById', () => {
    it('should get delivery profile by id', async () => {
      const profileId = 1;

      mockRepo.findOne.mockResolvedValue(mockDeliveryProfile);

      const result = await service.findById(profileId, mockUser);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: profileId },
        relations: ['user']
      });
      expect(result).toEqual(mockDeliveryProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const profileId = 999;

      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(profileId, mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const profileId = 1;
      const unauthorizedUser = { ...mockUser, id: '999' };

      mockRepo.findOne.mockResolvedValue({
        ...mockDeliveryProfile,
        user: { id: '1' },
      });

      await expect(service.findById(profileId, unauthorizedUser))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
