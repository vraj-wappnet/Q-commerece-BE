import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from "./cloudinary.config";


@Injectable()
export class CloudinaryService implements OnModuleInit {
    constructor(private configService: ConfigService) { }

    onModuleInit() {
        cloudinaryConfig(this.configService);
    }

    async uploadImage(image: Express.Multer.File): Promise<UploadApiResponse> {
        if (!image || !image.buffer) {
            throw new Error('No image buffer provided');
        }
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: "q-commerce"
                },
                (err, result) => {
                    if (err) return reject(err);
                    if (!result) return reject(new Error('Cloudinary upload failed: No result returned'));
                    resolve(result);
                }

            )
            upload.end(image.buffer)
        })
    }
}