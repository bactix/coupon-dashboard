"use client";

import { memo, useRef, useState, useEffect } from "react";
import { Business } from "@/domain/businesses/business.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";

interface BusinessImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business | null;
  onUploadProfilePicture: (id: string, file: File) => Promise<void>;
  onUploadGallery: (id: string, files: File[]) => Promise<void>;
  onRemoveGalleryImage: (id: string, index: number) => Promise<void>;
}

interface PendingPhoto {
  dataUrl: string;
  blob: Blob;
}

function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<PendingPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            resolve({ dataUrl, blob });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const BusinessImagesDialog = memo(function BusinessImagesDialog({
  open,
  onOpenChange,
  business,
  onUploadProfilePicture,
  onUploadGallery,
  onRemoveGalleryImage,
}: BusinessImagesDialogProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<number[]>([]);
  const [newPhotos, setNewPhotos] = useState<PendingPhoto[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset staged state whenever dialog opens for a new business
  useEffect(() => {
    if (open) {
      setPendingDeletes([]);
      setNewPhotos([]);
    }
  }, [open, business?.id]);

  if (!business) return null;

  const serverPhotos = business.gallery ?? [];
  // Visible count = server photos not marked for delete + new photos queued
  const visibleServerCount = serverPhotos.length - pendingDeletes.length;
  const totalCount = visibleServerCount + newPhotos.length;
  const canAddMore = totalCount < 3;
  const hasPendingChanges = pendingDeletes.length > 0 || newPhotos.length > 0;

  async function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileLoading(true);
    try {
      await onUploadProfilePicture(business!.id, file);
    } finally {
      setProfileLoading(false);
      e.target.value = "";
    }
  }

  async function handleGalleryPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const allowed = files.slice(0, 3 - totalCount);
    setCompressing(true);
    try {
      const compressed = await Promise.all(allowed.map((f) => compressImage(f)));
      setNewPhotos((prev) => [...prev, ...compressed].slice(0, 3 - visibleServerCount));
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  }

  function markForDelete(serverIndex: number) {
    setPendingDeletes((prev) =>
      prev.includes(serverIndex) ? prev : [...prev, serverIndex]
    );
  }

  function undoDelete(serverIndex: number) {
    setPendingDeletes((prev) => prev.filter((i) => i !== serverIndex));
  }

  function removeNewPhoto(newIndex: number) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== newIndex));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 1. Delete in descending index order to avoid index shifting
      const sorted = [...pendingDeletes].sort((a, b) => b - a);
      for (const idx of sorted) {
        await onRemoveGalleryImage(business!.id, idx);
      }

      // 2. Upload new photos
      if (newPhotos.length > 0) {
        const files = newPhotos.map(
          (p, i) => new File([p.blob], `photo-${i}.jpg`, { type: "image/jpeg" })
        );
        await onUploadGallery(business!.id, files);
      }

      setPendingDeletes([]);
      setNewPhotos([]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Images — {business.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Profile Picture */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Profile Picture</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                {business.profilePicture ? (
                  <img
                    src={business.profilePicture}
                    alt={business.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={profileLoading}
                  onClick={() => profileInputRef.current?.click()}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {profileLoading
                    ? "Uploading..."
                    : business.profilePicture
                    ? "Replace"
                    : "Upload"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG or WebP · Max 5 MB
                </p>
              </div>
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleProfileChange}
            />
          </div>

          {/* Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Gallery</h3>
              <span className="text-xs text-muted-foreground">
                {totalCount} / 3 images
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Existing server photos */}
              {serverPhotos.map((url, idx) => {
                const isDeleting = pendingDeletes.includes(idx);
                return (
                  <div
                    key={`server-${idx}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      className={`h-full w-full object-cover transition-opacity ${isDeleting ? "opacity-30" : ""}`}
                    />
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        isDeleting ? undoDelete(idx) : markForDelete(idx)
                      }
                      aria-label={isDeleting ? "Undo remove" : "Remove image"}
                    >
                      {isDeleting ? (
                        <span className="rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-black">
                          Undo
                        </span>
                      ) : (
                        <Trash2Icon className="h-5 w-5 text-white" />
                      )}
                    </button>
                    {isDeleting && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="rounded bg-destructive/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Will be removed
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* New photos queued for upload */}
              {newPhotos.map((photo, i) => (
                <div
                  key={`new-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-primary/50 bg-muted"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`New photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[10px] font-medium text-white">
                    New
                  </div>
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeNewPhoto(i)}
                    aria-label="Remove queued photo"
                  >
                    <Trash2Icon className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}

              {/* Add slot */}
              {canAddMore && (
                <button
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/50 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={compressing || saving}
                >
                  {compressing ? (
                    <span className="text-xs">Compressing...</span>
                  ) : (
                    <PlusIcon className="h-6 w-6" />
                  )}
                </button>
              )}
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleGalleryPick}
            />
            <p className="text-xs text-muted-foreground">
              Up to 3 images · JPEG, PNG or WebP · Max 5 MB each
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {hasPendingChanges && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
