import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Repository } from "typeorm";
import { ReportService } from "./report.service";
import { Order } from "../orders/entity/order.entity";
import { User } from "../auth/entity/user.entity";
import { Product } from "../products/entity/product.entity";
import { Category } from "../categories/entity/category.entity";
import { Shop } from "../shops/entity/shop.entity";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";

describe("ReportService", () => {
  let service: ReportService;
  let orderRepository: Repository<Order>;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;
  let shopRepository: Repository<Shop>;

  const mockOrderRepository = {
    createQueryBuilder: vi.fn(),
  };

  const mockUserRepository = {
    findOne: vi.fn(),
  };

  const mockProductRepository = {
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockCategoryRepository = {
    find: vi.fn(),
  };

  const mockShopRepository = {
    findOne: vi.fn(),
  };

  const qb = {
    leftJoinAndSelect: vi.fn(),
    innerJoin: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    getMany: vi.fn(),
  };

  beforeEach(async () => {
    qb.leftJoinAndSelect.mockReturnValue(qb);
    qb.innerJoin.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.orderBy.mockReturnValue(qb);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepository },
        { provide: getRepositoryToken(Shop), useValue: mockShopRepository },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    shopRepository = module.get<Repository<Shop>>(getRepositoryToken(Shop));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generateReport", () => {
    it("should throw when user does not exist", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.generateReport("missing-user", "daily")).rejects.toThrow("User not found");
    });

    it("should generate report for admin without seller joins", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: "u1", role: { name: "ADMIN" } });
      mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
      qb.getMany.mockResolvedValue([]);

      const convertSpy = vi.spyOn(service as any, "convertToCSV").mockReturnValue("csv-content");

      const result = await service.generateReport("u1", "invalid-filter");

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: "u1" },
        relations: ["role"],
      });
      expect(orderRepository.createQueryBuilder).toHaveBeenCalledWith("order");
      expect(qb.innerJoin).not.toHaveBeenCalled();
      expect(qb.andWhere).not.toHaveBeenCalledWith(
        "order.createdAt BETWEEN :start AND :end",
        expect.anything(),
      );
      expect(qb.orderBy).toHaveBeenCalledWith("order.createdAt", "DESC");
      expect(convertSpy).toHaveBeenCalledWith([]);
      expect(result).toBe("csv-content");
    });

    it("should apply seller scoping joins for seller user", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: "seller-1", role: { name: "SELLER" } });
      mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
      qb.getMany.mockResolvedValue([]);
      vi.spyOn(service as any, "convertToCSV").mockReturnValue("csv-content");

      await service.generateReport("seller-1", "invalid-filter");

      expect(qb.innerJoin).toHaveBeenCalledWith("items.product", "productFilter");
      expect(qb.innerJoin).toHaveBeenCalledWith("productFilter.shop", "shopFilter");
      expect(qb.innerJoin).toHaveBeenCalledWith("shopFilter.seller", "shopUser");
      expect(qb.andWhere).toHaveBeenCalledWith("shopUser.id = :userId", { userId: "seller-1" });
    });

    it("should apply date filter for supported filter values", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: "admin-1", role: { name: "ADMIN" } });
      mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
      qb.getMany.mockResolvedValue([]);
      vi.spyOn(service as any, "convertToCSV").mockReturnValue("csv-content");

      await service.generateReport("admin-1", "daily");

      expect(qb.andWhere).toHaveBeenCalledWith(
        "order.createdAt BETWEEN :start AND :end",
        expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date),
        }),
      );
    });

    it("should convert returned orders to CSV", async () => {
      const orders = [{ id: "o1" }, { id: "o2" }];
      mockUserRepository.findOne.mockResolvedValue({ id: "admin-1", role: { name: "ADMIN" } });
      mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
      qb.getMany.mockResolvedValue(orders);
      const convertSpy = vi.spyOn(service as any, "convertToCSV").mockReturnValue("csv-two-rows");

      const result = await service.generateReport("admin-1", "monthly");

      expect(convertSpy).toHaveBeenCalledWith(orders);
      expect(result).toBe("csv-two-rows");
    });
  });

  describe("convertToCSV", () => {
    it("should flatten orders with items and map enum display names", () => {
      const data = [
        {
          user: { firstName: "John", lastName: "Doe" },
          items: [
            {
              quantity: 2,
              price: 99,
              product: {
                name: "Apple",
                shop: {
                  shopName: "Fresh Mart",
                  seller: { firstName: "Sara", lastName: "Lee" },
                },
              },
            },
          ],
          totalAmount: 198,
          status: OrderStatus.OUT_FOR_DELIVERY,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: paymentMethod.CASH_ON_DELIVERY,
          cancelReason: null,
        },
      ];

      const csv = (service as any).convertToCSV(data);

      expect(csv).toContain("OUT FOR DELIVERY");
      // Current implementation checks OrderStatus enum first, so overlapping numeric
      // values are mapped using order-status labels.
      expect(csv).toContain("PACKED");
      expect(csv).toContain("PENDING");
      expect(csv).toContain("Fresh Mart");
      expect(csv).toContain("John");
      expect(csv).toContain("Apple");
      expect(csv).toContain("(2x $99)");
    });

    it("should create single row for order without items and honor start index", () => {
      const data = [
        {
          user: { firstName: "No", lastName: "Items" },
          items: [],
          totalAmount: 10,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: paymentMethod.ONLINE_PAYMENT,
          cancelReason: "N/A",
        },
      ];

      const csv = (service as any).convertToCSV(data, 10);

      expect(csv).toContain("\n10,");
      expect(csv).toContain("CONFIRMED");
      expect(csv).toContain("N/A");
    });
  });

  describe("bulkUploadCSV", () => {
    const sellerUser = { id: "seller-1", role: { name: "SELLER" } };
    const adminUser = { id: "admin-1", role: { name: "ADMIN" } };
    const categoriesFixture = [
      {
        id: "cat-1",
        name: "Electronics",
        subCategories: [{ id: "sub-1", name: "Mobiles" }],
      },
      {
        id: "cat-2",
        name: "Fashion",
        subCategories: [{ id: "sub-2", name: "T-Shirts" }],
      },
    ];

    const toFile = (content: string) =>
      ({
        buffer: Buffer.from(content),
      } as Express.Multer.File);

    it("should throw when categories are not available", async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      const file = toFile("name,price\nPhone,1000");

      await expect(service.bulkUploadCSV(file, sellerUser)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.bulkUploadCSV(file, sellerUser)).rejects.toThrow(
        "No categories found. Please create category and subcategory first.",
      );
    });

    it("should collect row-level validation errors for missing required fields and invalid price", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue({ id: "shop-1" });

      const file = toFile(
        "name,price,category\n,100,Electronics\nMilk,abc,Electronics\n",
      );

      const result: any = await service.bulkUploadCSV(file, sellerUser);

      expect(result.totalProcessed).toBe(2);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(2);
      expect(result.errors).toContain("Row 1: Name and one of price/sellingPrice/mrp is required");
      expect(result.errors).toContain("Row 2: Invalid price for Milk");
    });

    it("should reject seller rows when seller shop is not found", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue(null);

      const file = toFile("name,price,category\nPhone,1000,Electronics");
      const result: any = await service.bulkUploadCSV(file, sellerUser);

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toContain("Row 1: No shop found for seller");
    });

    it("should reject admin rows when provided shopId does not exist", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue(null);

      const file = toFile("name,price,category,shopId\nPhone,1000,Electronics,missing-shop");
      const result: any = await service.bulkUploadCSV(file, adminUser);

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toContain("Row 1: Shop not found");
    });

    it("should create products successfully with default category and default subcategory when not provided", async () => {
      const sellerShop = { id: "shop-1" };
      const createdProduct = { id: "prod-1", name: "Phone" };

      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue(sellerShop);
      mockProductRepository.create.mockImplementation((payload: any) => payload);
      mockProductRepository.save.mockResolvedValue(createdProduct);

      const file = toFile(
        "name,price,mrp,sellingPrice,stockQuantity,isAvailable,images\nPhone,1000,1200,1000,5,true,\"https://a.com/1.jpg,https://a.com/2.jpg\"",
      );

      const result: any = await service.bulkUploadCSV(file, sellerUser);

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Phone",
          mrp: 1200,
          sellingPrice: 1000,
          stockQuantity: 5,
          category: categoriesFixture[0],
          subCategory: categoriesFixture[0].subCategories[0],
          shop: sellerShop,
          images: ["https://a.com/1.jpg", "https://a.com/2.jpg"],
        }),
      );
      expect(productRepository.save).toHaveBeenCalled();
      expect(result.totalProcessed).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.products).toEqual([createdProduct]);
    });

    it("should support repository save returning array of products", async () => {
      const sellerShop = { id: "shop-1" };
      const savedProducts = [{ id: "p1" }, { id: "p2" }];

      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue(sellerShop);
      mockProductRepository.create.mockImplementation((payload: any) => payload);
      mockProductRepository.save.mockResolvedValue(savedProducts);

      const file = toFile("name,price,category,subCategory\nPhone,1000,Electronics,Mobiles");
      const result: any = await service.bulkUploadCSV(file, sellerUser);

      expect(result.successCount).toBe(2);
      expect(result.products).toEqual(savedProducts);
    });

    it("should allow categoryId/subCategoryId columns from product table relations", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue({ id: "shop-1" });
      mockProductRepository.create.mockImplementation((payload: any) => payload);
      mockProductRepository.save.mockResolvedValue({ id: "p1" });

      const file = toFile(
        "name,mrp,sellingPrice,stockQuantity,isAvailable,unit,isVeg,images,categoryId,subCategoryId\nPhone,1000,950,12,true,pieces,true,\"https://a.com/1.jpg\",cat-1,sub-1",
      );
      const result: any = await service.bulkUploadCSV(file, sellerUser);

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: categoriesFixture[0],
          subCategory: categoriesFixture[0].subCategories[0],
        }),
      );
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });
  });

  describe("generateBulkUploadSampleCsv", () => {
    it("should throw when no categories exist", async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      await expect(service.generateBulkUploadSampleCsv()).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.generateBulkUploadSampleCsv()).rejects.toThrow(
        "No categories found. Please create category and subcategory first.",
      );
    });

    it("should generate product-table aligned sample with relation columns", async () => {
      mockCategoryRepository.find.mockResolvedValue([
        {
          id: "cat-1",
          name: "Electronics",
          subCategories: [{ id: "sub-1", name: "Mobiles" }],
        },
      ]);

      const csv = await service.generateBulkUploadSampleCsv();

      expect(csv).toContain('"name","description","longDescription"');
      expect(csv).toContain('"mrp","sellingPrice","discountPercentage"');
      expect(csv).toContain('"shopId","categoryId","subCategoryId"');
      expect(csv).toContain("categoryOptions");
      expect(csv).toContain("subCategoryOptions");
      expect(csv).toContain("cat-1");
      expect(csv).toContain("sub-1");
    });
  });
});
