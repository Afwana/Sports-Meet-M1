/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

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

    const query: any = {
      teamId: captain.teamId,
    };

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

    query._id = { $nin: registeredIds };

    const employees = await Employee.find(query)
      .select("_id employeeName employeeCode team teamId")
      .sort({ employeeName: 1 })
      .lean();

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
