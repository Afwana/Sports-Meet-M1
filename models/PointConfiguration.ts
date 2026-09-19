import mongoose from "mongoose";

const PositionPointSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 1,
    },

    points: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const PointConfigurationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Individual", "Group"],
      required: true,
      default: "Individual",
    },

    positions: {
      type: [PositionPointSchema],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.PointConfiguration ||
  mongoose.model("PointConfiguration", PointConfigurationSchema);
