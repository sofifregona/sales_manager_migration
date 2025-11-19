import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn("[cloudinary] Environment variables missing, uploads will fail.");
}

export async function uploadProductImage(
  imagePath: string
): Promise<UploadApiResponse> {
  const options = {
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    folder: process.env.CLOUDINARY_PRODUCT_FOLDER || "mega_order_manager",
  };

  try {
    return await cloudinary.uploader.upload(imagePath, options);
  } catch (error) {
    console.error("[cloudinary] Failed to upload product image", error);
    throw error;
  }
}
