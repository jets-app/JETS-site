"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadStudentPhoto, removeStudentPhoto } from "@/server/actions/photo.actions";

interface PhotoUploaderProps {
  applicationId: string;
  currentPhotoUrl: string | null;
  studentName: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function PhotoUploader({
  applicationId,
  currentPhotoUrl,
  studentName,
  disabled,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayUrl = preview ?? currentPhotoUrl;

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    setError(null);
    setSuccess(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      setFileName(file.name);
    } catch {
      setError("Failed to process the image. Please try a different file.");
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onSave() {
    if (!preview) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await uploadStudentPhoto(applicationId, preview);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess("Photo saved successfully.");
      setPreview(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function onCancel() {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onRemove() {
    if (
      !confirm(
        "Remove the current student photo? You can upload a new one at any time."
      )
    ) {
      return;
    }
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await removeStudentPhoto(applicationId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess("Photo removed.");
      setPreview(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Preview / current image */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0">
          <div className="relative w-40 h-52 rounded-lg overflow-hidden ring-1 ring-foreground/10 bg-muted flex items-center justify-center">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-xs text-muted-foreground p-4">
                <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-background/60 flex items-center justify-center text-xl">
                  {studentName.charAt(0).toUpperCase()}
                </div>
                No photo uploaded
              </div>
            )}
            {preview && (
              <span className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-medium">
                Preview
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div>
            <Label
              htmlFor="photo-file"
              className="text-sm font-medium text-foreground"
            >
              Select an image
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WEBP &middot; max 5MB. A clear, front-facing head and
              shoulders photo works best.
            </p>
          </div>

          <input
            ref={fileInputRef}
            id="photo-file"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onFileChange}
            disabled={disabled || isPending}
            className="block w-full text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer disabled:opacity-50"
          />

          {fileName && (
            <p className="text-xs text-muted-foreground truncate">
              Selected: <span className="font-medium">{fileName}</span>
            </p>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
              {success}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={onSave}
              disabled={!preview || isPending || disabled}
            >
              {isPending ? "Saving..." : "Save Photo"}
            </Button>
            {preview && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            {currentPhotoUrl && !preview && (
              <Button
                variant="destructive"
                onClick={onRemove}
                disabled={isPending || disabled}
              >
                Remove Current Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
