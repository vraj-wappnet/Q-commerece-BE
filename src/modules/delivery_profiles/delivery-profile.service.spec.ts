import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryProfileService } from './delivery-profile.service';
import { DeliveryProfile } from './entity/delivery-profile.entity';
import { UserRole } from '../../common/enum/roles.enum';
import { MESSAGES } from '../../common/constant/message';

describe('DeliveryProfileService', () => {
  let service: DeliveryProfileService;
  let repo: Repository<DeliveryProfile>;

  const mockUser = {
    id: 'user-uuid-123',
    userId: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    role: UserRole.DELIVERY,
  };

  const mockAdminUser = {
    id: 'admin-uuid-123',
    userId: 'admin-uuid-123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: { name: 'ADMIN' },
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryProfileService,
        {
          provide: getRepositoryToken(DeliveryProfile),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveryProfileService>(DeliveryProfileService);
    repo = module.get<Repository<DeliveryProfile>>(getRepositoryToken(DeliveryProfile));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
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

    it('should throw BadRequestException when profile already exists', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        new BadRequestException('Profile already exists')
      );
    });

    it('should create profile successfully with user.id', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);
      vi.spyOn(repo, 'create').mockReturnValue(mockDeliveryProfile as any);
      vi.spyOn(repo, 'save').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.create(createDto, mockUser);

      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        user: { id: mockUser.id },
      });
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGES.DELIVERY_PROFILE.CREATED);
      expect(result.data).toEqual(mockDeliveryProfile);
    });

    it('should create profile successfully with user.userId', async () => {
      const userWithUserId = { userId: 'user-uuid-456' };
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);
      vi.spyOn(repo, 'create').mockReturnValue(mockDeliveryProfile as any);
      vi.spyOn(repo, 'save').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.create(createDto, userWithUserId);

      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        user: { id: 'user-uuid-456' },
      });
      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });

    it('should handle optional fields correctly', async () => {
      const dtoWithoutOptional = { ...createDto };
      delete dtoWithoutOptional.addressLine2;
      delete dtoWithoutOptional.location;

      vi.spyOn(repo, 'findOne').mockResolvedValue(null);
      vi.spyOn(repo, 'create').mockReturnValue(mockDeliveryProfile as any);
      vi.spyOn(repo, 'save').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.create(dtoWithoutOptional, mockUser);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });
  });

  describe('findAll', () => {
    it('should return paginated profiles with default parameters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockDeliveryProfile], 1]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.DELIVERY_PROFILE.LIST_FETCHED);
      expect(result.data.items).toEqual([mockDeliveryProfile]);
      expect(result.data.total).toBe(1);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    });

    it('should apply search filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ search: 'ahmedabad' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%ahmedabad%' })
      );
    });

    it('should apply userId filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ userId: 'user-123' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.id = :userId',
        { userId: 'user-123' }
      );
    });

    it('should apply city filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ city: 'Ahmedabad' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.city ILIKE :city',
        { city: '%Ahmedabad%' }
      );
    });

    it('should apply state filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ state: 'Gujarat' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.state ILIKE :state',
        { state: '%Gujarat%' }
      );
    });

    it('should apply pincode filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ pincode: '380001' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.pincode ILIKE :pincode',
        { pincode: '%380001%' }
      );
    });

    it('should apply vehicleType filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ vehicleType: 'Bike' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.vehicleType ILIKE :vehicleType',
        { vehicleType: '%Bike%' }
      );
    });

    it('should apply isAvailable filter with boolean true', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ isAvailable: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.isAvailable = :isAvailable',
        { isAvailable: true }
      );
    });

    it('should apply isAvailable filter with string "true"', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ isAvailable: 'true' as any });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.isAvailable = :isAvailable',
        { isAvailable: true }
      );
    });

    it('should apply isAvailable filter with string "false"', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ isAvailable: 'false' as any });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'deliveryProfile.isAvailable = :isAvailable',
        { isAvailable: false }
      );
    });

    it('should throw BadRequestException for invalid isAvailable string', async () => {
      await expect(
        service.findAll({ isAvailable: 'invalid' as any })
      ).rejects.toThrow(new BadRequestException('isAvailable must be true or false'));
    });

    it('should throw BadRequestException for invalid createdFrom date', async () => {
      await expect(
        service.findAll({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdFrom date'));
    });

    it('should throw BadRequestException for invalid createdTo date', async () => {
      await expect(
        service.findAll({ createdTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdTo date'));
    });

    it('should throw BadRequestException for invalid updatedFrom date', async () => {
      await expect(
        service.findAll({ updatedFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedFrom date'));
    });

    it('should throw BadRequestException for invalid updatedTo date', async () => {
      await expect(
        service.findAll({ updatedTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedTo date'));
    });

    it('should throw BadRequestException when createdFrom is after createdTo', async () => {
      await expect(
        service.findAll({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('createdFrom must be before or equal to createdTo'));
    });

    it('should throw BadRequestException when updatedFrom is after updatedTo', async () => {
      await expect(
        service.findAll({
          updatedFrom: '2026-12-31',
          updatedTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('updatedFrom must be before or equal to updatedTo'));
    });

    it('should handle pagination correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockDeliveryProfile], 25]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data.totalPages).toBe(3);
      expect(result.data.hasNextPage).toBe(true);
      expect(result.data.hasPreviousPage).toBe(true);
    });

    it('should limit maximum items per page to 100', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ limit: 200 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
    });

    it('should prevent SQL injection on sortBy field', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ sortBy: 'malicious; DROP TABLE delivery_profile;' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('deliveryProfile.createdAt', 'DESC');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when profile not found', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findById(999, mockUser)).rejects.toThrow(
        new NotFoundException('Not found')
      );
    });

    it('should return profile for admin user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.findById(1, mockAdminUser);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.DELIVERY_PROFILE.FETCHED);
      expect(result.data).toEqual(mockDeliveryProfile);
    });

    it('should return profile for owner user', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.findById(1, mockUser);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockDeliveryProfile);
    });

    it('should throw ForbiddenException when non-owner non-admin tries to access', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id', role: UserRole.DELIVERY };
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      await expect(service.findById(1, otherUser)).rejects.toThrow(
        new ForbiddenException('Access denied')
      );
    });

    it('should handle user with userId field', async () => {
      const userWithUserId = { userId: mockUser.id, role: UserRole.DELIVERY };
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      const result = await service.findById(1, userWithUserId);

      expect(result.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('update', () => {
    const updateDto = {
      vehicleType: 'Car',
      city: 'Mumbai',
    };

    it('should throw NotFoundException when profile not found', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.update(999, updateDto, mockUser)).rejects.toThrow(
        new NotFoundException('Not found')
      );
    });

    it('should throw ForbiddenException when non-owner non-admin tries to update', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id', role: UserRole.DELIVERY };
      vi.spyOn(repo, 'findOne').mockResolvedValue(mockDeliveryProfile as any);

      await expect(service.update(1, updateDto, otherUser)).rejects.toThrow(
        new ForbiddenException('Access denied')
      );
    });

    it('should update profile for owner user', async () => {
      const updatedProfile = { ...mockDeliveryProfile, ...updateDto };
      vi.spyOn(repo, 'findOne')
        .mockResolvedValueOnce(mockDeliveryProfile as any)
        .mockResolvedValueOnce(updatedProfile as any);
      vi.spyOn(repo, 'update').mockResolvedValue({} as any);

      const result = await service.update(1, updateDto, mockUser);

      expect(repo.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.DELIVERY_PROFILE.UPDATED);
      expect(result.data).toEqual(updatedProfile);
    });

    it('should update profile for admin user', async () => {
      const updatedProfile = { ...mockDeliveryProfile, ...updateDto };
      vi.spyOn(repo, 'findOne')
        .mockResolvedValueOnce(mockDeliveryProfile as any)
        .mockResolvedValueOnce(updatedProfile as any);
      vi.spyOn(repo, 'update').mockResolvedValue({} as any);

      const result = await service.update(1, updateDto, mockAdminUser);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(updatedProfile);
    });

    it('should handle user with userId field', async () => {
      const userWithUserId = { userId: mockUser.id, role: UserRole.DELIVERY };
      const updatedProfile = { ...mockDeliveryProfile, ...updateDto };
      vi.spyOn(repo, 'findOne')
        .mockResolvedValueOnce(mockDeliveryProfile as any)
        .mockResolvedValueOnce(updatedProfile as any);
      vi.spyOn(repo, 'update').mockResolvedValue({} as any);

      const result = await service.update(1, updateDto, userWithUserId);

      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should handle partial updates', async () => {
      const partialDto = { city: 'Mumbai' };
      const updatedProfile = { ...mockDeliveryProfile, city: 'Mumbai' };
      vi.spyOn(repo, 'findOne')
        .mockResolvedValueOnce(mockDeliveryProfile as any)
        .mockResolvedValueOnce(updatedProfile as any);
      vi.spyOn(repo, 'update').mockResolvedValue({} as any);

      const result = await service.update(1, partialDto, mockUser);

      expect(repo.update).toHaveBeenCalledWith(1, partialDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
    });
  });
});
