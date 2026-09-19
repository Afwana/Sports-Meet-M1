import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import Settings from "@/models/Settings";
import Games from "@/models/Games";
import { getAgeCategory } from "@/lib/getAgeCategory";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const employee = await getCurrentEmployee();
    const settings = await Settings.findOne().lean();

    const { games } = await req.json();

    if (!settings?.registrationOpen) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration is currently closed.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(games) || games.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one game.",
        },
        { status: 400 },
      );
    }

    if (!employee._id) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee information is missing.",
        },
        { status: 400 },
      );
    }

    if (!employee.teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned to a competition team.",
        },
        { status: 400 },
      );
    }

    const existing = await IndividualRegistration.findOne({
      employee: employee._id,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already registered for this game.",
        },
        { status: 400 },
      );
    }

    if (!employee.dateOfBirth) {
      return NextResponse.json(
        {
          success: false,
          message: "Your Date of Birth is not available!.",
        },
        { status: 400 },
      );
    }

    for (const gameId of games) {
      const game = await Games.findById(gameId);

      if (!game) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected game was not found.",
          },
          { status: 404 },
        );
      }

      const totalRegistered = await IndividualRegistration.countDocuments({
        games: game._id,
      });

      if (totalRegistered >= game.maxParticipants) {
        return NextResponse.json(
          {
            success: false,
            message: `${game.name} is full.`,
          },
          { status: 400 },
        );
      }

      const teamRegistered = await IndividualRegistration.countDocuments({
        games: game._id,
        teamId: employee.teamId,
      });

      if (teamRegistered >= game.maxParticipantsPerTeam) {
        return NextResponse.json(
          {
            success: false,
            message: `${employee.team} has reached the maximum participants for ${game.name}.`,
          },
          { status: 400 },
        );
      }

      if (game.category === "Sports" && game.ageCategory !== "Open") {
        const employeeCategory = getAgeCategory(employee.dateOfBirth);

        if (employeeCategory !== game.ageCategory) {
          return NextResponse.json(
            {
              success: false,
              message: `You are eligible only for ${employeeCategory} Sports events.`,
            },
            { status: 400 },
          );
        }
      }
    }

    const registration = await IndividualRegistration.create({
      employee: employee._id,
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      teamId: employee.teamId,
      team: employee.team,
      games,
    });

    return NextResponse.json(
      {
        success: true,
        registration,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Individual registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit individual registration.",
      },
      { status: 500 },
    );
  }
}
