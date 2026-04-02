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
    generateBulkUploadSampleCsv: vi.fn(),
    bulkUploadCSV: vi.fn(),
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

    it("should generate seller report and set seller filename", async () => {
      const req = { user: { id: "u2", role: "seller" } };
      const res = createRes();
      mockReportService.generateReport.mockResolvedValue("csv-data");
      res.send.mockReturnValue("sent");

      await controller.getReport(req, "monthly", res as any);

      expect(reportService.generateReport).toHaveBeenCalledWith("u2", "monthly");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=seller-report.csv",
      );
      expect(res.send).toHaveBeenCalledWith("csv-data");
    });

    it("should pass undefined filter to service when query filter is omitted", async () => {
      const req = { user: { id: "u3", role: "admin" } };
      const res = createRes();
      mockReportService.generateReport.mockResolvedValue("csv-data");
      res.send.mockReturnValue("sent");

      await controller.getReport(req, undefined as any, res as any);

      expect(reportService.generateReport).toHaveBeenCalledWith("u3", undefined);
    });

    it("should propagate service errors", async () => {
      const req = { user: { id: "u4", role: "admin" } };
      const res = createRes();
      mockReportService.generateReport.mockRejectedValue(new Error("report generation failed"));

      await expect(controller.getReport(req, "daily", res as any)).rejects.toThrow(
        "report generation failed",
      );
    });
  });

  describe("downloadSample", () => {
    it("should return sample csv with proper headers", async () => {
      const res = createRes();
      mockReportService.generateBulkUploadSampleCsv.mockResolvedValue(
        "name,shopId,categoryId,subCategoryId\nPhone,shop-1,cat-1,sub-1",
      );
      res.send.mockReturnValue("sent");

      const result = await controller.downloadSample(res as any);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=sample-products.csv",
      );
      expect(reportService.generateBulkUploadSampleCsv).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining("name,shopId,categoryId,subCategoryId"));
      expect(result).toBe("sent");
    });
  });

  describe("uploadProductsCsv", () => {
    const sellerReq = { user: { id: "seller-1", role: { name: "SELLER" } } };
    const adminReq = { user: { id: "admin-1", role: { name: "ADMIN" } } };
    const file = { originalname: "products.csv", buffer: Buffer.from("a,b\n1,2") } as Express.Multer.File;

    it("should throw when file is missing", async () => {
      await expect(controller.uploadProductsCsv(undefined as any, sellerReq as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.uploadProductsCsv(undefined as any, sellerReq as any)).rejects.toThrow(
        "File is required",
      );
    });

    it("should throw when user is not seller", async () => {
      await expect(controller.uploadProductsCsv(file, adminReq as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.uploadProductsCsv(file, adminReq as any)).rejects.toThrow(
        "Only sellers can upload products",
      );
    });

    it("should call service with file and authenticated seller", async () => {
      const serviceResponse = {
        message: "Successfully processed 1 rows",
        totalProcessed: 1,
        successCount: 1,
        errorCount: 0,
        errors: [],
        products: [{ id: "p1" }],
      };
      mockReportService.bulkUploadCSV.mockResolvedValue(serviceResponse);

      const result = await controller.uploadProductsCsv(file, sellerReq as any);

      expect(reportService.bulkUploadCSV).toHaveBeenCalledWith(file, sellerReq.user);
      expect(result).toEqual(serviceResponse);
    });

    it("should propagate service failure from bulk upload", async () => {
      mockReportService.bulkUploadCSV.mockRejectedValue(new Error("invalid CSV"));

      await expect(controller.uploadProductsCsv(file, sellerReq as any)).rejects.toThrow("invalid CSV");
    });
  });
});
