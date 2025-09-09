import { db } from "@/database/drizzleClient";
import { files } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;

    // First, check if the file exists and belongs to the user
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Toggle the starred status
    const newStarredStatus = !file.isStarred;

    // Update the file's starred status
    const [updatedFile] = await db
      .update(files)
      .set({
        isStarred: newStarredStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      isStarred: updatedFile.isStarred,
      message: updatedFile.isStarred ? "File starred" : "File unstarred",
    });
  } catch (error) {
    console.error("Error updating file star status:", error);
    return NextResponse.json(
      { error: "Failed to update star status" },
      { status: 500 }
    );
  }
}
