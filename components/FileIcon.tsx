"use client";

import { Archive, FileText, FileVideo, Folder, Image, Music } from "lucide-react";

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

export default function FileIcon({ file }: { file: FileType }) {
  if (file.isFolder) return <Folder className="h-5 w-5 text-blue-500" />;

  const fileType = file.type.split("/")[0];
  const iconClass = "h-5 w-5";
  
  switch (fileType) {
    case "image":
      return <Image className={`${iconClass} text-green-500`} />;
    case "video":
      return <FileVideo className={`${iconClass} text-purple-500`} />;
    case "audio":
      return <Music className={`${iconClass} text-orange-500`} />;
    case "application":
      if (file.type.includes("zip") || file.type.includes("rar") || file.type.includes("archive")) {
        return <Archive className={`${iconClass} text-yellow-500`} />;
      }
      return <FileText className={`${iconClass} text-blue-500`} />;
    default:
      return <FileText className={`${iconClass} text-gray-500`} />;
  }
}