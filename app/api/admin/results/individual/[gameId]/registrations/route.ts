import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Games from "@/models/Games";
import Result from "@/models/IndividualResult";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ gameId: string }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin();

    const { gameId } = await params;

    const game = await Games.findById(gameId).select("_id name type").lean();

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "Game not found.",
        },
        { status: 404 },
      );
    }

    if (game.type !== "Individual") {
      return NextResponse.json(
        {
          success: false,
          message: "Selected game is not an individual game.",
        },
        { status: 400 },
      );
    }

    const registrations = await IndividualRegistration.find({
      "games.gameId": gameId,
    })
      .select("employeeCode employeeName team")
      .lean();

    const employees = await Employee.find({
      employeeCode: {
        $in: registrations.map((registration) => registration.employeeCode),
      },
    })
      .select("_id employeeCode employeeName team teamId")
      .sort({
        employeeName: 1,
      })
      .lean();

    const participants = employees.map((employee) => ({
      employeeId: employee._id.toString(),

      employeeCode: employee.employeeCode,

      employeeName: employee.employeeName,

      team: employee.team,

      teamId: employee.teamId?.toString() ?? "",
    }));

    const existingResult = await Result.findOne({
      game: gameId,
    }).lean();

    return NextResponse.json({
      success: true,
      game,
      participants,
      result: existingResult,
    });
  } catch (error) {
    console.error("Individual result registrations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load registered employees.",
      },
      { status: 500 },
    );
  }
}
