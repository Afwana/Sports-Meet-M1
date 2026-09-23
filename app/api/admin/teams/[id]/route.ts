import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teams from "@/models/Teams";
import Employee from "@/models/Employee";
import { deleteFile } from "@/lib/deleteFile";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const oldTeam = await Teams.findById(id);

    if (!oldTeam) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found.",
        },
        { status: 404 },
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : oldTeam.name;

    const color = typeof body.color === "string" ? body.color : oldTeam.color;

    const logo =
      typeof body.logo === "string" ? body.logo.trim() : oldTeam.logo;

    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : oldTeam.isActive;

    const newCaptainId =
      typeof body.captain === "string" && body.captain.trim() !== ""
        ? body.captain.trim()
        : null;

    const oldCaptainId = oldTeam.captain ? oldTeam.captain.toString() : null;

    if (oldTeam.logo && oldTeam.logo !== logo) {
      try {
        await deleteFile(oldTeam.logo);
      } catch (error) {
        console.error("Failed to delete old team logo:", error);
      }
    }

    if (oldCaptainId && oldCaptainId !== newCaptainId) {
      await Employee.findByIdAndUpdate(oldCaptainId, {
        role: "Employee",
        isCaptain: false,
        team: name,
        teamId: oldTeam._id,
      });
    }

    const team = await Teams.findByIdAndUpdate(
      id,
      {
        name,
        color,
        logo,
        captain: newCaptainId,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update team.",
        },
        { status: 500 },
      );
    }

    await Employee.updateMany(
      {
        teamId: team._id,
      },
      {
        $set: {
          team: team.name,
        },
      },
    );

    if (newCaptainId) {
      const newCaptain = await Employee.findById(newCaptainId);

      if (!newCaptain) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected captain was not found.",
          },
          { status: 400 },
        );
      }

      await Employee.findByIdAndUpdate(newCaptainId, {
        role: "Captain",
        isCaptain: true,
        isRegistered: true,
        team: team.name,
        teamId: team._id,
      });
    }

    await team.populate("captain", "employeeName employeeCode");

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Team PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update team.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    // Find the team first
    const team = await Teams.findById(id);

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found.",
        },
        { status: 404 },
      );
    }

    // Demote captain back to Employee
    if (team.captain) {
      await Employee.findByIdAndUpdate(team.captain, {
        role: "Employee",
        isCaptain: false,
        team: "",
        teamId: null,
      });
    }

    // Delete team
    await Teams.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully.",
      id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete team.",
      },
      { status: 500 },
    );
  }
}
