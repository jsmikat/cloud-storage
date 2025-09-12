import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface UseFolderCreationProps {
  userId: string;
  currentFolder?: string | null;
  onFolderCreated?: () => void;
}

export function useFolderCreation({ userId, currentFolder, onFolderCreated }: UseFolderCreationProps) {
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const openFolderModal = () => {
    setFolderModalOpen(true);
  };

  const closeFolderModal = () => {
    setFolderModalOpen(false);
    setFolderName("");
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

      // Reset state and close modal
      setFolderName("");
      setFolderModalOpen(false);

      // Call the callback to refresh the file list
      if (onFolderCreated) {
        onFolderCreated();
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

  return {
    // State
    folderModalOpen,
    folderName,
    creatingFolder,
    
    // Actions
    openFolderModal,
    closeFolderModal,
    setFolderName,
    handleCreateFolder,
  };
}