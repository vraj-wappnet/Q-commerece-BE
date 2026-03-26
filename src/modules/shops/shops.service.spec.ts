import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from './shops.service';
import { Shop } from './entity/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { updateShopDto } from './dto/update-shop.dto';
import { FilterShopDto } from './dto/filter-shop.dto';
import { User } from '../modules/auth/entity/user.entity';
import { UserRole } from '../common/enum/roles.enum';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ShopsService', () => {
  let service: ShopsService;
  let shopRepo: Repository<Shop>;

  const mockShopRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
    delete: vi.fn(),
  };

  const mockSeller: User = {
    id: '1',
    email: 'seller@example.com',
    role: UserRole.SELLER,
  } as any;

  const mockShop: Shop = {
    id: '1',
    shopName: 'Test Shop',
    seller: { id: '1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        {
          provide: getRepositoryToken(Shop),
          useValue: mockShopRepo,
        },
      ],
    }).compile();

    service = module.get<ShopsService>(ShopsService);
    shopRepo = module.get<Repository<Shop>>(getRepositoryToken(Shop));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createShop', () => {
    it('should create a shop successfully', async () => {
      const dto: CreateShopDto = {
        shopName: 'Test Shop',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pinCode: '400001',
        country: 'India',
        accountHolderName: 'Test Account',
        accountNumber: '123456789012345',
        ifscCode: 'ABCD0ABCDE',
        bankName: 'Test Bank',
        gstNumber: '22AAAAA0000A1Z5',
        panNumber: 'ABCDE1234F',
        addressLine2: 'Apt 4B',
        pickupAddress: 'Warehouse',
        shopLicense: 'license123.pdf',
        businessRegistrationNumber: 'BR123456',
        fssaiNumber: 'FSSAI789',
        cancelledChequeImage: 'cancelled.jpg',
        alternatePhone: '1234567891',
        whatsappNumber: '9876543210',
        websiteUrl: 'https://example.com',
        instagram: '@example_insta',
        facebook: 'facebook.com/example',
      };

      mockShopRepo.findOne.mockResolvedValue(null);
      mockShopRepo.create.mockReturnValue(mockShop);
      mockShopRepo.save.mockResolvedValue(mockShop);

      const result = await service.createShop(dto, mockSeller.id);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { seller: { id: mockSeller.id } },
      });
      expect(shopRepo.create).toHaveBeenCalledWith({
        ...dto,
        seller: { id: mockSeller.id },
      });
      expect(shopRepo.save).toHaveBeenCalledWith(mockShop);
      expect(result).toEqual(mockShop);
    });

    it('should throw error if sellerId is not provided', async () => {
      const dto: CreateShopDto = {
        shopName: 'Test Shop',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        pinCode: '400001',
        country: 'India',
        pickupAddress: 'Warehouse',
        shopLicense: 'license123.pdf',
        gstNumber: '27AAAPL1234C1ZV',
        panNumber: 'AAAPL1234C',
        businessRegistrationNumber: 'BR123456',
        fssaiNumber: 'FSSAI789',
        accountHolderName: 'Test Account',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'Test Bank',
        cancelledChequeImage: 'cancelled.jpg',
        alternatePhone: '1234567891',
        whatsappNumber: '9876543210',
        websiteUrl: 'https://example.com',
        instagram: '@example_insta',
        facebook: 'facebook.com/example',
      };

      await expect(service.createShop(dto, ''))
        .rejects.toThrow('Invalid authenticated user');
    });

    it('should throw error if seller already has a shop', async () => {
      const dto: CreateShopDto = {
        shopName: 'Test Shop',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        pinCode: '400001',
        country: 'India',
        pickupAddress: 'Warehouse',
        shopLicense: 'license123.pdf',
        gstNumber: '27AAAPL1234C1ZV',
        panNumber: 'AAAPL1234C',
        businessRegistrationNumber: 'BR123456',
        fssaiNumber: 'FSSAI789',
        accountHolderName: 'Test Account',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'Test Bank',
        cancelledChequeImage: 'cancelled.jpg',
        alternatePhone: '1234567891',
        whatsappNumber: '9876543210',
        websiteUrl: 'https://example.com',
        instagram: '@example_insta',
        facebook: 'facebook.com/example',
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);

      await expect(service.createShop(dto, mockSeller.id))
        .rejects.toThrow('Seller already registered a shop');
    });
  });

  describe('updateShop', () => {
    it('should update shop successfully', async () => {
      const shopId = '1';
      const dto: CreateShopDto = {
        shopName: 'Updated Shop',
        addressLine1: 'Updated Address',
        city: 'Updated City',
        state: 'Updated State',
        pinCode: '400002',
        country: 'India',
        accountHolderName: 'Updated Account',
        accountNumber: '123456789012346',
        ifscCode: 'ABCD0ABCDF',
        bankName: 'Updated Bank',
        gstNumber: '22AAAAA0000A1Z6',
        panNumber: 'ABCDE1235G',
        addressLine2: 'Apt 5C',
        pickupAddress: 'Updated Warehouse',
        shopLicense: 'license456.pdf',
        businessRegistrationNumber: 'BR123457',
        fssaiNumber: 'FSSAI790',
        cancelledChequeImage: 'cancelled2.jpg',
        alternatePhone: '1234567892',
        whatsappNumber: '9876543211',
        websiteUrl: 'https://updated.com',
        instagram: 'updated_instagram',
        facebook: 'updated_facebook',
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateShop(dto, shopId, mockSeller);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: shopId },
        relations: ["seller"],
      });
      expect(shopRepo.update).toHaveBeenCalledWith(shopId, dto);
      expect(result);
    });

    it('should throw error if shop not found', async () => {
      const shopId = '999';
      const dto: updateShopDto = { shopName: 'Updated Shop' };

      mockShopRepo.findOne.mockResolvedValue(null);

      await expect(service.updateShop(dto, shopId, mockSeller))
        .rejects.toThrow('Shop not found');
    });

    it('should throw error if user is not authorized', async () => {
      const shopId = '1';
      const dto: updateShopDto = { shopName: 'Updated Shop' };
      const unauthorizedUser = { ...mockSeller, id: '999' };

      mockShopRepo.findOne.mockResolvedValue(mockShop);

      await expect(service.updateShop(dto, shopId, unauthorizedUser))
        .rejects.toThrow('Unauthorized to update this shop');
    });
  });

  describe('getAllShops', () => {
    it('should get all shops with filters', async () => {
      const query: FilterShopDto = {
        search: 'test',
        sortBy: 'createdAt',
        sort: 'ASC',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 1,
        limit: 10,
      };
      const mockShops = [mockShop];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockShops, 1]),
      };

      mockShopRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllShops(query);

      expect(shopRepo.createQueryBuilder).toHaveBeenCalledWith('shop');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('shop.seller', 'seller');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "LOWER(shop.shopName) LIKE LOWER(:search) OR CAST(shop.id as TEXT) LIKE :search",
        { search: `%test%` }
      );
    });

    it('should get all shops without filters', async () => {
      const query: FilterShopDto = {};
      const mockShops = [mockShop];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockShops, 1]),
      };

      mockShopRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllShops(query);

      expect(shopRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('getShopById', () => {
    it('should get shop by id', async () => {
      const shopId = '1';

      mockShopRepo.findOne.mockResolvedValue(mockShop);

      const result = await service.getShopById(shopId);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: shopId },
        relations: ['seller'],
      });
      expect(result).toEqual(mockShop);
    });

    it('should throw error if shop not found', async () => {
      const shopId = '999';

      mockShopRepo.findOne.mockResolvedValue(null);

      await expect(service.getShopById(shopId))
        .rejects.toThrow('Shop not found');

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: shopId },
        relations: ['seller'],
      });
    });
  });

  describe('deleteShop', () => {
    it('should delete shop successfully', async () => {
      const shopId = '1';

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteShop(shopId, mockSeller);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: shopId },
        relations: ['seller'],
      });
      expect(shopRepo.delete).toHaveBeenCalledWith(shopId);
      expect(result).toEqual({ message: 'Shop deleted successfully' });
    });

    it('should throw error if shop not found', async () => {
      const shopId = '999';

      mockShopRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteShop(shopId, mockSeller))
        .rejects.toThrow('Shop not found');
    });

    it('should throw error if user is not authorized', async () => {
      const shopId = '1';
      const unauthorizedUser = { ...mockSeller, id: '999' };

      mockShopRepo.findOne.mockResolvedValue(mockShop);

      await expect(service.deleteShop(shopId, unauthorizedUser))
        .rejects.toThrow('Unauthorized to delete this shop');
    });
  });
});
