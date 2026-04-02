import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Repository } from "typeorm";
import * as XLSX from "xlsx";
import { ReportService } from "./report.service";
import { Order } from "../orders/entity/order.entity";
import { User } from "../auth/entity/user.entity";
import { Product } from "../products/entity/product.entity";
import { Category } from "../categories/entity/category.entity";
import { SubCategory } from "../categories/entity/sub-category.entity";
import { Shop } from "../shops/entity/shop.entity";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";

describe("ReportService", () => {
  let service: ReportService;
  let orderRepository: Repository<Order>;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;
  let subCategoryRepository: Repository<SubCategory>;
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

  const mockSubCategoryRepository = {
    find: vi.fn(),
  };

  const mockShopRepository = {
    findOne: vi.fn(),
    find: vi.fn(),
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
        { provide: getRepositoryToken(SubCategory), useValue: mockSubCategoryRepository },
        { provide: getRepositoryToken(Shop), useValue: mockShopRepository },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    subCategoryRepository = module.get<Repository<SubCategory>>(getRepositoryToken(SubCategory));
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
      expect(csv).toContain("PACKED");
      expect(csv).toContain("PENDING");
      expect(csv).toContain("Fresh Mart");
      expect(csv).toContain("John");
      expect(csv).toContain("Apple");
      expect(csv).toContain("(2x $99)");
    });
  });

  describe("bulkUploadExcel", () => {
    const sellerUser = { id: "seller-1", role: { name: "SELLER" } };
    const categoriesFixture = [
      {
        id: "cat-1",
        name: "Electronics",
        subCategories: [{ id: "sub-1", name: "Mobiles" }],
      },
      {
        id: "cat-2",
        name: "Footwear",
        subCategories: [{ id: "sub-2", name: "Shoes" }],
      },
    ];

    const toExcelFile = (rows: any[][]) => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      return {
        buffer: XLSX.write(wb, { type: "buffer", bookType: "xlsx" }),
      } as Express.Multer.File;
    };

    it("should throw when categories are not available", async () => {
      mockCategoryRepository.find.mockResolvedValue([]);
      const file = toExcelFile([["name", "categoryId"], ["Phone", "cat-1"]]);

      await expect(service.bulkUploadExcel(file, sellerUser)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.bulkUploadExcel(file, sellerUser)).rejects.toThrow(
        "No categories found. Please create category and subcategory first.",
      );
    });

    it("should ignore empty template rows and process only filled rows", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue({ id: "shop-1" });
      mockProductRepository.create.mockImplementation((payload: any) => payload);
      mockProductRepository.save.mockResolvedValue({ id: "prod-1", name: "Phone" });

      const file = toExcelFile([
        ["name", "mrp", "sellingPrice", "categoryId", "subCategoryId"],
        ["Phone", "1000", "900", "cat-1", "sub-1"],
        ["", "", "", "", ""],
        [null, null, null, null, null],
      ]);

      const result: any = await service.bulkUploadExcel(file, sellerUser);

      expect(result.totalProcessed).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it("should support category/subcategory names selected from dropdown", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue({ id: "shop-1" });
      mockProductRepository.create.mockImplementation((payload: any) => payload);
      mockProductRepository.save.mockResolvedValue({ id: "prod-2" });

      const file = toExcelFile([
        ["name", "mrp", "categoryId", "subCategoryId"],
        ["Laptop", "50000", "Electronics", "Mobiles"],
      ]);

      const result: any = await service.bulkUploadExcel(file, sellerUser);

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: categoriesFixture[0],
          subCategory: categoriesFixture[0].subCategories[0],
        }),
      );
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it("should reject subcategory when it does not belong to selected category", async () => {
      mockCategoryRepository.find.mockResolvedValue(categoriesFixture);
      mockShopRepository.findOne.mockResolvedValue({ id: "shop-1" });

      const file = toExcelFile([
        ["name", "mrp", "categoryId", "subCategoryId"],
        ["Sneaker", "2000", "Footwear", "Mobiles"],
      ]);

      const result: any = await service.bulkUploadExcel(file, sellerUser);

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toContain("Subcategory not found under Footwear");
    });
  });

  describe("generateBulkUploadSampleExcel", () => {
    it("should generate sample excel and send response", async () => {
      mockCategoryRepository.find.mockResolvedValue([
        { id: "cat-1", name: "Electronics" },
      ]);
      mockSubCategoryRepository.find.mockResolvedValue([
        {
          id: "sub-1",
          name: "Mobiles",
          category: { id: "cat-1", name: "Electronics" },
        },
      ]);

      const res = {
        setHeader: vi.fn(),
        send: vi.fn().mockReturnValue("sent"),
      } as any;

      const result = await service.generateBulkUploadSampleExcel(res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=sample-products.xlsx",
      );
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
      expect(result).toBe("sent");
    });

    it("should throw when categories are not available", async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      await expect(
        service.generateBulkUploadSampleExcel({ setHeader: vi.fn(), send: vi.fn() } as any),
      ).rejects.toThrow("No categories found. Please create category and subcategory first.");
    });
  });
});
