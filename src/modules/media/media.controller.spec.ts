import { Test, TestingModule } from "@nestjs/testing";
import { MediaController } from "./media.controller";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("MediaController", () => {
  let controller: MediaController;
  let cloudinaryService: CloudinaryService;

  const mockCloudinaryService = {
    uploadMedia: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("uploadMedia", () => {
    it("should upload multiple files and return message, count, and data", async () => {
      const mockFiles = [
        { 
          buffer: Buffer.from("test1"),
          originalname: "test1.png",
          mimetype: "image/png"
        } as Express.Multer.File,
        { 
          buffer: Buffer.from("test2"),
          originalname: "test2.jpg",
          mimetype: "image/jpeg"
        } as Express.Multer.File,
      ];
      const mockCloudinaryResult = {
        secure_url: "http://cloudinary.com/test.png",
      };
      mockCloudinaryService.uploadMedia.mockResolvedValue(mockCloudinaryResult);

      const result = await controller.uploadMedia(mockFiles);

      expect(result).toEqual({
        message: "Files uploaded successfully",
        count: 2,
        data: [
          {
            originalName: "test1.png",
            url: mockCloudinaryResult.secure_url,
            type: "image/png",
          },
          {
            originalName: "test2.jpg",
            url: mockCloudinaryResult.secure_url,
            type: "image/jpeg",
          },
        ],
      });
      expect(mockCloudinaryService.uploadMedia).toHaveBeenCalledTimes(2);
    });

    it("should upload a single file successfully", async () => {
      const mockFile = [
        { 
          buffer: Buffer.from("test"),
          originalname: "test.png",
          mimetype: "image/png"
        } as Express.Multer.File,
      ];
      const mockCloudinaryResult = {
        secure_url: "http://cloudinary.com/test.png",
      };
      mockCloudinaryService.uploadMedia.mockResolvedValue(mockCloudinaryResult);

      const result = await controller.uploadMedia(mockFile);

      expect(result).toEqual({
        message: "Files uploaded successfully",
        count: 1,
        data: [
          {
            originalName: "test.png",
            url: mockCloudinaryResult.secure_url,
            type: "image/png",
          },
        ],
      });
      expect(mockCloudinaryService.uploadMedia).toHaveBeenCalledWith(mockFile[0]);
    });

    it("should throw BadRequestException if no files are provided", async () => {
      await expect(controller.uploadMedia(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if empty array is provided", async () => {
      await expect(controller.uploadMedia([])).rejects.toThrow(
        new BadRequestException("No files uploaded"),
      );
    });

    it("should throw BadRequestException if upload fails", async () => {
      const mockFile = [
        { 
          buffer: Buffer.from("test"),
          originalname: "test.png",
          mimetype: "image/png"
        } as Express.Multer.File,
      ];
      mockCloudinaryService.uploadMedia.mockRejectedValue(new Error("Upload failed"));

      await expect(controller.uploadMedia(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should handle maximum 5 files", async () => {
      const mockFiles = Array.from({ length: 5 }, (_, i) => ({
        buffer: Buffer.from(`test${i}`),
        originalname: `test${i}.png`,
        mimetype: "image/png"
      } as Express.Multer.File));
      
      const mockCloudinaryResult = {
        secure_url: "http://cloudinary.com/test.png",
      };
      mockCloudinaryService.uploadMedia.mockResolvedValue(mockCloudinaryResult);

      const result = await controller.uploadMedia(mockFiles);

      expect(result.count).toBe(5);
      expect(result.data).toHaveLength(5);
      expect(mockCloudinaryService.uploadMedia).toHaveBeenCalledTimes(5);
    });
  });
});
