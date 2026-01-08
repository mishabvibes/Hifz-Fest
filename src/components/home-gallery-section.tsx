"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";

interface HomeGallerySectionProps {
    initialImages?: GalleryImage[];
}

export function HomeGallerySection({ initialImages = [] }: HomeGallerySectionProps) {
    // We can use initialImages if passed from server, or fetch on client if needed.
    // For a realtime feel or just standard list, passing from server is better for SEO and speed.
    // The implementations plan says "Latest N images".

    // If no images are passed, we show nothing or a placeholder?
    // User asked: "only show in public page some latest uploaded images and set see more"

    if (initialImages.length === 0) {
        return null; // Or return nothing if empty
    }

    return (
        <section className="bg-white py-12 sm:py-16 md:py-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-4 text-left">
                    <div>
                        <div className="flex items-center justify-start gap-2 text-[#8B4513] mb-2">
                            <ImageIcon className="w-5 h-5" />
                            <span className="uppercase tracking-widest text-sm font-semibold">Memories</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a]">
                            Gallery Highlights
                        </h2>
                    </div>
                    <Link
                        href="/gallery"
                        className="group hidden md:flex items-center gap-2 text-[#8B4513] font-medium hover:text-[#6B3410] transition-colors md:mx-0"
                    >
                        See All Photos
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {initialImages.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative group rounded-xl overflow-hidden aspect-4/3 ${index === 0 ? "md:col-span-2 md:row-span-2 md:aspect-square" : ""
                                }`}
                        >
                            <Image
                                src={image.url}
                                alt={image.label}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                                <p className="text-white font-medium text-lg leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {image.label}
                                </p>
                                <p className="text-white/70 text-sm mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {new Date(image.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-left md:hidden">
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 text-[#8B4513] font-medium hover:text-[#6B3410] transition-colors border border-[#8B4513]/20 px-6 py-3 rounded-full"
                    >
                        See All Photos
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
