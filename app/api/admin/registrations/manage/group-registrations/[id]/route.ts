import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { getAgeCategory } from "@/lib/getAgeCategory";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import Games from "@/models/Games";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { participants } = await req.json();

    if (!Array.isArray(participants)) {
      return NextResponse.json(
        { success: false, message: "Participants are required." },
        { status: 400 },
      );
    }

    const registration = await GroupRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
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

    if (
      game.maxParticipants !== null &&
      participants.length > game.maxParticipants
    ) {
      return NextResponse.json(
        { success: false, message: "Maximum exceeded." },
        { status: 400 },
      );
    }

    const unique = [...new Set(participants.map(String))];

    const employees = await Employee.find({
      _id: { $in: unique },
      teamId: registration.team,
    });

    if (employees.length !== unique.length) {
      return NextResponse.json(
        { success: false, message: "Invalid participants." },
        { status: 400 },
      );
    }

    if (
      (game.category === "Sports" || game.category === "Games") &&
      game.ageCategory !== "Open"
    ) {
      for (const emp of employees) {
        if (getAgeCategory(emp.dateOfBirth) !== game.ageCategory) {
          return NextResponse.json(
            { success: false, message: `${emp.employeeName} is not eligible.` },
            { status: 400 },
          );
        }
      }
    }

    const conflict = await GroupRegistration.findOne({
      _id: { $ne: registration._id },
      game: registration.game,
      team: registration.team,
      participants: { $in: unique },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, message: "Some employees are already assigned." },
        { status: 400 },
      );
    }

    registration.participants = unique;

    await registration.save();

    const updated = await GroupRegistration.findById(id)
      .populate("game", "name")
      .populate("participants", "employeeName employeeCode");

    return NextResponse.json({ success: true, registration: updated });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update group." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;

    const registration = await GroupRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
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
