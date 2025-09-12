"use client";

import FileList from "@/components/FileList";
import FileUploadForm from "@/components/FileUploadForm";
import { FileText, FileUp, Home } from "lucide-react";
import React, { useCallback, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Card, CardContent, CardHeader } from "./ui/card";

interface FileSectionProps {
  userId: string;
}

// Folder data interface
interface FolderData {
  id: string;
  name: string;
  parentId?: string | null;
}

export default function FileSection({ userId }: FileSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<FolderData[]>([]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback(
    (folderId: string | null, path?: Array<{ id: string; name: string }>) => {
      setCurrentFolder(folderId);
      if (path) {
        // Convert the path to FolderData format
        const folderDataPath: FolderData[] = path.map(folder => ({
          id: folder.id,
          name: folder.name,
          parentId: null // We can set this later if needed
        }));
        setFolderPath(folderDataPath);
      } else {
        setFolderPath([]);
      }
    },
    [currentFolder, folderPath]
  );

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
                currentFolder={currentFolder}
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
                currentFolder={currentFolder}
                onFolderChange={handleFolderChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}