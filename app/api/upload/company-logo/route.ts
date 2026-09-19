import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        { status: 400 },
      );
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PNG, JPG and WEBP are allowed.",
        },
        { status: 400 },
      );
    }

    /*
     * Optional size validation.
     * 2 MB maximum.
     */
    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Logo size must be less than 2 MB.",
        },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/company");

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const ext = path.extname(file.name).toLowerCase();

    const safeName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    const fileName = `${safeName}-${Date.now()}${ext}`;

    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/company/${fileName}`,
    });
  } catch (error) {
    console.error("Company logo upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      { status: 500 },
    );
  }
}
