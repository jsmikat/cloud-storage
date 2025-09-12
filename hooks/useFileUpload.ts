import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UseFileUploadProps {
  userId: string;
  currentFolder?: string | null;
  onUploadSuccess?: () => void;
}

interface StorageUsage {
  remaining: {
    bytes: number;
    formatted: string;
  };
  canUpload: boolean;
}

export function useFileUpload({ userId, currentFolder, onUploadSuccess }: UseFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [canUpload, setCanUpload] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileSize = (selectedFile: File): boolean => {
    if (storageUsage && storageUsage.remaining.bytes < selectedFile.size) {
      const errorMessage = `File too large. You have ${storageUsage.remaining.formatted} remaining, but this file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`;
      setError(errorMessage);
      toast.error("File Too Large", {
        description: `This file would exceed your storage limit. You have ${storageUsage.remaining.formatted} remaining.`,
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (validateFileSize(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (validateFileSize(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) {
      formData.append("parentId", currentFolder);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      toast.success("Upload Successful", {
        description: `${file.name} has been uploaded successfully.`,
      });

      // Clear the file after successful upload
      clearFile();

      // Call the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      
      // Handle storage limit error specifically
      if (error.response?.status === 413) {
        const errorMessage = error.response.data?.error || "Storage limit exceeded";
        setError(errorMessage);
        toast.error("Storage Limit Exceeded", {
          description: errorMessage,
        });
      } else {
        setError("Failed to upload file. Please try again.");
        toast.error("Upload Failed", {
          description: "We couldn't upload your file. Please try again.",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleStorageUpdate = (usage: StorageUsage) => {
    setCanUpload(usage.canUpload);
    setStorageUsage(usage);
  };

  return {
    // State
    file,
    uploading,
    progress,
    error,
    canUpload,
    storageUsage,
    fileInputRef,
    
    // Actions
    handleFileChange,
    handleDrop,
    handleDragOver,
    clearFile,
    handleUpload,
    triggerFileSelect,
    handleStorageUpdate,
  };
}