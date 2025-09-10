"use client";

import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

interface StorageUsage {
  usage: {
    bytes: number;
    formatted: string;
    percentage: number;
  };
  limit: {
    bytes: number;
    formatted: string;
  };
  remaining: {
    bytes: number;
    formatted: string;
  };
  canUpload: boolean;
}

interface StorageIndicatorProps {
  onStorageUpdate?: (usage: StorageUsage) => void;
}

export default function StorageIndicator({ onStorageUpdate }: StorageIndicatorProps) {
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStorageUsage = async () => {
    try {
      const response = await fetch("/api/storage/usage");
      if (response.ok) {
        const data = await response.json();
        setStorage(data);
        onStorageUpdate?.(data);
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Storage</span>
          <span>Loading...</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
    );
  }

  if (!storage) {
    return null;
  }

  const isNearLimit = storage.usage.percentage >= 80;
  const isAtLimit = storage.usage.percentage >= 95;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Storage</span>
        <span className={`font-medium ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {storage.usage.formatted} of {storage.limit.formatted}
        </span>
      </div>
      <div className="relative">
        <Progress value={storage.usage.percentage} className="h-2" />
        {(isAtLimit || isNearLimit) && (
          <div 
            className={`absolute inset-0 h-2 rounded-full transition-all ${
              isAtLimit ? 'bg-destructive' : 'bg-amber-500'
            }`}
            style={{ width: `${storage.usage.percentage}%` }}
          />
        )}
      </div>
      {isNearLimit && (
        <p className={`text-xs ${isAtLimit ? 'text-destructive' : 'text-amber-600'}`}>
          {isAtLimit 
            ? "Storage full - cannot upload more files" 
            : `${storage.remaining.formatted} remaining`}
        </p>
      )}
    </div>
  );
}
