"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

/**
 * Upload de imagem com drag & drop (react-dropzone), preview em thumbnail e
 * opção de remover. Campo opcional — funciona sem foto.
 */
export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  async function upload(file: File) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WEBP ou GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 5 MB).");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreviewFailed(false);
      onChange(data.url);
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && upload(files[0]),
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  if (value && !previewFailed) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Pré-visualização"
          onError={() => setPreviewFailed(true)}
          className="h-20 w-28 rounded-lg object-cover border border-hairline"
        />
        <button
          type="button"
          onClick={() => { setPreviewFailed(false); onChange(null); }}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-pill border border-border-strong text-body hover:text-ink hover:bg-surface-card transition-colors"
        >
          <X className="w-4 h-4" /> Remover imagem
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex items-center gap-4 h-28 rounded-lg border-2 border-dashed px-5 cursor-pointer transition-colors ${
        isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-hairline hover:border-border-strong"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
        {uploading ? (
          <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
        ) : (
          <ImagePlus className="w-5 h-5 text-body" />
        )}
      </div>
      <div>
        <p className="text-body-md text-ink">
          {isDragActive ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para enviar"}
        </p>
        <p className="text-caption text-muted-foreground mt-0.5">JPG, PNG, WEBP ou GIF · máx. 5 MB · opcional</p>
      </div>
      <input {...getInputProps()} />
    </div>
  );
}
