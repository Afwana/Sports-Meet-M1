/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import Games from "@/models/Games";
import { getAgeCategory } from "@/lib/getAgeCategory";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        {
          success: false,
          message: "Only captains can access employees.",
        },
        { status: 403 },
      );
    }

    const gameId = req.nextUrl.searchParams.get("gameId");
    const editRegistrationId =
      req.nextUrl.searchParams.get("editRegistrationId");

    if (!gameId) {
      return NextResponse.json(
        {
          success: false,
          message: "Game ID is required.",
        },
        { status: 400 },
      );
    }

    const game = await Games.findById(gameId).lean();

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "Game not found.",
        },
        { status: 404 },
      );
    }

    const registrationsQuery: any = {
      "games.gameId": gameId,
    };

    if (editRegistrationId) {
      registrationsQuery._id = { $ne: editRegistrationId };
    }

    const registrations = await IndividualRegistration.find(registrationsQuery)
      .select("employee")
      .lean();

    const registeredIds = registrations.map((r: any) => r.employee.toString());

    let employees = await Employee.find({
      teamId: captain.teamId,
      _id: { $nin: registeredIds },
    })
      .select("_id employeeName employeeCode gender dateOfBirth team teamId")
      .sort({ employeeName: 1 })
      .lean();

    // Apply game filters
    employees = employees.filter((emp: any) => {
      // Gender filter
      if (
        game.gender &&
        game.gender !== "Both" &&
        emp.gender?.toLowerCase() !== game.gender.toLowerCase()
      ) {
        return false;
      }

      // Age category filter
      if (
        game.category === "Sports" &&
        game.ageCategory !== "Open" &&
        getAgeCategory(emp.dateOfBirth) !== game.ageCategory
      ) {
        return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employees.",
      },
      { status: 500 },
    );
  }
}
