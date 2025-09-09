"use client";

import FileActionButtons from "@/components/FileActionButtons";
import FileActions from "@/components/FileActions";
import FileTabs from "@/components/FileTabs";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Star, Trash, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmationModal from "./ConfirmationModal";
import FileEmptyState from "./FileEmptyState";
import FileIcon from "./FileIcon";
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
    TableCell,
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
  onFolderChange?: (folderId: string | null) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

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

  // Fetch files when userId, refreshTrigger, or currentFolder changes
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

  const handleStarFile = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/star`);

      // Update local state using the response data
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isStarred: response.data.isStarred } : file
        )
      );

      // Show toast
      const file = files.find((f) => f.id === fileId);
      toast.success(`${response.data.isStarred ? "Added to Starred" : "Removed from Starred"}. "${file?.name}" has been ${
        response.data.isStarred ? "added to" : "removed from"
      } your starred files`);
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Action Failed. We couldn't update the star status. Please try again.");
    }
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/trash`);
      const responseData = response.data;

      // Update local state using the response data
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isInTrash: responseData.isInTrash } : file
        )
      );

      // Show toast
      const file = files.find((f) => f.id === fileId);
      toast.success(`${responseData.isInTrash ? "Moved to Trash" : "Restored from Trash"}. "${file?.name}" has been ${
        responseData.isInTrash ? "moved to trash" : "restored"
      }`);
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("Action Failed. We couldn't update the file status. Please try again.");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      // Store file info before deletion for the toast message
      const fileToDelete = files.find((f) => f.id === fileId);
      const fileName = fileToDelete?.name || "File";

      // Send delete request
      const response = await axios.delete(`/api/files/${fileId}/delete`);

      if (response.data.success) {
        // Remove file from local state
        setFiles(files.filter((file) => file.id !== fileId));

        // Show success toast
        toast.success(`File Permanently Deleted. "${fileName}" has been permanently removed`);

        // Close modal if it was open
        setDeleteModalOpen(false);
      } else {
        throw new Error(response.data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Deletion Failed. We couldn't delete the file. Please try again later.");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);

      // Remove all trashed files from local state
      setFiles(files.filter((file) => !file.isInTrash));

      // Show toast
      toast.success(`Trash Emptied. All ${trashCount} items have been permanently deleted`);

      // Close modal
      setEmptyTrashModalOpen(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Action Failed. We couldn't empty the trash. Please try again later.");
    }
  };

  // Add this function to handle file downloads
  const handleDownloadFile = async (file: any) => {
    try {
      // Show loading toast
      toast.loading(`Preparing Download. Getting "${file.name}" ready for download...`);

      // For images, we can use the ImageKit URL directly with optimized settings
      if (file.type.startsWith("image/")) {
        // Create a download-optimized URL with ImageKit
        // Using high quality and original dimensions for downloads
        const downloadUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;

        // Fetch the image first to ensure it's available
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }

        // Get the blob data
        const blob = await response.blob();

        // Create a download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        // Remove loading toast and show success toast
        toast.success(`Download Ready. "${file.name}" is ready to download.`);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // For other file types, use the fileUrl directly
        const response = await fetch(file.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }

        // Get the blob data
        const blob = await response.blob();

        // Create a download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        // Remove loading toast and show success toast
        toast.success(`Download Ready. "${file.name}" is ready to download.`);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Download Failed. We couldn't download the file. Please try again later.");
    }
  };

  // Function to open image in a new tab with optimized view
  const openImageViewer = (file: any) => {
    if (file.type.startsWith("image/")) {
      // Create an optimized URL with ImageKit transformations for viewing
      // Using higher quality and responsive sizing for better viewing experience
      const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,h-1200,fo-auto/${file.path}`;
      window.open(optimizedUrl, "_blank");
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);

    // Notify parent component about folder change
    if (onFolderChange) {
      onFolderChange(folderId);
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
      setCurrentFolder(newFolderId);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };

  // Navigate to specific folder in path
  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(null);
      }
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const newFolderId = newPath[newPath.length - 1].id;
      setCurrentFolder(newFolderId);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };

  // Handle file or folder click
  const handleItemClick = (file: any) => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else if (file.type.startsWith("image/")) {
      openImageViewer(file);
    }
  };

  if (loading) {
    return <FileLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Tabs with minimal styling */}
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {/* Breadcrumb navigation - only for all files */}
      {activeTab === "all" && folderPath.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigateToPathFolder(-1)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
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
                      onClick={() => navigateToPathFolder(index)}
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
                <TableRow
                  key={file.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    file.isFolder || file.type.startsWith("image/")
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => handleItemClick(file)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <FileIcon file={file} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {file.name}
                          </span>
                          {file.isStarred && (
                            <Star
                              className="h-3.5 w-3.5 text-yellow-500 fill-current flex-shrink-0"
                            />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground sm:hidden mt-0.5">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3">
                    <span className="text-sm text-muted-foreground">
                      {file.isFolder ? "Folder" : file.type.split('/')[0]}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3">
                    <span className="text-sm text-muted-foreground">
                      {file.isFolder
                        ? "—"
                        : file.size < 1024
                          ? `${file.size} B`
                          : file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(file.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-right py-3">
                    <FileActions
                      file={file}
                      onStar={handleStarFile}
                      onTrash={handleTrashFile}
                      onDelete={(file) => {
                        setSelectedFile(file);
                        setDeleteModalOpen(true);
                      }}
                      onDownload={handleDownloadFile}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description={`Are you sure you want to permanently delete this file?`}
        icon={X}
        iconColor="text-red-600"
        confirmText="Delete Permanently"
        confirmVariant="destructive"
        onConfirm={() => {
          if (selectedFile) {
            handleDeleteFile(selectedFile.id);
          }
        }}
        isDangerous={true}
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered.`}
      />
     
      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description={`Are you sure you want to empty the trash?`}
        icon={Trash}
        iconColor="text-red-600"
        confirmText="Empty Trash"
        confirmVariant="destructive"
        onConfirm={handleEmptyTrash}
        isDangerous={true}
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash. These files will be permanently removed from your account and cannot be recovered.`}
      />
     
    </div>
  );
}