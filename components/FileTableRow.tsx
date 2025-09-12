"use client";

import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
import FileActions from "./FileActions";
import FileIcon from "./FileIcon";
import { TableCell, TableRow } from "./ui/table";

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

interface FileTableRowProps {
  file: FileType;
  onItemClick: (file: FileType, event: React.MouseEvent) => void;
  onStar: (fileId: string) => void;
  onTrash: (fileId: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileTableRow({
  file,
  onItemClick,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileTableRowProps) {
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <TableRow
      key={file.id}
      className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
        file.isFolder || file ? "cursor-pointer" : ""
      }`}
      onClick={(event) => onItemClick(file, event)}
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
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current flex-shrink-0" />
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
          {file.isFolder ? "Folder" : file.type.split("/")[0]}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell py-3">
        <span className="text-sm text-muted-foreground">
          {file.isFolder ? "—" : formatFileSize(file.size)}
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
          onStar={onStar}
          onTrash={onTrash}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      </TableCell>
    </TableRow>
  );
}