import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProfileController } from './delivery-profile.controller';
import { DeliveryProfileService } from './delivery-profile.service';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { UserRole } from '../common/enum/roles.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeliveryProfileController', () => {
  let controller: DeliveryProfileController;
  let deliveryProfileService: DeliveryProfileService;

  const mockDeliveryProfileService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
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

  const mockDeliveryProfile = {
    id: 1,
    name: 'Test Delivery Profile',
    phone: '1234567890',
    address: '123 Test St',
    user: { id: '1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryProfileController],
      providers: [
        {
          provide: DeliveryProfileService,
          useValue: mockDeliveryProfileService,
        },
      ],
    }).compile();

    controller = module.get<DeliveryProfileController>(DeliveryProfileController);
    deliveryProfileService = module.get<DeliveryProfileService>(DeliveryProfileService);
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

      mockDeliveryProfileService.create.mockResolvedValue(mockDeliveryProfile);

      const result = await controller.create(dto, { user: mockUser });

      expect(deliveryProfileService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockDeliveryProfile);
    });
  });

  describe('findAll', () => {
    it('should get all delivery profiles', async () => {
      const mockProfiles = [mockDeliveryProfile];

      mockDeliveryProfileService.findAll.mockResolvedValue(mockProfiles);

      const result = await controller.findAll();

      expect(deliveryProfileService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('findById', () => {
    it('should get delivery profile by id', async () => {
      const profileId = 1;

      mockDeliveryProfileService.findById.mockResolvedValue(mockDeliveryProfile);

      const result = await controller.findById(profileId, { user: mockUser });

      expect(deliveryProfileService.findById).toHaveBeenCalledWith(profileId, mockUser);
      expect(result).toEqual(mockDeliveryProfile);
    });
  });
});
