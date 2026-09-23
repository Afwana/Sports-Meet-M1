import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
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

    const { employeeId } = await req.json();

    const registration = await IndividualRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration not found.",
        },
        { status: 404 },
      );
    }

    if (registration.teamId.toString() !== captain.teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 403 },
      );
    }

    const employee = await Employee.findById(employeeId);
    const game = await Games.findById(registration.games[0].gameId);

    if (!employee || !game) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employee or game.",
        },
        { status: 404 },
      );
    }

    if (employee.teamId.toString() !== captain.teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee is not in your team.",
        },
        { status: 400 },
      );
    }

    if (
      (game.category === "Sports" || game.category === "Games") &&
      game.ageCategory !== "Open"
    ) {
      if (getAgeCategory(employee.dateOfBirth) !== game.ageCategory) {
        return NextResponse.json(
          {
            success: false,
            message: `${employee.employeeName} is not eligible.`,
          },
          { status: 400 },
        );
      }
    }

    const alreadyExists = await IndividualRegistration.findOne({
      _id: { $ne: id },
      employee: employee._id,
      "games.gameId": game._id,
    });

    if (alreadyExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee already registered.",
        },
        { status: 400 },
      );
    }

    registration.employee = employee._id;
    registration.employeeName = employee.employeeName;
    registration.employeeCode = employee.employeeCode;

    await registration.save();
    await registration.populate("employee");

    return NextResponse.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update registration.",
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

    const captain = await getCurrentEmployee();
    const { id } = await params;

    const registration = await IndividualRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration not found.",
        },
        { status: 404 },
      );
    }

    if (registration.teamId.toString() !== captain.teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 403 },
      );
    }

    await IndividualRegistration.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete registration.",
      },
      { status: 500 },
    );
  }
}
