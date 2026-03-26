import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

@ApiTags("Media Upload")
@Controller("media")
@ApiTags("Media Upload")
@Controller("media")
export class MediaController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post("upload-media")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor("files", 5)) 
  async uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

    const results: Array<{
      originalName: string;
      url: string;
      type: string;
    }> = [];

    for (const file of files) {
      try {
        const uploaded = await this.cloudinaryService.uploadMedia(file);

        results.push({
          originalName: file.originalname,
          url: uploaded.secure_url,
          type: file.mimetype,
        });
      } catch (error) {
        throw new BadRequestException(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    }

    return {
      message: "Files uploaded successfully",
      count: results.length,
      data: results,
    };
  }
}
