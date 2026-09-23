import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Teams from "@/models/Teams";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await connectDB();

    const teams = await Teams.find()
      .populate("captain", "employeeName employeeCode")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET TEAMS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load teams.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const color =
      typeof body.color === "string" && body.color.trim() !== ""
        ? body.color.trim()
        : undefined;

    const logo =
      typeof body.logo === "string" && body.logo.trim() !== ""
        ? body.logo.trim()
        : undefined;

    const captain =
      body.captain && String(body.captain).trim() !== ""
        ? String(body.captain)
        : null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name is required.",
        },
        { status: 400 },
      );
    }

    const teamData: {
      name: string;
      color?: string;
      logo?: string;
      captain?: string | null;
    } = {
      name,
      captain,
    };

    if (color) {
      teamData.color = color;
    }

    if (logo) {
      teamData.logo = logo;
    }

    const team = await Teams.create(teamData);

    if (captain) {
      const employee = await Employee.findById(captain);

      if (!employee) {
        await Teams.findByIdAndDelete(team._id);

        return NextResponse.json(
          {
            success: false,
            message: "Selected captain was not found.",
          },
          { status: 400 },
        );
      }

      await Employee.findByIdAndUpdate(captain, {
        role: "Captain",
        isCaptain: true,
        isRegistered: true,
        team: team.name,
        teamId: team._id,
      });
    }

    await team.populate("captain", "employeeName employeeCode");

    return NextResponse.json(team, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create team.",
      },
      { status: 500 },
    );
  }
}
