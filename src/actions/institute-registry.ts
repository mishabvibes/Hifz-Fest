"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { InstituteRegistryModel, TeamModel } from "@/lib/models";
import { InstituteRegistry } from "@/lib/types";

export async function getRegisteredInstituteCount() {
    await connectDB();
    return await TeamModel.countDocuments();
}

export async function getInstituteRegistry(): Promise<InstituteRegistry[]> {
    await connectDB();
    const institutes = await InstituteRegistryModel.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(institutes));
}

export async function addInstituteToRegistry(data: { name: string; shortName?: string }) {
    await connectDB();
    await InstituteRegistryModel.create(data);
    revalidatePath("/admin/institute-registry");
}

export async function updateInstituteInRegistry(id: string, data: { name: string; shortName?: string }) {
    await connectDB();
    await InstituteRegistryModel.findByIdAndUpdate(id, data);
    revalidatePath("/admin/institute-registry");
    revalidatePath("/team/register"); // Validating the registration page as well
}

export async function deleteInstituteFromRegistry(id: string) {
    await connectDB();
    await InstituteRegistryModel.findByIdAndDelete(id);
    revalidatePath("/admin/institute-registry");
}

export async function bulkImportInstitutes(institutes: { name: string; shortName?: string }[]) {
    await connectDB();
    for (const inst of institutes) {
        await InstituteRegistryModel.findOneAndUpdate(
            { name: inst.name },
            { shortName: inst.shortName },
            { upsert: true }
        );
    }
    revalidatePath("/admin/institute-registry");
}
