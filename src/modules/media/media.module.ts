import { Module } from "@nestjs/common";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { MediaController } from "./media.controller";

@Module({
  controllers: [MediaController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class MediaModule {}
