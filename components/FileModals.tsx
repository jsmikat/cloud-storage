"use client";

import { Trash, X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

type FileType = {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  userId: string;
  parentId: string | null;
  isFolder: boolean;
  isStarred: boolean;
  isInTrash: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface FileModalsProps {
  deleteModalOpen: boolean;
  emptyTrashModalOpen: boolean;
  selectedFile: FileType | null;
  trashCount: number;
  onDeleteModalChange: (open: boolean) => void;
  onEmptyTrashModalChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onConfirmEmptyTrash: () => void;
}

export default function FileModals({
  deleteModalOpen,
  emptyTrashModalOpen,
  selectedFile,
  trashCount,
  onDeleteModalChange,
  onEmptyTrashModalChange,
  onConfirmDelete,
  onConfirmEmptyTrash,
}: FileModalsProps) {
  return (
    <>
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={onDeleteModalChange}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        iconColor="text-red-600"
        confirmText="Delete Permanently"
        confirmVariant="destructive"
        onConfirm={onConfirmDelete}
        isDangerous={true}
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered.`}
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={onEmptyTrashModalChange}
        title="Empty Trash"
        description="Are you sure you want to empty the trash?"
        icon={Trash}
        iconColor="text-red-600"
        confirmText="Empty Trash"
        confirmVariant="destructive"
        onConfirm={onConfirmEmptyTrash}
        isDangerous={true}
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash. These files will be permanently removed from your account and cannot be recovered.`}
      />
    </>
  );
}