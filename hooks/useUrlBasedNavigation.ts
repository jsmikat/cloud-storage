import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface FolderItem {
  id: string;
  name: string;
}

interface UseUrlBasedNavigationProps {
  onFolderChange?: (folderId: string | null, path?: FolderItem[]) => void;
}

export function useUrlBasedNavigation({ onFolderChange }: UseUrlBasedNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [folderPath, setFolderPath] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse URL parameters on mount and when search params change
  useEffect(() => {
    const folderId = searchParams.get('folder');
    const pathParam = searchParams.get('path');
    
    // Only update if different from current state to avoid loops
    if (!isInitialized || folderId !== currentFolder) {
      setCurrentFolder(folderId);
      
      // Parse the path from URL parameter
      let newPath: FolderItem[] = [];
      if (pathParam) {
        try {
          newPath = JSON.parse(decodeURIComponent(pathParam));
        } catch (error) {
          console.error('Error parsing folder path from URL:', error);
          newPath = [];
        }
      }
      
      setFolderPath(newPath);
      setIsInitialized(true);
      
      // Always notify parent component about the folder change
      // This is crucial for triggering file list refresh on browser navigation
      if (onFolderChange) {
        onFolderChange(folderId, newPath);
      }
    }
  }, [searchParams, onFolderChange, currentFolder, isInitialized]);

  // Handle browser back/forward events
  useEffect(() => {
    const handlePopState = () => {
      // Force re-read from URL when browser navigation occurs
      setIsInitialized(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL using Next.js router
  const updateUrl = useCallback((folderId: string | null, path: FolderItem[]) => {
    const params = new URLSearchParams(window.location.search);
    
    if (folderId) {
      params.set('folder', folderId);
    } else {
      params.delete('folder');
    }
    
    if (path.length > 0) {
      params.set('path', encodeURIComponent(JSON.stringify(path)));
    } else {
      params.delete('path');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    
    // Use router.push to properly handle Next.js navigation
    router.push(newUrl);
  }, [router]);

  // Navigate to a folder
  const navigateToFolder = useCallback((folderId: string, folderName: string) => {
    const newPath = [...folderPath, { id: folderId, name: folderName }];
    
    setFolderPath(newPath);
    setCurrentFolder(folderId);
    updateUrl(folderId, newPath);
    
    // Notify parent component about folder change
    if (onFolderChange) {
      onFolderChange(folderId, newPath);
    }
  }, [folderPath, onFolderChange, updateUrl]);

  // Navigate back to parent folder
  const navigateUp = useCallback(() => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      
      setFolderPath(newPath);
      setCurrentFolder(newFolderId);
      updateUrl(newFolderId, newPath);
      
      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId, newPath);
      }
    }
  }, [folderPath, onFolderChange, updateUrl]);

  // Navigate to specific folder in path
  const navigateToPathFolder = useCallback((index: number) => {
    if (index < 0) {
      // Navigate to root
      setFolderPath([]);
      setCurrentFolder(null);
      updateUrl(null, []);
      
      if (onFolderChange) {
        onFolderChange(null, []);
      }
    } else {
      const newPath = folderPath.slice(0, index + 1);
      const newFolderId = newPath[newPath.length - 1].id;
      
      setFolderPath(newPath);
      setCurrentFolder(newFolderId);
      updateUrl(newFolderId, newPath);
      
      if (onFolderChange) {
        onFolderChange(newFolderId, newPath);
      }
    }
  }, [folderPath, onFolderChange, updateUrl]);

  // Handle file or folder click
  const handleItemClick = useCallback((
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
  }, [navigateToFolder]);

  return {
    folderPath,
    currentFolder,
    navigateToFolder,
    navigateUp,
    navigateToPathFolder,
    handleItemClick,
  };
}