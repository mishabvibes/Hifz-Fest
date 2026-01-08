"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Upload, Loader2, ImagePlus, CheckCircle2, X, CheckSquare, Square } from "lucide-react";
import Image from "next/image";
import { uploadGalleryImage, deleteGalleryImage, getGalleryImages, deleteBulkGalleryImages } from "@/actions/gallery";
import { toast } from "react-toastify";
import type { GalleryImage } from "@/lib/types";

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        setIsLoading(true);
        const data = await getGalleryImages();
        setImages(data);
        setIsLoading(false);
    }

    async function handleUpload(formData: FormData) {
        setIsUploading(true);
        try {
            const result = await uploadGalleryImage(formData);
            if (result.success) {
                toast.success("Image uploaded successfully");
                formRef.current?.reset();
                fetchImages();
            } else {
                toast.error(result.error || "Failed to upload image");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const result = await deleteGalleryImage(id);
            if (result.success) {
                toast.success("Image deleted successfully");
                setImages((prev) => prev.filter((img) => img.id !== id));
                setSelectedIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            } else {
                toast.error(result.error || "Failed to delete image");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} images?`)) return;

        setIsDeleting(true);
        try {
            const result = await deleteBulkGalleryImages(Array.from(selectedIds));
            if (result.success) {
                toast.success(`Successfully deleted ${result.count} images`);
                setImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
                setSelectedIds(new Set());
            } else {
                toast.error(result.error || "Failed to delete images");
            }
        } catch (error) {
            toast.error("An error occurred during bulk deletion");
        } finally {
            setIsDeleting(false);
        }
    }

    function toggleSelection(id: string) {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    function selectAll() {
        if (selectedIds.size === images.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(images.map((img) => img.id)));
        }
    }

    const isAllSelected = images.length > 0 && selectedIds.size === images.length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and manage photos for the public gallery.
                    </p>
                </div>
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="h-8"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete ({selectedIds.size})
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedIds(new Set())}
                            className="h-8 w-8 text-muted-foreground hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                    <form
                        ref={formRef}
                        action={handleUpload}
                        className="flex flex-col sm:flex-row gap-4 items-end"
                    >
                        <div className="grid w-full gap-2">
                            <Label htmlFor="file">Photo</Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept="image/*"
                                required
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="label">Label / Caption</Label>
                            <Input
                                id="label"
                                name="label"
                                type="text"
                                placeholder="e.g., Opening Ceremony"
                                required
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {images.length > 0 && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAll}
                            className="text-muted-foreground hover:text-white"
                        >
                            {isAllSelected ? (
                                <CheckSquare className="w-4 h-4 mr-2" />
                            ) : (
                                <Square className="w-4 h-4 mr-2" />
                            )}
                            {isAllSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-12 text-white/50">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/50 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                            <ImagePlus className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No images found</p>
                            <p className="text-sm">Upload some photos to get started</p>
                        </div>
                    ) : (
                        images.map((image) => {
                            const isSelected = selectedIds.has(image.id);
                            return (
                                <div
                                    key={image.id}
                                    className={`group relative aspect-square rounded-xl overflow-hidden border transition-all duration-200 ${isSelected
                                        ? "border-blue-500 ring-2 ring-blue-500/20"
                                        : "border-white/10 hover:border-white/20"
                                        } bg-black/40`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.label}
                                        fill
                                        className={`object-cover transition-transform duration-500 ${isSelected ? "scale-95" : "group-hover:scale-110"
                                            }`}
                                    />

                                    {/* Selection Checkbox */}
                                    <div
                                        className="absolute top-2 left-2 z-10 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(image.id);
                                        }}
                                    >
                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "bg-black/50 border-white/50 text-transparent hover:border-white"
                                            }`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Overlay */}
                                    <div
                                        className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                            }`}
                                    >
                                        <p className="text-white font-medium text-sm line-clamp-1">
                                            {image.label}
                                        </p>
                                        <p className="text-white/60 text-xs mt-0.5">
                                            {new Date(image.createdAt).toLocaleDateString()}
                                        </p>

                                        {!isSelected && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(image.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Make the whole card clickable for selection if needed, or strictly use checkbox */}
                                    <div
                                        className="absolute inset-0 z-0"
                                        onClick={() => toggleSelection(image.id)}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
