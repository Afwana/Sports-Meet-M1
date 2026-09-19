/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import GroupRegistration from "@/models/GroupRegistration";
import GroupResult from "@/models/GroupResult";
import PointConfiguration from "@/models/PointConfiguration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function PUT(
  req: NextRequest,
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

    const body = await req.json();

    const {
      positions,
    }: {
      positions: {
        position: number;
        groupId: string;
      }[];
    } = body;

    const game = await Games.findById(gameId);

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

    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one result position is required.",
        },
        { status: 400 },
      );
    }

    const pointConfiguration = await PointConfiguration.findOne({
      type: "Group",
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!pointConfiguration) {
      return NextResponse.json(
        {
          success: false,
          message: "Group point configuration has not been created.",
        },
        { status: 400 },
      );
    }

    const positionMap = new Map(
      pointConfiguration.positions.map((item: any) => [
        item.position,
        item.points,
      ]),
    );

    for (const item of positions) {
      if (!positionMap.has(item.position)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid position: ${item.position}.`,
          },
          { status: 400 },
        );
      }
    }

    const positionNumbers = positions.map((item) => item.position);

    if (new Set(positionNumbers).size !== positionNumbers.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Each position can only be assigned once.",
        },
        { status: 400 },
      );
    }

    const groupIds = positions.map((item) => item.groupId);

    if (new Set(groupIds).size !== groupIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "A group cannot occupy more than one position.",
        },
        { status: 400 },
      );
    }

    const groups = await GroupRegistration.find({
      _id: {
        $in: groupIds,
      },
      game: gameId,
    })
      .populate({
        path: "team",
        select: "_id name",
      })
      .lean();

    if (groups.length !== groupIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more selected groups were not found for this game.",
        },
        { status: 400 },
      );
    }

    const resultPositionData = positions.map((item) => {
      const group = groups.find((group) => String(group._id) === item.groupId)!;

      return {
        position: item.position,

        group: group._id,

        groupName: group.groupName,

        team: group.team,

        points: positionMap.get(item.position) ?? 0,
      };
    });

    const result = await GroupResult.findOneAndUpdate(
      {
        game: game._id,
      },
      {
        game: game._id,
        positions: resultPositionData,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      result,
      message: "Group result saved successfully.",
    });
  } catch (error) {
    console.error("GROUP RESULT SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save group result.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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

    const game = await Games.findById(gameId);

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

    const deletedResult = await GroupResult.findOneAndDelete({
      game: game._id,
    });

    if (!deletedResult) {
      return NextResponse.json(
        {
          success: false,
          message: "No result exists for this game.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Group result deleted successfully.",
    });
  } catch (error) {
    console.error("GROUP RESULT DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete group result.",
      },
      { status: 500 },
    );
  }
}
