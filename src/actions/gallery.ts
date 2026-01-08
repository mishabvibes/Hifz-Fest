"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { GalleryModel } from "@/lib/models";
import { uploadFile, deleteFile } from "@/lib/upload";
import { randomUUID } from "crypto";
import type { GalleryImage } from "@/lib/types";

export async function uploadGalleryImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const label = formData.get("label") as string;

        if (!file || !label) {
            throw new Error("Missing file or label");
        }

        await connectDB();

        // Use uploadFile from lib/upload (assuming it handles saving to public/uploads)
        // Note: The existing uploadFile function might need to be checked if it supports "gallery" type or just "image"
        // The previous view of upload.ts showed type: "image" | "audio". So "image" is fine.
        const url = await uploadFile(file, "image");

        const newImage: GalleryImage = {
            id: randomUUID(),
            url,
            label,
            createdAt: new Date().toISOString(),
        };

        await GalleryModel.create(newImage);

        revalidatePath("/gallery");
        revalidatePath("/");
        revalidatePath("/admin/gallery");

        return { success: true };
    } catch (error) {
        console.error("Failed to upload gallery image:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to upload image" };
    }
}

export async function deleteGalleryImage(id: string) {
    try {
        await connectDB();
        const image = await GalleryModel.findOne({ id });
        if (!image) return { success: false, error: "Image not found" };

        // Delete from filesystem
        await deleteFile(image.url);

        // Delete from DB
        await GalleryModel.deleteOne({ id });

        revalidatePath("/gallery");
        revalidatePath("/");
        revalidatePath("/admin/gallery");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete gallery image:", error);
        return { success: false, error: "Failed to delete image" };
    }
}

export async function deleteBulkGalleryImages(ids: string[]) {
    try {
        await connectDB();

        // Find all images to be deleted
        const images = await GalleryModel.find({ id: { $in: ids } });

        if (images.length === 0) {
            return { success: true, count: 0 };
        }

        // Delete files from filesystem
        // We use Promise.allSettled to ensure we try to delete all files even if some fail
        await Promise.allSettled(images.map(img => deleteFile(img.url)));

        // Delete from DB
        const result = await GalleryModel.deleteMany({ id: { $in: ids } });

        revalidatePath("/gallery");
        revalidatePath("/");
        revalidatePath("/admin/gallery");

        return { success: true, count: result.deletedCount };
    } catch (error) {
        console.error("Failed to bulk delete gallery images:", error);
        return { success: false, error: "Failed to delete images" };
    }
}

export async function getGalleryImages(limit?: number): Promise<GalleryImage[]> {
    try {
        await connectDB();
        let query = GalleryModel.find({}).sort({ createdAt: -1 });
        if (limit) {
            query = query.limit(limit);
        }
        const images = await query.lean();

        // Convert _id to string or remove it if not needed, to avoid serialization issues
        return JSON.parse(JSON.stringify(images));
    } catch (error) {
        console.error("Failed to fetch gallery images:", error);
        return [];
    }
}
