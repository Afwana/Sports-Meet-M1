/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import GroupRegistration from "@/models/GroupRegistration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ gameId: string }>;
  },
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const { gameId } = await params;

    const game = await Games.findById(gameId)
      .select("_id name type isActive")
      .lean();

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "Game not found.",
        },
        { status: 404 },
      );
    }

    if (game.type !== "Group") {
      return NextResponse.json(
        {
          success: false,
          message: "Selected game is not a group game.",
        },
        { status: 400 },
      );
    }

    const groups = await GroupRegistration.find({
      game: gameId,
    })
      .populate({
        path: "team",
        select: "_id name",
      })
      .populate({
        path: "participants",
        select: "_id employeeName employeeCode",
      })
      .sort({
        groupName: 1,
      })
      .lean();

    const formattedGroups = groups.map((group) => {
      const team = group.team as unknown as {
        _id?: unknown;
        name?: string;
      };

      return {
        groupId: String(group._id),
        groupName: group.groupName,
        teamId: team?._id ? String(team._id) : "",
        teamName: team?.name ?? "",
        participantCount: group.participants?.length ?? 0,
      };
    });

    const GroupResult = (await import("@/models/GroupResult")).default;

    const existingResult = await GroupResult.findOne({
      game: gameId,
    }).lean();

    return NextResponse.json({
      success: true,
      groups: formattedGroups,
      result: existingResult
        ? {
            _id: String(existingResult._id),
            game: String(existingResult.game),
            positions: existingResult.positions.map((position: any) => ({
              position: position.position,
              group: String(position.group),
              groupName: position.groupName,
              team: String(position.team),
              points: position.points,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error("GET GROUP RESULT PARTICIPANTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load groups.",
      },
      { status: 500 },
    );
  }
}
