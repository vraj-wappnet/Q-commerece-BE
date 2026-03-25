import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shops.controller';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { updateShopDto } from './dto/update-shop.dto';
import { FilterShopDto } from './dto/filter-shop.dto';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ShopController', () => {
  let controller: ShopController;
  let shopService: ShopsService;

  const mockShopsService = {
    createShop: vi.fn(),
    updateShop: vi.fn(),
    getAllShops: vi.fn(),
    getShopById: vi.fn(),
    deleteShop: vi.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'seller@example.com',
    role: 2, // SELLER
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        {
          provide: ShopsService,
          useValue: mockShopsService,
        },
      ],
    }).compile();

    controller = module.get<ShopController>(ShopController);
    shopService = module.get<ShopsService>(ShopsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createShop', () => {
    it('should create a new shop', async () => {
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
      const mockShop = { id: '1', name: 'Test Shop' };

      mockShopsService.createShop.mockResolvedValue(mockShop);

      const result = await controller.createShop(dto, { user: mockUser });

      expect(shopService.createShop).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockShop);
    });
  });

  describe('updateshop', () => {
    it('should update shop', async () => {
      const shopId = '1';
      const dto: updateShopDto = {
        shopName: 'Updated Shop',
        addressLine1: 'Updated Address',
      };
      const mockShop = { id: '1', name: 'Updated Shop' };

      mockShopsService.updateShop.mockResolvedValue(mockShop);

      const result = await controller.updateshop(shopId, dto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(dto, shopId, mockUser);
      expect(result).toEqual(mockShop);
    });
  });

  describe('getAllShops', () => {
    it('should get all shops with filters', async () => {
      const query: FilterShopDto = {
        search: 'test',
        sort: 'ASC',
        sortBy: 'createdAt',
        page: 1,
        limit: 10,
      };
      const mockShops = {
        shops: [{ id: '1', name: 'Test Shop' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockShopsService.getAllShops.mockResolvedValue(mockShops);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockShops);
    });

    it('should get all shops without filters', async () => {
      const query: FilterShopDto = {};
      const mockShops = {
        shops: [{ id: '1', name: 'Test Shop' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockShopsService.getAllShops.mockResolvedValue(mockShops);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockShops);
    });
  });

  describe('getShopById', () => {
    it('should get shop by id', async () => {
      const shopId = '1';
      const mockShop = { id: '1', name: 'Test Shop' };

      mockShopsService.getShopById.mockResolvedValue(mockShop);

      const result = await controller.getShopById(shopId);

      expect(shopService.getShopById).toHaveBeenCalledWith(shopId);
      expect(result).toEqual(mockShop);
    });
  });

  describe('deleteShop', () => {
    it('should delete shop', async () => {
      const shopId = '1';
      const mockResult = { message: 'Shop deleted successfully' };

      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      const result = await controller.deleteShop(shopId, { user: mockUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith(shopId, mockUser);
      expect(result).toEqual(mockResult);
    });
  });
});
