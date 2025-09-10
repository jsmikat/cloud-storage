// Storage limit per user: 50MB in bytes
export const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get storage usage percentage
 */
export function getStoragePercentage(usedBytes: number): number {
  return Math.round((usedBytes / STORAGE_LIMIT_BYTES) * 100);
}

/**
 * Check if upload would exceed storage limit
 */
export function wouldExceedLimit(currentUsage: number, fileSize: number): boolean {
  return (currentUsage + fileSize) > STORAGE_LIMIT_BYTES;
}

/**
 * Get remaining storage space
 */
export function getRemainingSpace(currentUsage: number): number {
  return Math.max(0, STORAGE_LIMIT_BYTES - currentUsage);
}
