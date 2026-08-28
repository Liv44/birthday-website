// https://blocks.so/file-upload

import { Camera, Upload } from 'lucide-react';
import type React from 'react';
import type { RefObject } from 'react';

interface FileDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  handleBoxClick: () => void;
  handleCameraClick: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (files: FileList | null) => void;
}

export function FileDropzone({
  fileInputRef,
  cameraInputRef,
  handleBoxClick,
  handleCameraClick,
  handleDragOver,
  handleDrop,
  handleFileSelect,
}: FileDropzoneProps) {
  return (
    <div className="px-6">
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-border border-dashed p-8 text-center"
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-2 rounded-full bg-muted p-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground text-sm">
          Ajouter depuis la galerie
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          ou
        </p>
        <button
          type="button"
          className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering handleBoxClick
            handleCameraClick()
          }}
        >
          <Camera className="h-4 w-4" />
          Prendre une photo
        </button>

        <input
          accept="image/*"
          className="hidden"
          id="fileUpload"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          ref={fileInputRef}
          type="file"
        />
        <input
          accept="image/*"
          capture="environment"
          className="hidden"
          id="cameraCapture"
          onChange={(e) => handleFileSelect(e.target.files)}
          ref={cameraInputRef}
          type="file"
        />
      </div>
    </div>
  );
}