import axios from "axios";
import { toast } from "sonner";

interface FileType {
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
}

interface UseFileOperationsProps {
  files: FileType[];
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>;
  trashCount: number;
}

export function useFileOperations({ files, setFiles, trashCount }: UseFileOperationsProps) {
  
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
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Action Failed. We couldn't empty the trash. Please try again later.");
    }
  };

  const handleDownloadFile = async (file: FileType) => {
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

  const openFileViewer = (file: FileType) => {
    // Create an optimized URL with ImageKit transformations for viewing
    // Using higher quality and responsive sizing for better viewing experience
    const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${file.path}`;
    window.open(optimizedUrl, "_blank");
  };

  return {
    handleStarFile,
    handleTrashFile,
    handleDeleteFile,
    handleEmptyTrash,
    handleDownloadFile,
    openFileViewer,
  };
}