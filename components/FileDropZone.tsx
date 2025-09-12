"use client";

import {
    AlertTriangle,
    FileUp,
    Upload,
    X,
} from "lucide-react";
import { LoadingSpinner } from "./ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

interface FileDropZoneProps {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onClearFile: () => void;
  onUpload: () => void;
  onTriggerFileSelect: () => void;
}

export default function FileDropZone({
  file,
  uploading,
  progress,
  error,
  fileInputRef,
  onFileChange,
  onDrop,
  onDragOver,
  onClearFile,
  onUpload,
  onTriggerFileSelect,
}: FileDropZoneProps) {
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        error
          ? "border-red-300 bg-red-50"
          : file
            ? "border-blue-300 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      {!file ? (
        <div className="space-y-4">
          <Upload className="h-10 w-10 mx-auto text-gray-400" />
          <div>
            <p className="text-gray-600 mb-1">
              Drop files here or{" "}
              <button
                type="button"
                onClick={onTriggerFileSelect}
                className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">Up to 5MB</p>
          </div>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFile}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {uploading && (
            <div className="space-y-3">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-gray-600">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <Button
            onClick={onUpload}
            disabled={uploading || !!error}
            className="w-full h-10"
          >
            {uploading ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}