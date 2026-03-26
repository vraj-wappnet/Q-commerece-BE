import { Test, TestingModule } from "@nestjs/testing";
import { MediaController } from "./media.controller";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("MediaController", () => {
  let controller: MediaController;
  let cloudinaryService: CloudinaryService;

  const mockCloudinaryService = {
    uploadImage: vi.fn(),
  };

  beforeEach(async () => {
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

  describe("uploadImage", () => {
    it("should upload an image and return message and url", async () => {
      const mockFile = { buffer: Buffer.from("test") } as Express.Multer.File;
      const mockCloudinaryResult = {
        secure_url: "http://cloudinary.com/test.png",
      };
      mockCloudinaryService.uploadImage.mockResolvedValue(mockCloudinaryResult);

      const result = await controller.uploadImage(mockFile);

      expect(result).toEqual({
        message: "Image Uploaded Successfully",
        url: mockCloudinaryResult.secure_url,
      });
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
    });

    it("should throw BadRequestException if no file is provided", async () => {
      await expect(controller.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
