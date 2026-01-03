import { connectDB } from "@/lib/db";
import { ProgramModel } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function MigrationPage() {

    async function getMigrationStats() {
        "use server";
        await connectDB();
        const programs = await ProgramModel.find({});

        // Check for programs with legacy sections or missing types
        const legacySingle = programs.filter(p => p.section === "single").length;
        const legacyGroup = programs.filter(p => p.section === "group").length;
        const missingType = programs.filter(p => !p.type).length;

        return {
            total: programs.length,
            needsMigration: legacySingle + legacyGroup + missingType,
            legacySingle,
            legacyGroup,
            missingType
        };
    }

    async function runMigration() {
        "use server";
        await connectDB();
        const programs = await ProgramModel.find({});
        let updatedCount = 0;

        for (const p of programs) {
            let type = p.type;
            let section = p.section;
            let needsUpdate = false;

            // Rule 1: Legacy "Single" section -> Section "Senior", Type "Single"
            if (section === "single") {
                section = "senior";
                type = "single";
                needsUpdate = true;
            }
            // Rule 2: Legacy "Group" section -> Section "Senior", Type "Group"
            else if (section === "group") {
                section = "senior";
                type = "group";
                needsUpdate = true;
            }

            // Rule 3: Ensure Type is set (Default to Single if missing)
            if (!type) {
                // Determine if it looks like a group item?
                // Heuristic: If candidateLimit > 1, assume Group, else Single.
                // Note: candidateLimit is usually 1 for Single (1 student per team entry)
                // For Group items, it's usually 1 (1 group per team) OR > 1 (multiple students). 
                // But strict data definition says "Single" events have 1 participant. "Group" have > 1?
                // Let's stick to a safe default: "single" if ambiguous, unless section implies group (which we handled).
                // If section is "general", it could be either. Defaulting to single.
                type = "single";
                needsUpdate = true;
            }

            if (needsUpdate) {
                // Direct MongoDB update to bypass strict schema validation if needed, 
                // but .save() is better to ensure schema compliance.
                // We cast to "any" to set possibly restricted fields if schema types aren't synced in runtime yet?
                // No, assuming codebase is updated.
                p.section = section;
                p.type = type;
                await p.save();
                updatedCount++;
            }
        }

        revalidatePath("/admin/migration");
        return { count: updatedCount };
    }

    const stats = await getMigrationStats();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">System Migration</h1>
                <p className="text-white/60">Manage database schema updates and data backfills.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-slate-900 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Program Categories</CardTitle>
                        <CardDescription className="text-white/50">
                            Migrate legacy "Single/Group" sections to new "Junior/Senior" categories + "Type" field.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span>Total Programs</span>
                                <span className="font-mono">{stats.total}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5 text-amber-400">
                                <span>Legacy "Single" Sections</span>
                                <span className="font-mono">{stats.legacySingle}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5 text-amber-400">
                                <span>Legacy "Group" Sections</span>
                                <span className="font-mono">{stats.legacyGroup}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5 text-amber-400">
                                <span>Missing "Type" Field</span>
                                <span className="font-mono">{stats.missingType}</span>
                            </div>
                        </div>

                        {stats.needsMigration > 0 ? (
                            <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-500">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Migration Required</AlertTitle>
                                <AlertDescription>
                                    {stats.needsMigration} programs need to be updated to support the new categorization system.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert className="bg-emerald-500/10 border-emerald-500/50 text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Up to Date</AlertTitle>
                                <AlertDescription>
                                    All programs are correctly categorized.
                                </AlertDescription>
                            </Alert>
                        )}

                        <form action={runMigration}>
                            <Button
                                type="submit"
                                className="w-full bg-linear-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500"
                                disabled={stats.needsMigration === 0}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Run Migration
                            </Button>
                        </form>

                        {stats.needsMigration > 0 && (
                            <p className="text-xs text-white/40 text-center">
                                Default: Legacy "Single" → Senior/Single, "Group" → Senior/Group.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
