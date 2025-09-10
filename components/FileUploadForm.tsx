"use client";

import axios from "axios";
import {
  AlertTriangle,
  FileUp,
  FolderPlus,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import StorageIndicator from "./StorageIndicator";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

interface FileUploadFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder creation state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [canUpload, setCanUpload] = useState(true);
  const [storageUsage, setStorageUsage] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check if file would exceed storage limit
      if (storageUsage && storageUsage.remaining.bytes < selectedFile.size) {
        setError(`File too large. You have ${storageUsage.remaining.formatted} remaining, but this file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`);
        toast.error("File Too Large", {
          description: `This file would exceed your storage limit. You have ${storageUsage.remaining.formatted} remaining.`,
        });
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      // Check if file would exceed storage limit
      if (storageUsage && storageUsage.remaining.bytes < droppedFile.size) {
        setError(`File too large. You have ${storageUsage.remaining.formatted} remaining, but this file is ${(droppedFile.size / (1024 * 1024)).toFixed(2)}MB.`);
        toast.error("File Too Large", {
          description: `This file would exceed your storage limit. You have ${storageUsage.remaining.formatted} remaining.`,
        });
        return;
      }

      setFile(droppedFile);
      setError(null);
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

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Invalid Folder Name", {
        description: "Please enter a valid folder name.",
      });
      return;
    }

    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolder,
      });

      toast.success("Folder Created", {
        description: `Folder "${folderName}" has been created successfully.`,
      });

      // Reset folder name and close modal
      setFolderName("");
      setFolderModalOpen(false);

      // Call the onUploadSuccess callback to refresh the file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Folder Creation Failed", {
        description: "We couldn't create the folder. Please try again.",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action buttons - more minimal approach */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setFolderModalOpen(true)}
          className="h-9 text-sm"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 text-sm"
          disabled={!canUpload}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage Usage Indicator */}
      <StorageIndicator onStorageUpdate={(usage) => {
        setCanUpload(usage.canUpload);
        setStorageUsage(usage);
      }} />

      {/* Simplified file drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
                  onClick={() => fileInputRef.current?.click()}
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
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
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
                    {file.size < 1024
                      ? `${file.size} B`
                      : file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
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
              onClick={handleUpload}
              disabled={uploading || !!error}
              className="w-full h-10"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
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

      {/* Create Folder Dialog - minimal approach */}
      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FolderPlus className="h-5 w-5" />
              Create Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName" className="text-sm font-medium">
                Folder Name
              </Label>
              <Input
                id="folderName"
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="h-10"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFolderModalOpen(false)}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={creatingFolder || !folderName.trim()}
              className="h-9"
            >
              {creatingFolder ? (
                <>
                  <FolderPlus className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}