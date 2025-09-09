"use client";

import { ArrowUpFromLine, Download, MoreHorizontal, Star, Trash, X } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Download option - only for files not in trash */}
        {!file.isInTrash && !file.isFolder && (
          <>
            <DropdownMenuItem onClick={() => onDownload(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Star/Unstar option - only for files not in trash */}
        {!file.isInTrash && (
          <DropdownMenuItem onClick={() => onStar(file.id)}>
            <Star
              className={`h-4 w-4 mr-2 ${
                file.isStarred
                  ? "text-yellow-400 fill-current"
                  : "text-gray-400"
              }`}
            />
            {file.isStarred ? "Remove from starred" : "Add to starred"}
          </DropdownMenuItem>
        )}

        {/* Trash/Restore option */}
        <DropdownMenuItem onClick={() => onTrash(file.id)}>
          {file.isInTrash ? (
            <>
              <ArrowUpFromLine className="h-4 w-4 mr-2 text-green-600" />
              Restore from trash
            </>
          ) : (
            <>
              <Trash className="h-4 w-4 mr-2" />
              Move to trash
            </>
          )}
        </DropdownMenuItem>

        {/* Delete permanently option - only for files in trash */}
        {file.isInTrash && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(file)}
              className="text-red-600 focus:text-red-600"
            >
              <X className="h-4 w-4 mr-2" />
              Delete permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}