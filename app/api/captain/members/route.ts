import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export async function GET() {
  await connectDB();

  const captain = await getCurrentEmployee();

  const members = await Employee.find({
    team: captain.team,
  }).sort({
    role: -1,
    employeeName: 1,
  });

  return NextResponse.json(members);
}
