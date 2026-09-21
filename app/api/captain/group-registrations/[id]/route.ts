import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import Games from "@/models/Games";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { getAgeCategory } from "@/lib/getAgeCategory";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();
    const { id } = await params;
    const { participants } = await req.json();

    const registration = await GroupRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
      );
    }

    if (registration.team.toString() !== captain.teamId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 },
      );
    }

    const game = await Games.findById(registration.game);

    if (!game) {
      return NextResponse.json(
        { success: false, message: "Game not found." },
        { status: 404 },
      );
    }

    if (participants.length < game.minParticipants) {
      return NextResponse.json(
        { success: false, message: "Minimum participants required." },
        { status: 400 },
      );
    }

    if (participants.length > game.maxParticipants) {
      return NextResponse.json(
        { success: false, message: "Maximum exceeded." },
        { status: 400 },
      );
    }

    const unique = [...new Set(participants.map(String))];

    const employees = await Employee.find({
      _id: { $in: unique },
      teamId: captain.teamId,
    });

    if (
      (game.category === "Sports" || game.category === "Games") &&
      game.ageCategory !== "Open"
    ) {
      for (const emp of employees) {
        if (getAgeCategory(emp.dateOfBirth) !== game.ageCategory) {
          return NextResponse.json(
            {
              success: false,
              message: `${emp.employeeName} is not eligible.`,
            },
            { status: 400 },
          );
        }
      }
    }

    const conflict = await GroupRegistration.findOne({
      _id: { $ne: registration._id },
      game: registration.game,
      team: captain.teamId,
      participants: { $in: unique },
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message: "Some employees are already assigned.",
        },
        { status: 400 },
      );
    }

    registration.participants = unique;

    await registration.save();

    const updated = await GroupRegistration.findById(id)
      .populate("game", "name")
      .populate("participants", "employeeName employeeCode");

    return NextResponse.json({
      success: true,
      registration: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update group." },
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

    const captain = await getCurrentEmployee();
    const { id } = await params;

    const registration = await GroupRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
      );
    }

    if (registration.team.toString() !== captain.teamId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 },
      );
    }

    await GroupRegistration.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Group deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete group." },
      { status: 500 },
    );
  }
}
