import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { createAdminToken } from "@/lib/adminAuth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = loginSchema.parse(await req.json());

    const admin = await Admin.findOne({
      username: body.username.toLowerCase(),
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Invalid credentials.",
        },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(body.password, admin.password);

    if (!validPassword) {
      return NextResponse.json(
        {
          message: "Invalid credentials.",
        },
        { status: 401 },
      );
    }

    const token = createAdminToken({
      id: admin._id.toString(),
      username: admin.username,
      role: "Admin",
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        name: admin.name,
        username: admin.username,
      },
    });

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Login failed.",
      },
      { status: 500 },
    );
  }
}
