import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

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
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const uploaded = await this.cloudinaryService.uploadImage(file);
    return {
      message: "Image Uploaded Successfully",
      url: uploaded.secure_url,
    };
  }
}
