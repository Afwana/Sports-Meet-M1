/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
import PointConfiguration from "@/models/PointConfiguration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Games from "@/models/Games";
import Result from "@/models/IndividualResult";

export async function PUT(
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

    const body = await req.json();

    const {
      positions,
    }: {
      positions: {
        position: number;
        employeeId: string;
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

    if (game.type !== "Individual") {
      return NextResponse.json(
        {
          success: false,
          message: "Selected game is not an individual game.",
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
      type: "Individual",
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
          message: "Point configuration has not been created.",
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

    for (const resultPosition of positions) {
      if (!positionMap.has(resultPosition.position)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid position: ${resultPosition.position}.`,
          },
          { status: 400 },
        );
      }
    }

    const employeeIds = positions.map((item) => item.employeeId);

    if (new Set(employeeIds).size !== employeeIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "An employee cannot occupy more than one position.",
        },
        { status: 400 },
      );
    }

    const resultPositions = positions.map((item) => item.position);

    if (new Set(resultPositions).size !== resultPositions.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Each position can only be assigned once.",
        },
        { status: 400 },
      );
    }

    const employees = await Employee.find({
      _id: {
        $in: employeeIds,
      },
    })
      .select("_id employeeCode employeeName teamId team")
      .lean();

    if (employees.length !== employeeIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more employees were not found.",
        },
        { status: 400 },
      );
    }

    const registered = await IndividualRegistration.find({
      employeeCode: {
        $in: employees.map((employee) => employee.employeeCode),
      },

      "games.gameId": gameId,
    }).lean();

    const registeredCodes = new Set(
      registered.map((registration) => registration.employeeCode),
    );

    const invalidEmployee = employees.find(
      (employee) => !registeredCodes.has(employee.employeeCode),
    );

    if (invalidEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: `${invalidEmployee.employeeName} is not registered for this game.`,
        },
        { status: 400 },
      );
    }

    const resultPositionData = employees
      .map((employee) => {
        const selected = positions.find(
          (item) => item.employeeId === employee._id.toString(),
        );

        if (!selected) {
          return null;
        }

        return {
          position: selected.position,

          employee: employee._id,

          team: employee.teamId,

          points: positionMap.get(selected.position) ?? 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const result = await Result.findOneAndUpdate(
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
      message: "Individual result saved successfully.",
    });
  } catch (error) {
    console.error("Individual result save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save individual result.",
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
    await connectDB();

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

    if (game.type !== "Individual") {
      return NextResponse.json(
        {
          success: false,
          message: "Selected game is not an individual game.",
        },
        { status: 400 },
      );
    }

    const deletedResult = await Result.findOneAndDelete({
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
      message: "Individual result deleted successfully.",
    });
  } catch (error) {
    console.error("Individual result delete error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete individual result.",
      },
      { status: 500 },
    );
  }
}
