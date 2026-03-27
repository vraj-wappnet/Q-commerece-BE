import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from './shops.service';
import { Shop } from './entity/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { updateShopDto } from './dto/update-shop.dto';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ShopsService', () => {
  let service: ShopsService;
  let shopRepo: Repository<Shop>;

  const mockShopRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
    delete: vi.fn(),
  };

  const mockSeller = {
    id: 'seller-123',
    email: 'seller@example.com',
    role: { name: 'SELLER' },
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: { name: 'ADMIN' },
  };

  const mockShop: Shop = {
    id: 'shop-123',
    shopName: 'Test Shop',
    addressLine1: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    pinCode: '400001',
    country: 'India',
    seller: { id: 'seller-123' } as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
    const validDto: CreateShopDto = {
      shopName: 'Test Shop',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      pinCode: '400001',
      country: 'India',
      pickupAddress: 'Warehouse Address',
      shopLicense: 'license123.pdf',
      gstNumber: '22AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      businessRegistrationNumber: 'BR123456',
      fssaiNumber: 'FSSAI789',
      accountHolderName: 'Test Account',
      accountNumber: '123456789012345',
      ifscCode: 'ABCD0ABCDE',
      bankName: 'Test Bank',
      cancelledChequeImage: 'cancelled.jpg',
      alternatePhone: '1234567891',
      whatsappNumber: '9876543210',
      websiteUrl: 'https://example.com',
      instagram: '@example_insta',
      facebook: 'facebook.com/example',
    };

    it('should create a shop successfully with all fields', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);
      mockShopRepo.create.mockReturnValue(mockShop);
      mockShopRepo.save.mockResolvedValue(mockShop);

      const result = await service.createShop(validDto, mockSeller.id);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { seller: { id: mockSeller.id } },
      });
      expect(shopRepo.create).toHaveBeenCalledWith({
        ...validDto,
        seller: { id: mockSeller.id },
      });
      expect(shopRepo.save).toHaveBeenCalledWith(mockShop);
      expect(result).toEqual(mockShop);
    });

    it('should create a shop with only required fields', async () => {
      const minimalDto: CreateShopDto = {
        shopName: 'Minimal Shop',
        addressLine1: '456 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        country: 'India',
        gstNumber: '27AAAAA0000A1Z5',
        panNumber: 'AAAAA1234A',
        accountHolderName: 'Account Holder',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
      } as any;

      mockShopRepo.findOne.mockResolvedValue(null);
      mockShopRepo.create.mockReturnValue(mockShop);
      mockShopRepo.save.mockResolvedValue(mockShop);

      const result = await service.createShop(minimalDto, mockSeller.id);

      expect(result).toEqual(mockShop);
    });

    it('should throw error if sellerId is empty string', async () => {
      try {
        await service.createShop(validDto, '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Invalid authenticated user');
      }
    });

    it('should throw error if sellerId is null', async () => {
      try {
        await service.createShop(validDto, null as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Invalid authenticated user');
      }
    });

    it('should throw error if sellerId is undefined', async () => {
      try {
        await service.createShop(validDto, undefined as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Invalid authenticated user');
      }
    });

    it('should throw error if seller already has a shop', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      try {
        await service.createShop(validDto, mockSeller.id);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Seller already registered a shop');
      }

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { seller: { id: mockSeller.id } },
      });
      expect(shopRepo.create).not.toHaveBeenCalled();
      expect(shopRepo.save).not.toHaveBeenCalled();
    });

    it('should handle database errors during save', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);
      mockShopRepo.create.mockReturnValue(mockShop);
      mockShopRepo.save.mockRejectedValue(new Error('Database error'));

      try {
        await service.createShop(validDto, mockSeller.id);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
    });

    it('should properly associate seller with shop', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);
      mockShopRepo.create.mockReturnValue(mockShop);
      mockShopRepo.save.mockResolvedValue(mockShop);

      await service.createShop(validDto, 'different-seller-id');

      expect(shopRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          seller: { id: 'different-seller-id' },
        })
      );
    });
  });

  describe('updateShop', () => {
    const updateDto: updateShopDto = {
      shopName: 'Updated Shop',
      addressLine1: 'Updated Address',
      city: 'Updated City',
    };

    it('should update shop successfully', async () => {
      const updatedShop = { ...mockShop, ...updateDto };
      mockShopRepo.findOne
        .mockResolvedValueOnce(mockShop)
        .mockResolvedValueOnce(updatedShop);
      mockShopRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateShop(updateDto, mockShop.id, mockSeller);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockShop.id },
        relations: ['seller'],
      });
      expect(shopRepo.update).toHaveBeenCalledWith(mockShop.id, updateDto);
      expect(result).toEqual(updatedShop);
    });

    it('should update only specified fields', async () => {
      const partialUpdate: updateShopDto = { shopName: 'New Name Only' };
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateShop(partialUpdate, mockShop.id, mockSeller);

      expect(shopRepo.update).toHaveBeenCalledWith(mockShop.id, partialUpdate);
    });

    it('should throw error if shop not found', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);

      try {
        await service.updateShop(updateDto, 'non-existent-id', mockSeller);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Shop not found');
      }

      expect(shopRepo.update).not.toHaveBeenCalled();
    });

    it('should throw error if user is not the shop owner', async () => {
      const unauthorizedUser = { ...mockSeller, id: 'different-seller-id' };
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      try {
        await service.updateShop(updateDto, mockShop.id, unauthorizedUser);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Unauthorized to update this shop');
      }

      expect(shopRepo.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.update.mockRejectedValue(new Error('Database error'));

      try {
        await service.updateShop(updateDto, mockShop.id, mockSeller);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
    });

    it('should update all optional fields', async () => {
      const fullUpdate: updateShopDto = {
        shopName: 'Fully Updated Shop',
        addressLine1: 'New Address Line 1',
        addressLine2: 'New Address Line 2',
        city: 'New City',
        state: 'New State',
        pinCode: '400002',
        pickupAddress: 'New Pickup',
        shopLicense: 'new-license.pdf',
        gstNumber: '27BBBBB0000B1Z5',
        panNumber: 'BBBBB1234B',
        businessRegistrationNumber: 'BR654321',
        fssaiNumber: 'FSSAI456',
        accountHolderName: 'New Account',
        accountNumber: '987654321098',
        ifscCode: 'ICIC0001234',
        bankName: 'ICICI Bank',
        cancelledChequeImage: 'new-cheque.jpg',
        alternatePhone: '9876543210',
        whatsappNumber: '1234567890',
        websiteUrl: 'https://newsite.com',
        instagram: '@new_insta',
        facebook: 'facebook.com/new',
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateShop(fullUpdate, mockShop.id, mockSeller);

      expect(shopRepo.update).toHaveBeenCalledWith(mockShop.id, fullUpdate);
    });
  });

  describe('getAllShops', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn(),
    };

    beforeEach(() => {
      mockShopRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should get all shops with default pagination', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      const result = await service.getAllShops({});

      expect(shopRepo.createQueryBuilder).toHaveBeenCalledWith('shop');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('shop.seller', 'seller');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('shop.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: shops,
      });
    });

    it('should filter shops by search term', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({ search: 'Test Shop' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(shop.shopName) LIKE LOWER(:search) OR CAST(shop.id as TEXT) LIKE :search',
        { search: '%Test Shop%' }
      );
    });

    it('should handle SQL injection attempts in search', async () => {
      const shops = [];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 0]);

      await service.getAllShops({ search: "'; DROP TABLE shops; --" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(shop.shopName) LIKE LOWER(:search) OR CAST(shop.id as TEXT) LIKE :search',
        { search: "%'; DROP TABLE shops; --%"}
      );
    });

    it('should filter by date range', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'shop.createdAt BETWEEN :fromDate AND :toDate',
        { fromDate: '2024-01-01', toDate: '2024-12-31' }
      );
    });

    it('should sort by specified field in ascending order', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({ sortBy: 'shopName', sortOrder: 'ASC' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('shop.shopName', 'ASC');
    });

    it('should sort by specified field in descending order', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({ sortBy: 'createdAt', sortOrder: 'DESC' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('shop.createdAt', 'DESC');
    });

    it('should handle custom pagination', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 25]);

      const result = await service.getAllShops({ page: 2, limit: 5 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(5);
    });

    it('should calculate total pages correctly', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 23]);

      const result = await service.getAllShops({ page: 1, limit: 10 });

      expect(result.totalPages).toBe(3);
    });

    it('should return empty array when no shops found', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAllShops({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should combine multiple filters', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({
        search: 'Test',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        sortBy: 'shopName',
        sortOrder: 'ASC',
        page: 2,
        limit: 20,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('shop.shopName', 'ASC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should handle empty search string', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({ search: '' });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only search', async () => {
      const shops = [mockShop];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([shops, 1]);

      await service.getAllShops({ search: '   ' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(shop.shopName) LIKE LOWER(:search) OR CAST(shop.id as TEXT) LIKE :search',
        { search: '%   %' }
      );
    });
  });

  describe('getShopById', () => {
    it('should get shop by id successfully', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      const result = await service.getShopById(mockShop.id);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockShop.id },
        relations: ['seller'],
      });
      expect(result).toEqual(mockShop);
    });

    it('should throw error if shop not found', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);

      try {
        await service.getShopById('non-existent-id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Shop not found');
      }
    });

    it('should include seller relation', async () => {
      const shopWithSeller = {
        ...mockShop,
        seller: {
          id: 'seller-123',
          email: 'seller@example.com',
          name: 'Seller Name',
        },
      };
      mockShopRepo.findOne.mockResolvedValue(shopWithSeller);

      const result = await service.getShopById(mockShop.id);

      expect(result.seller).toBeDefined();
      expect((result as any).seller.id).toBe('seller-123');
    });

    it('should handle database errors', async () => {
      mockShopRepo.findOne.mockRejectedValue(new Error('Database error'));

      try {
        await service.getShopById(mockShop.id);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
    });
  });

  describe('deleteShop', () => {
    it('should delete shop successfully as owner', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteShop(mockShop.id, mockSeller);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockShop.id },
        relations: ['seller'],
      });
      expect(shopRepo.delete).toHaveBeenCalledWith(mockShop.id);
      expect(result).toEqual({ message: 'Shop deleted successfully' });
    });

    it('should delete shop successfully as admin', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteShop(mockShop.id, mockAdmin);

      expect(shopRepo.delete).toHaveBeenCalledWith(mockShop.id);
      expect(result).toEqual({ message: 'Shop deleted successfully' });
    });

    it('should throw error if shop not found', async () => {
      mockShopRepo.findOne.mockResolvedValue(null);

      try {
        await service.deleteShop('non-existent-id', mockSeller);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Shop not found');
      }

      expect(shopRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user is not owner and not admin', async () => {
      const unauthorizedUser = {
        id: 'other-user-id',
        role: { name: 'SELLER' },
      };
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      try {
        await service.deleteShop(mockShop.id, unauthorizedUser);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Unauthorized to delete this shop');
      }

      expect(shopRepo.delete).not.toHaveBeenCalled();
    });

    it('should allow admin to delete any shop', async () => {
      const shopOwnedByOther = {
        ...mockShop,
        seller: { id: 'other-seller-id' },
      };
      mockShopRepo.findOne.mockResolvedValue(shopOwnedByOther);
      mockShopRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteShop(mockShop.id, mockAdmin);

      expect(shopRepo.delete).toHaveBeenCalledWith(mockShop.id);
      expect(result).toEqual({ message: 'Shop deleted successfully' });
    });

    it('should handle database errors during delete', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockShopRepo.delete.mockRejectedValue(new Error('Database error'));

      try {
        await service.deleteShop(mockShop.id, mockSeller);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
    });

    it('should not allow customer role to delete shop', async () => {
      const customerUser = {
        id: 'customer-id',
        role: { name: 'CUSTOMER' },
      };
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      try {
        await service.deleteShop(mockShop.id, customerUser);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Unauthorized to delete this shop');
      }
    });
  });
});
