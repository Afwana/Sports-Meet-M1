import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database Connection Failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}