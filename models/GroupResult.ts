import mongoose from "mongoose";

const ResultPositionSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 1,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupRegistration",
      required: true,
    },

    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      required: true,
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

const GroupResultSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Games",
      required: true,
      unique: true,
    },

    positions: {
      type: [ResultPositionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.GroupResult ||
  mongoose.model("GroupResult", GroupResultSchema);
