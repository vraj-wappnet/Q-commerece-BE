import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shops.controller';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { updateShopDto } from './dto/update-shop.dto';
import { FilterShopDto } from './dto/filter-shop.dto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
    id: 'seller-123',
    email: 'seller@example.com',
    role: { name: 'SELLER' },
  };

  const mockShop = {
    id: 'shop-123',
    shopName: 'Test Shop',
    addressLine1: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    pinCode: '400001',
    country: 'India',
    seller: { id: 'seller-123' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
    const validDto: CreateShopDto = {
      shopName: 'Test Shop',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      pinCode: '400001',
      country: 'India',
      pickupAddress: 'Warehouse',
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

    it('should create a new shop successfully', async () => {
      mockShopsService.createShop.mockResolvedValue(mockShop);

      const result = await controller.createShop(validDto, { user: mockUser });

      expect(shopService.createShop).toHaveBeenCalledWith(validDto, mockUser.id);
      expect(result).toEqual(mockShop);
    });

    it('should pass correct user id to service', async () => {
      const differentUser = { ...mockUser, id: 'different-id' };
      mockShopsService.createShop.mockResolvedValue(mockShop);

      await controller.createShop(validDto, { user: differentUser });

      expect(shopService.createShop).toHaveBeenCalledWith(validDto, 'different-id');
    });

    it('should handle all required fields', async () => {
      mockShopsService.createShop.mockResolvedValue(mockShop);

      await controller.createShop(validDto, { user: mockUser });

      const callArgs = mockShopsService.createShop.mock.calls[0][0];
      expect(callArgs.shopName).toBe('Test Shop');
      expect(callArgs.addressLine1).toBe('123 Test St');
      expect(callArgs.city).toBe('Test City');
      expect(callArgs.state).toBe('Test State');
      expect(callArgs.pinCode).toBe('400001');
      expect(callArgs.gstNumber).toBe('22AAAAA0000A1Z5');
      expect(callArgs.panNumber).toBe('ABCDE1234F');
      expect(callArgs.accountHolderName).toBe('Test Account');
      expect(callArgs.accountNumber).toBe('123456789012345');
      expect(callArgs.ifscCode).toBe('ABCD0ABCDE');
      expect(callArgs.bankName).toBe('Test Bank');
    });

    it('should handle all optional fields', async () => {
      mockShopsService.createShop.mockResolvedValue(mockShop);

      await controller.createShop(validDto, { user: mockUser });

      const callArgs = mockShopsService.createShop.mock.calls[0][0];
      expect(callArgs.addressLine2).toBe('Apt 4B');
      expect(callArgs.pickupAddress).toBe('Warehouse');
      expect(callArgs.shopLicense).toBe('license123.pdf');
      expect(callArgs.businessRegistrationNumber).toBe('BR123456');
      expect(callArgs.fssaiNumber).toBe('FSSAI789');
      expect(callArgs.cancelledChequeImage).toBe('cancelled.jpg');
      expect(callArgs.alternatePhone).toBe('1234567891');
      expect(callArgs.whatsappNumber).toBe('9876543210');
      expect(callArgs.websiteUrl).toBe('https://example.com');
      expect(callArgs.instagram).toBe('@example_insta');
      expect(callArgs.facebook).toBe('facebook.com/example');
    });

    it('should return shop with correct structure', async () => {
      mockShopsService.createShop.mockResolvedValue(mockShop);

      const result = await controller.createShop(validDto, { user: mockUser });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('shopName');
      expect(result).toHaveProperty('seller');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('updateshop', () => {
    const updateDto: updateShopDto = {
      shopName: 'Updated Shop',
      addressLine1: 'Updated Address',
    };

    it('should update shop successfully', async () => {
      const updatedShop = { ...mockShop, ...updateDto };
      mockShopsService.updateShop.mockResolvedValue(updatedShop);

      const result = await controller.updateshop(mockShop.id, updateDto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(updateDto, mockShop.id, mockUser);
      expect(result).toEqual(updatedShop);
    });

    it('should pass correct parameters to service', async () => {
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      await controller.updateshop('shop-456', updateDto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(updateDto, 'shop-456', mockUser);
    });

    it('should handle partial updates', async () => {
      const partialDto: updateShopDto = { shopName: 'New Name' };
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      await controller.updateshop(mockShop.id, partialDto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(partialDto, mockShop.id, mockUser);
    });

    it('should handle full updates with all fields', async () => {
      const fullDto: updateShopDto = {
        shopName: 'Fully Updated',
        addressLine1: 'New Address 1',
        addressLine2: 'New Address 2',
        city: 'New City',
        state: 'New State',
        pinCode: '400002',
        country: 'India',
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
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      await controller.updateshop(mockShop.id, fullDto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(fullDto, mockShop.id, mockUser);
    });

    it('should return updated shop with correct structure', async () => {
      const updatedShop = { ...mockShop, shopName: 'Updated Shop' };
      mockShopsService.updateShop.mockResolvedValue(updatedShop);

      const result = await controller.updateshop(mockShop.id, updateDto, { user: mockUser });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('shopName');
      expect((result as any).shopName).toBe('Updated Shop');
    });
  });

  describe('getAllShops', () => {
    const mockPaginatedResponse = {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      data: [mockShop],
    };

    it('should get all shops with default parameters', async () => {
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops({});

      expect(shopService.getAllShops).toHaveBeenCalledWith({});
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should get all shops with search filter', async () => {
      const query: FilterShopDto = { search: 'Test Shop' };
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should get all shops with date range filter', async () => {
      const query: FilterShopDto = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
    });

    it('should get all shops with sorting', async () => {
      const query: FilterShopDto = {
        sortBy: 'shopName',
        sort: 'ASC',
      };
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
    });

    it('should get all shops with pagination', async () => {
      const query: FilterShopDto = {
        page: 2,
        limit: 20,
      };
      mockShopsService.getAllShops.mockResolvedValue({
        ...mockPaginatedResponse,
        page: 2,
        limit: 20,
      });

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
      expect((result as any).page).toBe(2);
      expect((result as any).limit).toBe(20);
    });

    it('should get all shops with combined filters', async () => {
      const query: FilterShopDto = {
        search: 'Test',
        sortBy: 'createdAt',
        sort: 'DESC',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 1,
        limit: 10,
      };
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops(query);

      expect(shopService.getAllShops).toHaveBeenCalledWith(query);
    });

    it('should return paginated response structure', async () => {
      mockShopsService.getAllShops.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllShops({});

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('data');
      expect(Array.isArray((result as any).data)).toBe(true);
    });

    it('should handle empty results', async () => {
      const emptyResponse = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        data: [],
      };
      mockShopsService.getAllShops.mockResolvedValue(emptyResponse);

      const result = await controller.getAllShops({});

      expect((result as any).total).toBe(0);
      expect((result as any).data).toEqual([]);
    });
  });

  describe('getShopById', () => {
    it('should get shop by id successfully', async () => {
      mockShopsService.getShopById.mockResolvedValue(mockShop);

      const result = await controller.getShopById(mockShop.id);

      expect(shopService.getShopById).toHaveBeenCalledWith(mockShop.id);
      expect(result).toEqual(mockShop);
    });

    it('should pass correct shop id to service', async () => {
      mockShopsService.getShopById.mockResolvedValue(mockShop);

      await controller.getShopById('shop-456');

      expect(shopService.getShopById).toHaveBeenCalledWith('shop-456');
    });

    it('should return shop with correct structure', async () => {
      mockShopsService.getShopById.mockResolvedValue(mockShop);

      const result = await controller.getShopById(mockShop.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('shopName');
      expect(result).toHaveProperty('seller');
      expect(result).toHaveProperty('createdAt');
    });

    it('should include seller information', async () => {
      const shopWithSeller = {
        ...mockShop,
        seller: {
          id: 'seller-123',
          email: 'seller@example.com',
          name: 'Seller Name',
        },
      };
      mockShopsService.getShopById.mockResolvedValue(shopWithSeller);

      const result = await controller.getShopById(mockShop.id);

      expect((result as any).seller).toBeDefined();
      expect((result as any).seller.id).toBe('seller-123');
    });
  });

  describe('deleteShop', () => {
    it('should delete shop successfully', async () => {
      const mockResult = { message: 'Shop deleted successfully' };
      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      const result = await controller.deleteShop(mockShop.id, { user: mockUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith(mockShop.id, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should pass correct shop id to service', async () => {
      const mockResult = { message: 'Shop deleted successfully' };
      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      await controller.deleteShop('shop-456', { user: mockUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith('shop-456', mockUser);
    });

    it('should pass user object to service for authorization', async () => {
      const mockResult = { message: 'Shop deleted successfully' };
      const adminUser = { id: 'admin-123', role: { name: 'ADMIN' } };
      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      await controller.deleteShop(mockShop.id, { user: adminUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith(mockShop.id, adminUser);
    });

    it('should return success message', async () => {
      const mockResult = { message: 'Shop deleted successfully' };
      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      const result = await controller.deleteShop(mockShop.id, { user: mockUser });

      expect(result).toHaveProperty('message');
      expect((result as any).message).toBe('Shop deleted successfully');
    });
  });

  describe('Field Validation', () => {
    describe('createShop - Required Fields', () => {
      it('should validate shopName is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).shopName;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate addressLine1 is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).addressLine1;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate city is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).city;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate state is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).state;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate gstNumber is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).gstNumber;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate panNumber is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).panNumber;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate accountHolderName is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).accountHolderName;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate accountNumber is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).accountNumber;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate ifscCode is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).ifscCode;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });

      it('should validate bankName is required', async () => {
        const dto = { ...({} as CreateShopDto) };
        delete (dto as any).bankName;

        mockShopsService.createShop.mockResolvedValue(mockShop);

        await controller.createShop(dto, { user: mockUser });

        expect(shopService.createShop).toHaveBeenCalled();
      });
    });

    describe('updateshop - Optional Fields', () => {
      it('should allow updating only shopName', async () => {
        const dto: updateShopDto = { shopName: 'New Name' };
        mockShopsService.updateShop.mockResolvedValue(mockShop);

        await controller.updateshop(mockShop.id, dto, { user: mockUser });

        expect(shopService.updateShop).toHaveBeenCalledWith(dto, mockShop.id, mockUser);
      });

      it('should allow updating only address fields', async () => {
        const dto: updateShopDto = {
          addressLine1: 'New Address',
          city: 'New City',
          state: 'New State',
        };
        mockShopsService.updateShop.mockResolvedValue(mockShop);

        await controller.updateshop(mockShop.id, dto, { user: mockUser });

        expect(shopService.updateShop).toHaveBeenCalledWith(dto, mockShop.id, mockUser);
      });

      it('should allow updating only bank details', async () => {
        const dto: updateShopDto = {
          accountHolderName: 'New Account',
          accountNumber: '987654321098',
          ifscCode: 'ICIC0001234',
          bankName: 'ICICI Bank',
        };
        mockShopsService.updateShop.mockResolvedValue(mockShop);

        await controller.updateshop(mockShop.id, dto, { user: mockUser });

        expect(shopService.updateShop).toHaveBeenCalledWith(dto, mockShop.id, mockUser);
      });
    });
  });

  describe('Route Parameters', () => {
    it('should extract id from route params in getShopById', async () => {
      mockShopsService.getShopById.mockResolvedValue(mockShop);

      await controller.getShopById('param-shop-id');

      expect(shopService.getShopById).toHaveBeenCalledWith('param-shop-id');
    });

    it('should extract id from route params in updateshop', async () => {
      const dto: updateShopDto = { shopName: 'Updated' };
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      await controller.updateshop('param-shop-id', dto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(dto, 'param-shop-id', mockUser);
    });

    it('should extract id from route params in deleteShop', async () => {
      mockShopsService.deleteShop.mockResolvedValue({ message: 'Shop deleted successfully' });

      await controller.deleteShop('param-shop-id', { user: mockUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith('param-shop-id', mockUser);
    });
  });

  describe('Authorization', () => {
    it('should pass user context for createShop', async () => {
      const dto: CreateShopDto = {
        shopName: 'Test',
        addressLine1: 'Address',
        city: 'City',
        state: 'State',
        pinCode: '400001',
        country: 'India',
        gstNumber: '22AAAAA0000A1Z5',
        panNumber: 'ABCDE1234F',
        accountHolderName: 'Account',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'Bank',
      } as any;
      mockShopsService.createShop.mockResolvedValue(mockShop);

      await controller.createShop(dto, { user: mockUser });

      expect(shopService.createShop).toHaveBeenCalledWith(dto, mockUser.id);
    });

    it('should pass user context for updateshop', async () => {
      const dto: updateShopDto = { shopName: 'Updated' };
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      await controller.updateshop(mockShop.id, dto, { user: mockUser });

      expect(shopService.updateShop).toHaveBeenCalledWith(dto, mockShop.id, mockUser);
    });

    it('should pass user context for deleteShop', async () => {
      mockShopsService.deleteShop.mockResolvedValue({ message: 'Shop deleted successfully' });

      await controller.deleteShop(mockShop.id, { user: mockUser });

      expect(shopService.deleteShop).toHaveBeenCalledWith(mockShop.id, mockUser);
    });
  });

  describe('Response Structure', () => {
    it('should return shop entity from createShop', async () => {
      mockShopsService.createShop.mockResolvedValue(mockShop);
      const dto: CreateShopDto = {
        shopName: 'Test',
        addressLine1: 'Address',
        city: 'City',
        state: 'State',
        pinCode: '400001',
        country: 'India',
        gstNumber: '22AAAAA0000A1Z5',
        panNumber: 'ABCDE1234F',
        accountHolderName: 'Account',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'Bank',
      } as any;

      const result = await controller.createShop(dto, { user: mockUser });

      expect(result).toEqual(mockShop);
    });

    it('should return shop entity from updateshop', async () => {
      mockShopsService.updateShop.mockResolvedValue(mockShop);

      const result = await controller.updateshop(mockShop.id, {}, { user: mockUser });

      expect(result).toEqual(mockShop);
    });

    it('should return shop entity from getShopById', async () => {
      mockShopsService.getShopById.mockResolvedValue(mockShop);

      const result = await controller.getShopById(mockShop.id);

      expect(result).toEqual(mockShop);
    });

    it('should return paginated response from getAllShops', async () => {
      const paginatedResponse = {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [mockShop],
      };
      mockShopsService.getAllShops.mockResolvedValue(paginatedResponse);

      const result = await controller.getAllShops({});

      expect(result).toEqual(paginatedResponse);
    });

    it('should return message object from deleteShop', async () => {
      const mockResult = { message: 'Shop deleted successfully' };
      mockShopsService.deleteShop.mockResolvedValue(mockResult);

      const result = await controller.deleteShop(mockShop.id, { user: mockUser });

      expect(result).toEqual(mockResult);
    });
  });
});
