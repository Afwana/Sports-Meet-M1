import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { getAgeCategory } from "@/lib/getAgeCategory";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
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
    const { employeeId } = await req.json();

    const registration = await IndividualRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
      );
    }

    const employee = await Employee.findById(employeeId);
    const game = await Games.findById(registration.games[0].gameId);

    if (!employee || !game) {
      return NextResponse.json(
        { success: false, message: "Invalid employee or game." },
        { status: 404 },
      );
    }

    if (String(employee.teamId) !== String(registration.teamId)) {
      return NextResponse.json(
        { success: false, message: "Employee is not in this team." },
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
        { success: false, message: "Employee already registered." },
        { status: 400 },
      );
    }

    registration.employee = employee._id;
    registration.employeeName = employee.employeeName;
    registration.employeeCode = employee.employeeCode;

    await registration.save();
    await registration.populate("employee");

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update registration." },
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

    const registration = await IndividualRegistration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 },
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
      { success: false, message: "Failed to delete registration." },
      { status: 500 },
    );
  }
}
