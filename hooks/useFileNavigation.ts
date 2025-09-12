import { useState } from "react";

interface FolderItem {
  id: string;
  name: string;
}

interface UseFileNavigationProps {
  onFolderChange?: (folderId: string | null, path?: FolderItem[]) => void;
}

export function useFileNavigation({ onFolderChange }: UseFileNavigationProps) {
  const [folderPath, setFolderPath] = useState<FolderItem[]>([]);

  // Navigate to a folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    const newPath = [...folderPath, { id: folderId, name: folderName }];
    setFolderPath(newPath);

    // Notify parent component about folder change
    if (onFolderChange) {
      onFolderChange(folderId, newPath);
    }
  };

  // Navigate back to parent folder
  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      const newFolderId =
        newPath.length > 0 ? newPath[newPath.length - 1].id : null;

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId, newPath);
      }
    }
  };

  // Navigate to specific folder in path
  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setFolderPath([]);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(null, []);
      }
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const newFolderId = newPath[newPath.length - 1].id;

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId, newPath);
      }
    }
  };

  // Handle file or folder click
  const handleItemClick = (
    file: { isFolder: boolean; id: string; name: string },
    openFileViewer: (file: any) => void,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else {
      openFileViewer(file);
    }
  };

  return {
    folderPath,
    navigateToFolder,
    navigateUp,
    navigateToPathFolder,
    handleItemClick,
  };
}