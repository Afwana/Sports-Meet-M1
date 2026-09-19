import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PointConfiguration from "@/models/PointConfiguration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function GET() {
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

    const configurations = await PointConfiguration.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      configurations,
    });
  } catch (error) {
    console.error("GET POINT CONFIGURATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load point configurations.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const { name, type, positions, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Configuration name is required.",
        },
        { status: 400 },
      );
    }

    if (type !== "Individual" && type !== "Group") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid configuration type.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one position is required.",
        },
        { status: 400 },
      );
    }

    for (const item of positions) {
      if (!Number.isInteger(item.position) || item.position < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Position must be a positive whole number.",
          },
          { status: 400 },
        );
      }

      if (typeof item.points !== "number" || item.points < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Points must be 0 or greater.",
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
          message: "Each position can only be added once.",
        },
        { status: 400 },
      );
    }

    const sortedPositions = [...positions].sort(
      (a, b) => a.position - b.position,
    );

    const configuration = await PointConfiguration.create({
      name: name.trim(),
      type,
      positions: sortedPositions,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        configuration,
        message: "Point configuration created successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE POINT CONFIGURATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create point configuration.",
      },
      { status: 500 },
    );
  }
}
