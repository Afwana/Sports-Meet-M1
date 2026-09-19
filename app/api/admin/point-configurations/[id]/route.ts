import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PointConfiguration from "@/models/PointConfiguration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
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

    const { id } = await params;

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

    const configuration = await PointConfiguration.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        type,
        positions: sortedPositions,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!configuration) {
      return NextResponse.json(
        {
          success: false,
          message: "Point configuration not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      configuration,
      message: "Point configuration updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE POINT CONFIGURATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update point configuration.",
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
    params: Promise<{ id: string }>;
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

    const { id } = await params;

    const configuration = await PointConfiguration.findByIdAndDelete(id);

    if (!configuration) {
      return NextResponse.json(
        {
          success: false,
          message: "Point configuration not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Point configuration deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE POINT CONFIGURATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete point configuration.",
      },
      { status: 500 },
    );
  }
}
