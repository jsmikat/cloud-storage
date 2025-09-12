"use client";

import { useFileUpload } from "@/hooks/useFileUpload";
import { useFolderCreation } from "@/hooks/useFolderCreation";
import {
  FolderPlus,
  Upload,
} from "lucide-react";
import FileDropZone from "./FileDropZone";
import FolderCreationModal from "./FolderCreationModal";
import StorageIndicator from "./StorageIndicator";
import { Button } from "./ui/button";

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
  // Use custom hooks
  const fileUpload = useFileUpload({
    userId,
    currentFolder,
    onUploadSuccess,
  });

  const folderCreation = useFolderCreation({
    userId,
    currentFolder,
    onFolderCreated: onUploadSuccess,
  });

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={folderCreation.openFolderModal}
          className="h-9 text-sm"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button
          variant="outline"
          onClick={fileUpload.triggerFileSelect}
          className="h-9 text-sm"
          disabled={!fileUpload.canUpload}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage Usage Indicator */}
      <StorageIndicator onStorageUpdate={fileUpload.handleStorageUpdate} />

      {/* File Drop Zone */}
      <FileDropZone
        file={fileUpload.file}
        uploading={fileUpload.uploading}
        progress={fileUpload.progress}
        error={fileUpload.error}
        fileInputRef={fileUpload.fileInputRef}
        onFileChange={fileUpload.handleFileChange}
        onDrop={fileUpload.handleDrop}
        onDragOver={fileUpload.handleDragOver}
        onClearFile={fileUpload.clearFile}
        onUpload={fileUpload.handleUpload}
        onTriggerFileSelect={fileUpload.triggerFileSelect}
      />

      {/* Folder Creation Modal */}
      <FolderCreationModal
        isOpen={folderCreation.folderModalOpen}
        folderName={folderCreation.folderName}
        creatingFolder={folderCreation.creatingFolder}
        onOpenChange={folderCreation.closeFolderModal}
        onFolderNameChange={folderCreation.setFolderName}
        onCreateFolder={folderCreation.handleCreateFolder}
        onCancel={folderCreation.closeFolderModal}
      />
    </div>
  );
}