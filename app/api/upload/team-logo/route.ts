import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 },
      );
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { message: "Only PNG, JPG and WEBP are allowed." },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/teams");

    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);

    const safeName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    const fileName = `${safeName}-${Date.now()}${ext}`;

    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/teams/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Upload failed." }, { status: 500 });
  }
}
