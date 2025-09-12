"use client";

import FileList from "@/components/FileList";
import FileUploadForm from "@/components/FileUploadForm";
import { useUrlBasedNavigation } from "@/hooks/useUrlBasedNavigation";
import { FileText, FileUp } from "lucide-react";
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface FileSectionProps {
  userId: string;
}

// File type interface for proper typing
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

// Folder data interface
interface FolderData {
  id: string;
  name: string;
  parentId?: string | null;
}

export default function FileSection({ userId }: FileSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Use URL-based navigation for browser back/forward support
  const navigation = useUrlBasedNavigation({
    onFolderChange: useCallback(() => {
      // Trigger refresh when folder changes to reload file list
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  });

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Create wrapper for item click to match FileList interface
  const handleItemClick = useCallback((file: FileType, event: React.MouseEvent) => {
    const openFileViewer = (file: any) => {
      const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${file.path}`;
      window.open(optimizedUrl, "_blank");
    };
    
    navigation.handleItemClick(file, openFileViewer, event);
  }, [navigation]);

  return (
    <>
      {/* Breadcrumb Navigation */}
      {/* {folderPath.length > 0 && (
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => handleFolderChange(null, [])}
                  className="cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === folderPath.length - 1 ? (
                      <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        onClick={() => handleFolderChange(folder.id, folderPath.slice(0, index + 1))}
                        className="cursor-pointer"
                      >
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload</h2>
            </CardHeader>
            <CardContent>
              <FileUploadForm
                userId={userId}
                onUploadSuccess={handleFileUploadSuccess}
                currentFolder={navigation.currentFolder}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Files</h2>
            </CardHeader>
            <CardContent>
              <FileList
                userId={userId}
                refreshTrigger={refreshTrigger}
                currentFolder={navigation.currentFolder}
                folderPath={navigation.folderPath}
                onFolderChange={() => {
                  // The FileSection navigation hook handles URL updates automatically
                  // Just trigger refresh for the file list
                  setRefreshTrigger((prev) => prev + 1);
                }}
                onNavigateToFolder={navigation.navigateToFolder}
                onNavigateUp={navigation.navigateUp}
                onNavigateToPathFolder={navigation.navigateToPathFolder}
                onItemClick={handleItemClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}