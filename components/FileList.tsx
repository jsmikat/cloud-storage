"use client";

import FileActionButtons from "@/components/FileActionButtons";
import FileTabs from "@/components/FileTabs";
import { useFileOperations } from "@/hooks/useFileOperations";
import axios from "axios";
import { Home } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FileEmptyState from "./FileEmptyState";
import FileModals from "./FileModals";
import FileTableRow from "./FileTableRow";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";



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

const FileLoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-muted-foreground">Loading files...</div>
  </div>
);


interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  currentFolder?: string | null;
  folderPath?: Array<{ id: string; name: string }>;
  onFolderChange?: (folderId: string | null, path?: Array<{ id: string; name: string }>) => void;
  onNavigateToFolder?: (folderId: string, folderName: string) => void;
  onNavigateUp?: () => void;
  onNavigateToPathFolder?: (index: number) => void;
  onItemClick?: (file: FileType, event: React.MouseEvent) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  currentFolder = null,
  folderPath = [],
  onFolderChange,
  onNavigateToFolder,
  onNavigateUp,
  onNavigateToPathFolder,
  onItemClick,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) {
        url += `&parentId=${currentFolder}`;
      }

      const response = await axios.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error Loading Files. We couldn't load your files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId, refreshTrigger, currentFolder]);

  // Filter files based on active tab
  const filteredFiles = useMemo(() => {
    switch (activeTab) {
      case "starred":
        return files.filter((file) => file.isStarred && !file.isInTrash);
      case "trash":
        return files.filter((file) => file.isInTrash);
      case "all":
      default:
        return files.filter((file) => !file.isInTrash);
    }
  }, [files, activeTab]);

  // Count files in trash
  const trashCount = useMemo(() => {
    return files.filter((file) => file.isInTrash).length;
  }, [files]);

  // Count starred files
  const starredCount = useMemo(() => {
    return files.filter((file) => file.isStarred && !file.isInTrash).length;
  }, [files]);

  // Use custom hooks (after state calculations)
  const fileOperations = useFileOperations({ files, setFiles, trashCount });

  // Function to open file viewer
  const openFileViewer = (file: FileType) => {
    const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${file.path}`;
    window.open(optimizedUrl, "_blank");
  };

  // Handle item click wrapper
  const handleItemClick = (file: FileType, event: React.MouseEvent) => {
    if (onItemClick) {
      onItemClick(file, event);
    } else {
      // Fallback behavior
      event.preventDefault();
      event.stopPropagation();
      if (file.isFolder && onNavigateToFolder) {
        onNavigateToFolder(file.id, file.name);
      } else {
        // Open file viewer
        const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${file.path}`;
        window.open(optimizedUrl, "_blank");
      }
    }
  };

  // Handle delete file with modal
  const handleDeleteWithModal = (file: FileType) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (selectedFile) {
      fileOperations.handleDeleteFile(selectedFile.id);
      setDeleteModalOpen(false);
    }
  };

  // Handle empty trash confirmation
  const handleConfirmEmptyTrash = () => {
    fileOperations.handleEmptyTrash();
    setEmptyTrashModalOpen(false);
  };

  if (loading) {
    return <FileLoadingState />;
  }

  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {activeTab === "all" && folderPath.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => onNavigateToPathFolder && onNavigateToPathFolder(-1)}
                className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-1 inline-block" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === folderPath.length - 1 ? (
                    <BreadcrumbPage className="font-medium">
                      {folder.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => onNavigateToPathFolder && onNavigateToPathFolder(index)}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      {folder.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Action buttons */}
      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      {/* Files display */}
      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table className="w-full">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="font-medium text-muted-foreground">Name</TableHead>
                <TableHead className="hidden sm:table-cell font-medium text-muted-foreground">Type</TableHead>
                <TableHead className="hidden md:table-cell font-medium text-muted-foreground">Size</TableHead>
                <TableHead className="hidden sm:table-cell font-medium text-muted-foreground">Modified</TableHead>
                <TableHead className="w-16 text-right font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <FileTableRow
                  key={file.id}
                  file={file}
                  onItemClick={handleItemClick}
                  onStar={fileOperations.handleStarFile}
                  onTrash={fileOperations.handleTrashFile}
                  onDelete={handleDeleteWithModal}
                  onDownload={fileOperations.handleDownloadFile}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FileModals
        deleteModalOpen={deleteModalOpen}
        emptyTrashModalOpen={emptyTrashModalOpen}
        selectedFile={selectedFile}
        trashCount={trashCount}
        onDeleteModalChange={setDeleteModalOpen}
        onEmptyTrashModalChange={setEmptyTrashModalOpen}
        onConfirmDelete={handleConfirmDelete}
        onConfirmEmptyTrash={handleConfirmEmptyTrash}
      />
    </div>
  );
}