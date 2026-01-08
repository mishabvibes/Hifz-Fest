import { getGalleryImages } from "@/actions/gallery";
import { GalleryGrid } from "@/components/gallery-grid";
import { Image as ImageIcon } from "lucide-react";

export const metadata = {
    title: "Hifz Fest | Gallery",
    description: "Explore the moments and memories of Hifz Fest.",
};

export default async function GalleryPage() {
    const images = await getGalleryImages();

    return (
        <main className="min-h-screen bg-[#FFFCF5]">

            {/* Gallery Grid */}
            <section className="py-12 sm:py-16 md:py-20">
                <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
                    <div className="mb-8 sm:mb-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-[#8B4513] mb-2">
                            <ImageIcon className="w-5 h-5" />
                            <span className="uppercase tracking-widest text-sm font-semibold">Memories</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a]">
                            Gallery Highlights
                        </h2>
                    </div>
                    <GalleryGrid initialImages={images} />
                </div>
            </section>

            {/* Footer Decoration */}
            <div
                className="w-full h-[60px] sm:h-[80px] opacity-50"
                style={{
                    backgroundImage: "url('/img/hero/pattern.webp')",
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "auto 100%",
                    backgroundPosition: "bottom center"
                }}
            />
        </main>
    );
}
