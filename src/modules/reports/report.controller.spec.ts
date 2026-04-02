import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";

describe("ReportController", () => {
  let controller: ReportController;
  let reportService: ReportService;

  const mockReportService = {
    generateReport: vi.fn(),
    generateBulkUploadSampleExcel: vi.fn(),
    bulkUploadExcel: vi.fn(),
    getCategories: vi.fn(),
    getSubcategories: vi.fn(),
  };

  const createRes = () => ({
    setHeader: vi.fn(),
    send: vi.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [{ provide: ReportService, useValue: mockReportService }],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    reportService = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getReport", () => {
    it("should generate admin report and set admin filename", async () => {
      const req = { user: { id: "u1", role: "admin" } };
      const res = createRes();
      mockReportService.generateReport.mockResolvedValue("csv-data");
      res.send.mockReturnValue("sent");

      const result = await controller.getReport(req, "daily", res as any);

      expect(reportService.generateReport).toHaveBeenCalledWith("u1", "daily");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=admin-report.csv",
      );
      expect(res.send).toHaveBeenCalledWith("csv-data");
      expect(result).toBe("sent");
    });
  });

  describe("downloadSample", () => {
    it("should return sample csv with proper headers", async () => {
      const res = createRes();
      res.send.mockReturnValue("sent");

      const result = await controller.downloadSample(res as any);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=sample-products.csv",
      );
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining("name,description,longDescription"));
      expect(result).toBe("sent");
    });
  });

  describe("downloadSampleExcel", () => {
    it("should delegate to service", async () => {
      const res = createRes();
      mockReportService.generateBulkUploadSampleExcel.mockResolvedValue("sent");

      const result = await controller.downloadSampleExcel(res as any);

      expect(reportService.generateBulkUploadSampleExcel).toHaveBeenCalledWith(res);
      expect(result).toBe("sent");
    });
  });

  describe("uploadProductsExcel", () => {
    const sellerReq = { user: { id: "seller-1", role: { name: "SELLER" } } };
    const adminReq = { user: { id: "admin-1", role: { name: "ADMIN" } } };
    const file = {
      originalname: "products.xlsx",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;

    it("should throw when file is missing", async () => {
      await expect(controller.uploadProductsExcel(undefined as any, sellerReq as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.uploadProductsExcel(undefined as any, sellerReq as any)).rejects.toThrow(
        "File is required",
      );
    });

    it("should throw when user is not seller", async () => {
      await expect(controller.uploadProductsExcel(file, adminReq as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.uploadProductsExcel(file, adminReq as any)).rejects.toThrow(
        "Only sellers can upload products",
      );
    });

    it("should call service with file and seller", async () => {
      const serviceResponse = {
        message: "Successfully processed 1 rows",
        totalProcessed: 1,
        successCount: 1,
        errorCount: 0,
        errors: [],
        products: [{ id: "p1" }],
      };
      mockReportService.bulkUploadExcel.mockResolvedValue(serviceResponse);

      const result = await controller.uploadProductsExcel(file, sellerReq as any);

      expect(reportService.bulkUploadExcel).toHaveBeenCalledWith(file, sellerReq.user);
      expect(result).toEqual(serviceResponse);
    });
  });

  describe("category helpers", () => {
    it("should return categories", async () => {
      const payload = [{ id: "cat-1", name: "Electronics" }];
      mockReportService.getCategories.mockResolvedValue(payload);

      const result = await controller.getCategories();

      expect(reportService.getCategories).toHaveBeenCalledTimes(1);
      expect(result).toEqual(payload);
    });

    it("should return subcategories for category", async () => {
      const payload = [{ id: "sub-1", name: "Mobiles", categoryId: "cat-1", categoryName: "Electronics" }];
      mockReportService.getSubcategories.mockResolvedValue(payload);

      const result = await controller.getSubcategories("cat-1");

      expect(reportService.getSubcategories).toHaveBeenCalledWith("cat-1");
      expect(result).toEqual(payload);
    });
  });
});
