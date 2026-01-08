"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, X, ChevronLeft, ChevronRight, Download, Share2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryImage } from "@/lib/types";

interface GalleryGridProps {
    initialImages: GalleryImage[];
}

export function GalleryGrid({ initialImages }: GalleryGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // Filter images based on search query
    const filteredImages = useMemo(() => {
        if (!searchQuery) return initialImages;
        const lowerQuery = searchQuery.toLowerCase();
        return initialImages.filter((img) =>
            img.label.toLowerCase().includes(lowerQuery)
        );
    }, [initialImages, searchQuery]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;

            if (e.key === "Escape") setSelectedImageIndex(null);
            if (e.key === "ArrowLeft") navigate(-1);
            if (e.key === "ArrowRight") navigate(1);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, filteredImages.length]);

    const navigate = (direction: number) => {
        if (selectedImageIndex === null) return;
        const newIndex = (selectedImageIndex + direction + filteredImages.length) % filteredImages.length;
        setSelectedImageIndex(newIndex);
    };

    const handleShare = async (image: GalleryImage) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Hifz Fest Gallery",
                    text: image.label,
                    url: window.location.href, // Or specific image URL if we had dynamic routing for images
                });
            } catch (error) {
                console.log("Error sharing", error);
            }
        } else {
            // Fallback: Copy Link
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleDownload = async (imageUrl: string, fileName: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B4513] transition-colors" />
                </div>
                <Input
                    type="text"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-[#8B4513] focus:ring-[#8B4513]/20 rounded-full transition-all hover:bg-white"
                />
            </div>

            {/* Grid */}
            {filteredImages.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-medium">No results found</p>
                    <p className="mt-2">Try a different search term</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedImageIndex(index)}
                            className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                        >
                            <Image
                                src={image.url}
                                alt={image.label}
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <p className="text-white font-medium text-lg leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {image.label}
                                </p>
                                <p className="text-white/70 text-sm mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {new Date(image.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setSelectedImageIndex(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImageIndex(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden sm:flex"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(1); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden sm:flex"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        {/* Main Content */}
                        <motion.div
                            layoutId={`image-${filteredImages[selectedImageIndex].id}`}
                            className="relative max-w-7xl w-full max-h-[85vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative w-auto h-auto max-w-full max-h-[75vh]">
                                    <Image
                                        src={filteredImages[selectedImageIndex].url}
                                        alt={filteredImages[selectedImageIndex].label}
                                        width={1920}
                                        height={1080}
                                        className="object-contain max-h-[75vh] w-auto rounded-lg shadow-2xl"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Caption & Actions */}
                            <div className="mt-6 w-full max-w-2xl px-4 flex flex-col items-center gap-4 text-center">
                                <div>
                                    <h3 className="text-white text-xl font-medium tracking-wide">
                                        {filteredImages[selectedImageIndex].label}
                                    </h3>
                                    <p className="text-white/60 text-sm mt-1">
                                        {new Date(filteredImages[selectedImageIndex].createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <Button
                                        onClick={() => handleDownload(filteredImages[selectedImageIndex].url, `hifz-fest-${filteredImages[selectedImageIndex].id}.webp`)}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-white/10 hover:bg-white/20 text-white border-none gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </Button>
                                    <Button
                                        onClick={() => handleShare(filteredImages[selectedImageIndex])}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-white/10 hover:bg-white/20 text-white border-none gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
