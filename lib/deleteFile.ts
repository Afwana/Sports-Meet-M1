import fs from "fs/promises";
import path from "path";

export async function deleteFile(fileUrl: string) {
  if (!fileUrl) return;

  try {
    const filePath = path.join(process.cwd(), "public", fileUrl);

    await fs.unlink(filePath);
  } catch {
    // Ignore if file doesn't exist
  }
}
