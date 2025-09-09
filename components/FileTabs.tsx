"use client";

import { File, Star, Trash } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

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

interface FileTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  files: FileType[];
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  files,
  starredCount,
  trashCount,
}: FileTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 gap-2 bg-muted/50">
        <TabsTrigger 
          value="all" 
          className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          <File className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium hidden sm:inline">All Files</span>
          <span className="font-medium sm:hidden">All</span>
          <Badge
            variant="secondary"
            className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            {files.filter((file) => !file.isInTrash).length}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="starred"
          className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          <Star className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium hidden sm:inline">Starred</span>
          <span className="font-medium sm:hidden">Star</span>
          <Badge
            variant="secondary"
            className="ml-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            {starredCount}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="trash"
          className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
        >
          <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium hidden sm:inline">Trash</span>
          <span className="font-medium sm:hidden">Trash</span>
          <Badge
            variant="destructive"
            className="ml-1"
          >
            {trashCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}