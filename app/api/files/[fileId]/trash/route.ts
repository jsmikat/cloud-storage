import { db } from "@/database/drizzleClient";
import { files } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    // First, check if the file exists and belongs to the user
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Toggle the trash status
    const newTrashStatus = !file.isInTrash;

    // Update the file's trash status
    const [updatedFile] = await db
      .update(files)
      .set({
        isInTrash: newTrashStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      isInTrash: updatedFile.isInTrash,
      message: updatedFile.isInTrash ? "File moved to trash" : "File restored from trash",
    });
  } catch (error) {
    console.error("Error updating file trash status:", error);
    return NextResponse.json(
      { error: "Failed to update trash status" },
      { status: 500 }
    );
  }
}
