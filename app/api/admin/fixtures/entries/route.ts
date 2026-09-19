import { NextRequest, NextResponse } from "next/server";
import IndividualRegistration from "@/models/IndividualRegistration";
import GroupRegistration from "@/models/GroupRegistration";
// import Employee from "@/models/Employee";
// import CompetitionTeam from "@/models/Teams";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const gameId = request.nextUrl.searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 },
      );
    }

    const game = await Games.findById(gameId).lean();

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.type === "Individual") {
      const registrations = await IndividualRegistration.find({
        "games.gameId": game._id,
      })
        .populate({
          path: "employee",
          select: "_id employeeCode employeeName",
        })
        .populate({
          path: "teamId",
          select: "_id name",
        })
        .lean();

      const entries = registrations.map((registration) => ({
        entryType: "Employee" as const,

        employee: {
          _id: registration.employee?._id?.toString(),
          employeeCode:
            registration.employee?.employeeCode ?? registration.employeeCode,
          employeeName:
            registration.employee?.employeeName ?? registration.employeeName,
        },

        team: {
          _id: registration.teamId?._id?.toString(),
          name: registration.teamId?.name ?? registration.team,
        },
      }));

      return NextResponse.json({
        gameType: "Individual",
        entries,
      });
    }

    const registrations = await GroupRegistration.find({
      game: game._id,
    })
      .populate({
        path: "team",
        select: "_id name",
      })
      .populate({
        path: "participants",
        select: "_id employeeCode employeeName",
      })
      .lean();

    const entries = registrations.map((registration) => ({
      entryType: "Group" as const,

      group: {
        _id: registration._id.toString(),
        groupName: registration.groupName,
        participantCount: registration.participants?.length ?? 0,
      },

      team: {
        _id: registration.team?._id?.toString(),
        name: registration.team?.name,
      },
    }));

    return NextResponse.json({
      gameType: "Group",
      entries,
    });
  } catch (error) {
    console.error("GET fixture entries error:", error);

    return NextResponse.json(
      { error: "Failed to load registered entries" },
      { status: 500 },
    );
  }
}
