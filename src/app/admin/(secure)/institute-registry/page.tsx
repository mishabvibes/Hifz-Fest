import { getInstituteRegistry, bulkImportInstitutes, getRegisteredInstituteCount } from "@/actions/institute-registry";
import { InstituteRegistryUI } from "@/components/institute-registry-ui";
import { Hotel, Database } from "lucide-react";

const INITIAL_INSTITUTES = [
    { label: "Shihab Thangal Thahfeezul Quran College", value: "Kannyala College" },
    { label: "Sayyid Muhammedali Shihab Thangal Thahfeezul Quran College", value: "Pazamallur College" },
    { label: "Hafiz Mammu Molla College Of Thahfeezul Quran", value: "Puthanpalli" },
    { label: "Panakkad Shihab Thangal & Shamsul Ulama Memorial Hifzul Quran College", value: "Kottakkunnu College" },
    { label: "Darul Azhar Islamic Academy", value: "Koduvalli College" },
    { label: "Darul Quran Islamic Academy", value: "Purang College" },
    { label: "Darussalam Thahfeezul Quran College", value: "Indianoor College" },
    { label: "Muhammediyya Hifzul Quran College", value: "Kunil College" },
    { label: "KMO Hifz College", value: "Karulayi College" },
    { label: "Thahfeezul Quran College", value: "Perinthalmanna College" },
    { label: "Siddeeqiyya Hifzul Quran College", value: "Anakkayam College" },
];

async function checkAndSeedInstitutes() {
    const existing = await getInstituteRegistry();
    if (existing.length === 0) {
        // Seed initial data
        const toImport = INITIAL_INSTITUTES.map(inst => ({
            name: inst.label,
            shortName: inst.value
        }));
        await bulkImportInstitutes(toImport);
        return await getInstituteRegistry();
    }
    return existing;
}

export default async function InstituteRegistryPage() {
    const institutes = await checkAndSeedInstitutes();
    const registeredCount = await getRegisteredInstituteCount();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                        <Hotel className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Institute Registry</h1>
                        <p className="text-white/60">Manage the list of institutes available for registration.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="h-5 w-5 text-purple-400" />
                        <h3 className="font-semibold text-sm">Total Registry</h3>
                    </div>
                    <p className="text-4xl font-bold">{institutes.length}</p>
                    <p className="text-xs text-white/40 mt-1">Institutes in master list</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Hotel className="h-5 w-5 text-green-400" />
                        <h3 className="font-semibold text-sm">Registered Teams</h3>
                    </div>
                    <p className="text-4xl font-bold text-green-400">{registeredCount}</p>
                    <p className="text-xs text-white/40 mt-1">Teams actively registered</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        <h3 className="font-semibold text-sm">Onboarding Progress</h3>
                    </div>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/60">Ratio</span>
                            <span className="text-white">{Math.round((registeredCount / (institutes.length || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, (registeredCount / (institutes.length || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <InstituteRegistryUI initialInstitutes={institutes} />
        </div>
    );
}
