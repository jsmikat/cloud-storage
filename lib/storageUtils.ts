export const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50MB


export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function getStoragePercentage(usedBytes: number): number {
  return Math.round((usedBytes / STORAGE_LIMIT_BYTES) * 100);
}


export function wouldExceedLimit(currentUsage: number, fileSize: number): boolean {
  return (currentUsage + fileSize) > STORAGE_LIMIT_BYTES;
}


export function getRemainingSpace(currentUsage: number): number {
  return Math.max(0, STORAGE_LIMIT_BYTES - currentUsage);
}
