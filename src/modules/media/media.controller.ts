import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Get,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PermissionGuard } from "src/modules/roles-permission/permission.guard";
import { Permission } from "src/modules/roles-permission/permissions.decorator";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@ApiTags("Media Upload - Multiple Files (Max 5)")
@Controller("media")
@UseGuards(jwtAuthGuard, PermissionGuard)
export class MediaController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post("upload-media")
  @Permission("MANAGE_MEDIA")
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
