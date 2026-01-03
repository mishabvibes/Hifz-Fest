import { RegisterTeamForm } from "@/components/forms/register-team-form";
import Image from "next/image";

export default function RegisterTeamPage() {
    return (
        <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">

            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-fuchsia-900/20 via-slate-950 to-slate-950" />
            {/* <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <Image
                    src="/img/assets/pattern.png"
                    alt="Pattern"
                    fill
                    className="object-cover"
                />
            </div> */}

            <div className="relative z-10 w-full py-10">
                <div className="text-center mb-8 space-y-2">
                    <h1 className="text-4xl font-bold font-serif text-white tracking-wide">
                        Join the Fiesta
                    </h1>
                    <p className="text-white/60">
                        Register your institution here
                    </p>
                </div>

                <RegisterTeamForm />
            </div>

        </main>
    );
}
