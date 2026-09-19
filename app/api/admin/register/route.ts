import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = registerSchema.parse(await req.json());

    const exists = await Admin.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { username: body.username.toLowerCase() },
      ],
    });

    if (exists) {
      return NextResponse.json(
        {
          message: "Email or username already exists.",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const admin = await Admin.create({
      name: body.name,
      email: body.email.toLowerCase(),
      username: body.username.toLowerCase(),
      password: hashedPassword,
      role: "Admin",
    });

    return NextResponse.json(
      {
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Registration failed.",
      },
      { status: 500 },
    );
  }
}
