"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { connectDB } from "./db";
import { TeamModel } from "./models";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import { JWT_SECRET, TEAM_COOKIE } from "./config";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

// Validation Schema
const RegisterTeamSchema = z.object({
    name: z.string().min(3, "Institute name must be at least 3 characters"),
    place: z.string().min(2, "Place is required"),
    district: z.string().min(2, "District is required"),
    whatsapp_number: z.string().min(10, "Valid WhatsApp number is required"),
    union_official_number: z.string().optional(),
    principal_name: z.string().min(3, "Principal's name is required"),
    principal_phone: z.string().min(10, "Principal's phone is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function registerTeam(prevState: any, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());

        // Validate Input
        const validatedFields = RegisterTeamSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                error: "Validation failed",
                fieldErrors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const {
            name, place, district, whatsapp_number,
            union_official_number, principal_name, principal_phone, password
        } = validatedFields.data;

        await connectDB();

        // Check Duplicate Name
        const existingTeam = await TeamModel.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existingTeam) {
            return { error: "An institute with this name is already registered." };
        }

        // Hash Password
        const hashedPassword = await hash(password, 10);
        const teamId = `team-${randomUUID().slice(0, 8)}`;

        // Create Team
        await TeamModel.create({
            id: teamId,
            name,
            // For now, mapping optional fields or defaults for legacy structure
            leader: principal_name, // Using Principal as "Leader" for legacy compatibility
            leader_photo: "/img/default_team_logo.png", // Default placeholder
            color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
            description: `${place}, ${district}`,
            contact: whatsapp_number,
            total_points: 0,
            portal_password: hashedPassword, // Store for redundancy or remove if schema cleanup happens

            // New Specific Fields
            place,
            district,
            whatsapp_number,
            union_official_number,
            principal_name,
            principal_phone
        });

        // Create Session
        const token = sign(
            { id: teamId, name: name, role: "team" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const cookieStore = await cookies();
        cookieStore.set(TEAM_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        return { error: "Something went wrong. Please try again." };
    }

    // Redirect on success (outside try-catch to avoid Next.js digest error)
    redirect("/team/dashboard");
}
