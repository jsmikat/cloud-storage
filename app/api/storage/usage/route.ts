import { db } from "@/database/drizzleClient";
import { files } from "@/database/schema";
import { STORAGE_LIMIT_BYTES, formatBytes, getRemainingSpace, getStoragePercentage } from "@/lib/storageUtils";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

// Function to get user's current storage usage
async function getUserStorageUsage(userId: string): Promise<number> {
  const result = await db
    .select({ totalSize: sum(files.size) })
    .from(files)
    .where(
      and(
        eq(files.userId, userId),
        eq(files.isInTrash, false),
        eq(files.isFolder, false)
      )
    );
  
  return result[0]?.totalSize ? Number(result[0].totalSize) : 0;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usageBytes = await getUserStorageUsage(userId);
    const remainingBytes = getRemainingSpace(usageBytes);
    const usagePercentage = getStoragePercentage(usageBytes);

    return NextResponse.json({
      usage: {
        bytes: usageBytes,
        formatted: formatBytes(usageBytes),
        percentage: usagePercentage
      },
      limit: {
        bytes: STORAGE_LIMIT_BYTES,
        formatted: formatBytes(STORAGE_LIMIT_BYTES)
      },
      remaining: {
        bytes: remainingBytes,
        formatted: formatBytes(remainingBytes)
      },
      canUpload: remainingBytes > 0
    });
  } catch (error) {
    console.error("Error fetching storage usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}
