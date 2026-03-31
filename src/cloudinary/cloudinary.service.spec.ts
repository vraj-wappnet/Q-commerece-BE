import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { CloudinaryService } from "./cloudinary.service";
import { v2 as cloudinary } from "cloudinary";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

describe("CloudinaryService", () => {
  let service: CloudinaryService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: { get: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("uploadImage", () => {
    it("should upload an image", async () => {
      const mockFile = { 
        buffer: Buffer.from("test"),
        originalname: "test.png",
        mimetype: "image/png"
      } as Express.Multer.File;
      const mockResult = { url: "http://test.com" };

      const uploadStreamMock = {
        end: vi.fn(),
      };

      (cloudinary.uploader.upload_stream as any).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return uploadStreamMock;
        },
      );

      const result = await service.uploadMedia(mockFile);

      expect(result).toEqual(mockResult);
      expect(uploadStreamMock.end).toHaveBeenCalledWith(mockFile.buffer);
    });

    it("should throw error if no buffer provided", async () => {
      const mockFile = {} as Express.Multer.File;
      await expect(service.uploadMedia(mockFile)).rejects.toThrow(
        "No file buffer provided",
      );
    });
  });
});
