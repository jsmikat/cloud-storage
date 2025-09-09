"use client";

import FileList from "@/components/FileList";
import FileUploadForm from "@/components/FileUploadForm";
import { FileText, FileUp, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Card, CardContent, CardHeader } from "./ui/card";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

// Mock folder data for breadcrumb demo - you can replace this with real data
interface FolderData {
  id: string;
  name: string;
  parentId?: string | null;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<FolderData[]>([]);

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null, path?: FolderData[]) => {
    setCurrentFolder(folderId);
    if (path) {
      setFolderPath(path);
    } else {
      setFolderPath([]);
    }
  }, []);

  return (
    <>
      

    
          {/* Breadcrumb Navigation */}
          {folderPath.length > 0 && (
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
          )}

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
                    onFolderChange={handleFolderChange}
                  />
                  
                </CardContent>
              </Card>
            </div>
          </div>
       
    </>
  );
}