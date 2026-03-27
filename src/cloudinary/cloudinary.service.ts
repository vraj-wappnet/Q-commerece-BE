import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "./cloudinary.config";

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinaryConfig(this.configService);
  }

async uploadMedia(file: Express.Multer.File): Promise<UploadApiResponse> {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided");
  }

  const mime = file.mimetype;
  const fileNameWithoutExtension = file.originalname.replace(/\.[^/.]+$/, "");
  const sanitizedBaseName =
    fileNameWithoutExtension.replace(/[^a-zA-Z0-9-]/g, "") || "file";
  const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
  const isPdf = mime === "application/pdf";

  let resourceType: "image" | "video" | "raw" = "image";
  let folder = "q-commerce";

  if (mime.startsWith("image")) {
    resourceType = "image";
    folder = "q-commerce/images";
  } else if (mime.startsWith("video")) {
    resourceType = "video";
    folder = "q-commerce/videos";
  } else if (isPdf) {
    // Upload PDFs as image resources for browser-friendly delivery URLs.
    resourceType = "image";
    folder = "q-commerce/documents";
  } else if (mime.includes("opendocument") || mime.includes("odf")) {
    // ODF files: .odt, .ods, .odp, etc.
    resourceType = "raw";
    folder = "q-commerce/documents";
  } else {
    throw new Error(`Unsupported file type: ${mime}`);
  }

  const size = file.size;

  if (resourceType === "image" && !isPdf && size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB");
  }

  if (isPdf && size > 10 * 1024 * 1024) {
    throw new Error("PDF size must be less than 10MB");
  }

  if (resourceType === "video" && size > 50 * 1024 * 1024) {
    throw new Error("Video size must be less than 50MB");
  }

  if (resourceType === "raw" && size > 10 * 1024 * 1024) {
    throw new Error("Document size must be less than 10MB");
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        // Keep extension out of public_id for raw files to avoid broken delivery URLs.
        public_id: `${Date.now()}-${sanitizedBaseName}`,
        ...(fileExtension &&
        (resourceType === "raw" || (isPdf && resourceType === "image"))
          ? { format: fileExtension }
          : {}),
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Upload failed"));

        resolve(result);
      }
    );

    upload.end(file.buffer);
  });
}

// Helper method to get proper download URL for raw files
getRawFileUrl(publicId: string, extension: string): string {
  return cloudinary.url(`${publicId}.${extension}`, {
    resource_type: 'raw',
    secure: true,
  });
}
}
