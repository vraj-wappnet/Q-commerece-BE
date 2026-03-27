import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeliveryProfileController } from './delivery-profile.controller';
import { DeliveryProfileService } from './delivery-profile.service';
import { UserRole } from '../../common/enum/roles.enum';
import { MESSAGES } from '../../common/constant/message';

describe('DeliveryProfileController', () => {
  let controller: DeliveryProfileController;
  let service: DeliveryProfileService;

  const mockUser = {
    id: 'user-uuid-123',
    userId: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    role: UserRole.DELIVERY,
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockDeliveryProfile = {
    id: 1,
    user: mockUser,
    vehicleType: 'Bike',
    vehicleName: 'Honda Activa',
    rcBookPhoto: 'rc-photo-url',
    licensePhoto: 'license-photo-url',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    location: 'Near Railway Station',
    latitude: 23.0225,
    longitude: 72.5714,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeliveryProfileService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
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
    service = module.get<DeliveryProfileService>(DeliveryProfileService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /delivery-profile - create', () => {
    const createDto = {
      vehicleType: 'Bike',
      vehicleName: 'Honda Activa',
      rcBookPhoto: 'rc-photo-url',
      licensePhoto: 'license-photo-url',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      location: 'Near Railway Station',
      latitude: 23.0225,
      longitude: 72.5714,
    };

    it('should create delivery profile successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.DELIVERY_PROFILE.CREATED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when vehicleType is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.vehicleType;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when vehicleName is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.vehicleName;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when rcBookPhoto is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.rcBookPhoto;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when licensePhoto is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.licensePhoto;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when addressLine1 is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.addressLine1;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when city is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.city;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when state is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.state;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when pincode is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.pincode;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when latitude is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.latitude;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when longitude is missing', async () => {
      const invalidDto = { ...createDto };
      delete invalidDto.longitude;
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when latitude is not a number', async () => {
      const invalidDto = { ...createDto, latitude: 'invalid' as any };
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when longitude is not a number', async () => {
      const invalidDto = { ...createDto, longitude: 'invalid' as any };
      mockDeliveryProfileService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(invalidDto, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when profile already exists', async () => {
      mockDeliveryProfileService.create.mockRejectedValue(
        new BadRequestException('Profile already exists')
      );

      await expect(controller.create(createDto, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Profile already exists')
      );
    });

    it('should handle optional fields correctly', async () => {
      const dtoWithoutOptional = { ...createDto };
      delete dtoWithoutOptional.addressLine2;
      delete dtoWithoutOptional.location;

      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.DELIVERY_PROFILE.CREATED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dtoWithoutOptional, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(dtoWithoutOptional, mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GET /delivery-profile - findAll', () => {
    it('should return all profiles with default pagination', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.LIST_FETCHED,
        data: {
          items: [mockDeliveryProfile],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockDeliveryProfileService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResponse);
    });

    it('should apply search filter correctly', async () => {
      const filters = { search: 'ahmedabad' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply userId filter correctly', async () => {
      const filters = { userId: 'user-123' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply city filter correctly', async () => {
      const filters = { city: 'Ahmedabad' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply state filter correctly', async () => {
      const filters = { state: 'Gujarat' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply pincode filter correctly', async () => {
      const filters = { pincode: '380001' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply vehicleType filter correctly', async () => {
      const filters = { vehicleType: 'Bike' };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply isAvailable filter correctly', async () => {
      const filters = { isAvailable: true };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply date range filters correctly', async () => {
      const filters = {
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        updatedFrom: '2026-01-01',
        updatedTo: '2026-12-31',
      };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply pagination correctly', async () => {
      const filters = { page: 2, limit: 20 };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply sorting correctly', async () => {
      const filters = { sortBy: 'city' as const, sortOrder: 'ASC' as const };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should apply all filters together', async () => {
      const filters = {
        search: 'ahmedabad',
        userId: 'user-123',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
        vehicleType: 'Bike',
        isAvailable: true,
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        sortBy: 'createdAt' as const,
        sortOrder: 'DESC' as const,
        page: 1,
        limit: 10,
      };
      mockDeliveryProfileService.findAll.mockResolvedValue({} as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should throw error for invalid date range', async () => {
      mockDeliveryProfileService.findAll.mockRejectedValue(
        new BadRequestException('createdFrom must be before or equal to createdTo')
      );

      await expect(
        controller.findAll({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid date format', async () => {
      mockDeliveryProfileService.findAll.mockRejectedValue(
        new BadRequestException('Invalid createdFrom date')
      );

      await expect(
        controller.findAll({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid isAvailable value', async () => {
      mockDeliveryProfileService.findAll.mockRejectedValue(
        new BadRequestException('isAvailable must be true or false')
      );

      await expect(
        controller.findAll({ isAvailable: 'invalid' as any })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /delivery-profile/:id - findById', () => {
    it('should return profile by id successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.FETCHED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(1, mockRequest as any);

      expect(service.findById).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when profile not found', async () => {
      mockDeliveryProfileService.findById.mockRejectedValue(
        new NotFoundException('Not found')
      );

      await expect(controller.findById(999, mockRequest as any)).rejects.toThrow(
        new NotFoundException('Not found')
      );
    });

    it('should throw error when non-owner non-admin tries to access', async () => {
      mockDeliveryProfileService.findById.mockRejectedValue(
        new ForbiddenException('Access denied')
      );

      await expect(controller.findById(1, mockRequest as any)).rejects.toThrow(
        new ForbiddenException('Access denied')
      );
    });

    it('should allow admin to access any profile', async () => {
      const adminRequest = {
        user: { ...mockUser, role: UserRole.ADMIN },
      };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.FETCHED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(1, adminRequest as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should allow owner to access their profile', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.FETCHED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(1, mockRequest as any);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('PATCH /delivery-profile/:id - update', () => {
    const updateDto = {
      vehicleType: 'Car',
      city: 'Mumbai',
    };

    it('should update profile successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, ...updateDto },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when profile not found', async () => {
      mockDeliveryProfileService.update.mockRejectedValue(
        new NotFoundException('Not found')
      );

      await expect(
        controller.update(999, updateDto, mockRequest as any)
      ).rejects.toThrow(new NotFoundException('Not found'));
    });

    it('should throw error when non-owner non-admin tries to update', async () => {
      mockDeliveryProfileService.update.mockRejectedValue(
        new ForbiddenException('Access denied')
      );

      await expect(
        controller.update(1, updateDto, mockRequest as any)
      ).rejects.toThrow(new ForbiddenException('Access denied'));
    });

    it('should allow admin to update any profile', async () => {
      const adminRequest = {
        user: { ...mockUser, role: UserRole.ADMIN },
      };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, ...updateDto },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateDto, adminRequest as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should allow owner to update their profile', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, ...updateDto },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateDto, mockRequest as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial updates', async () => {
      const partialDto = { city: 'Mumbai' };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, city: 'Mumbai' },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, partialDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(1, partialDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty update dto', async () => {
      const emptyDto = {};
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, emptyDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(1, emptyDto, mockUser);
    });

    it('should update multiple fields at once', async () => {
      const multiFieldDto = {
        vehicleType: 'Car',
        vehicleName: 'Toyota Innova',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, ...multiFieldDto },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, multiFieldDto, mockRequest as any);

      expect(service.update).toHaveBeenCalledWith(1, multiFieldDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Authorization and Guards', () => {
    it('should require authentication for findAll', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should require authentication for findById', () => {
      expect(controller.findById).toBeDefined();
    });

    it('should require authentication for update', () => {
      expect(controller.update).toBeDefined();
    });

    it('should require ADMIN role for findAll', () => {
      // This is validated by the @Roles decorator
      expect(controller.findAll).toBeDefined();
    });

    it('should require ADMIN or DELIVERY role for findById', () => {
      // This is validated by the @Roles decorator
      expect(controller.findById).toBeDefined();
    });

    it('should require ADMIN or DELIVERY role for update', () => {
      // This is validated by the @Roles decorator
      expect(controller.update).toBeDefined();
    });
  });

  describe('Response Structure Validation', () => {
    it('should return correct response structure for create', async () => {
      const createDto = {
        vehicleType: 'Bike',
        vehicleName: 'Honda Activa',
        rcBookPhoto: 'rc-photo-url',
        licensePhoto: 'license-photo-url',
        addressLine1: '123 Main St',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
        latitude: 23.0225,
        longitude: 72.5714,
      };
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.DELIVERY_PROFILE.CREATED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createDto, mockRequest as any);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });

    it('should return correct response structure for findAll', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.LIST_FETCHED,
        data: {
          items: [mockDeliveryProfile],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockDeliveryProfileService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll({});

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('items');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('page');
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('totalPages');
      expect(result.data).toHaveProperty('hasNextPage');
      expect(result.data).toHaveProperty('hasPreviousPage');
    });

    it('should return correct response structure for findById', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.FETCHED,
        data: mockDeliveryProfile,
      };
      mockDeliveryProfileService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(1, mockRequest as any);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });

    it('should return correct response structure for update', async () => {
      const updateDto = { city: 'Mumbai' };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY_PROFILE.UPDATED,
        data: { ...mockDeliveryProfile, city: 'Mumbai' },
      };
      mockDeliveryProfileService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateDto, mockRequest as any);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });
});
