import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/database/drizzleClient";
import { files } from "@/database/schema";
import { STORAGE_LIMIT_BYTES, formatBytes, wouldExceedLimit } from "@/lib/storageUtils";
import { and, eq, sum } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as string;
    const parentId = (formData.get("parentId") as string) || null;

    // Verify the user is uploading to their own account
    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check user's current storage usage
    const currentUsage = await getUserStorageUsage(userId);
    
    if (wouldExceedLimit(currentUsage, file.size)) {
      const remainingSpace = STORAGE_LIMIT_BYTES - currentUsage;
      
      return NextResponse.json(
        { 
          error: `Storage limit exceeded. You've used ${formatBytes(currentUsage)} of ${formatBytes(STORAGE_LIMIT_BYTES)}. This file (${formatBytes(file.size)}) would exceed your storage limit.`,
          currentUsage,
          limit: STORAGE_LIMIT_BYTES,
          fileSize: file.size,
          remainingSpace: Math.max(0, remainingSpace)
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    // Check if parent folder exists if parentId is provided
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true)
          )
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    // Only allow image uploads
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only image files are supported" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Create folder path based on parent folder if exists
    const folderPath = parentId
      ? `/cloudvault/${userId}/folders/${parentId}`
      : `/cloudvault/${userId}`;

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: false,
    });

    const fileData = {
      name: originalFilename,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}