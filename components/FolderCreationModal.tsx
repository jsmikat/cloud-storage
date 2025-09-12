"use client";

import { FolderPlus } from "lucide-react";
import { LoadingSpinner } from "./ui";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface FolderCreationModalProps {
  isOpen: boolean;
  folderName: string;
  creatingFolder: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onCancel: () => void;
}

export default function FolderCreationModal({
  isOpen,
  folderName,
  creatingFolder,
  onOpenChange,
  onFolderNameChange,
  onCreateFolder,
  onCancel,
}: FolderCreationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FolderPlus className="h-5 w-5" />
            Create Folder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderName" className="text-sm font-medium">
              Folder Name
            </Label>
            <Input
              id="folderName"
              type="text"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateFolder}
            disabled={creatingFolder || !folderName.trim()}
            className="h-9"
          >
            {creatingFolder ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}