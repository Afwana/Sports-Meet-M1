import mongoose from "mongoose";

const PointRuleSchema = new mongoose.Schema({
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
});

const GameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Sports", "Off Stage", "Stage", "Games"],
      required: true,
    },

    type: {
      type: String,
      enum: ["Individual", "Group"],
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Both"],
      required: true,
    },

    ageCategory: {
      type: String,
      enum: ["Open", "Junior", "Senior"],
      default: "Open",
    },

    icon: {
      type: String,
      required: true,
      default: "FaCircle",
    },

    minParticipants: {
      type: Number,
      default: 1,
      min: 1,
    },

    maxParticipants: {
      type: Number,
      default: null,
    },

    maxParticipantsPerTeam: {
      type: Number,
      default: null,
    },

    maxTeamsPerCompetitionTeam: {
      type: Number,
      default: 1,
      min: 1,
    },

    pointRules: {
      type: [PointRuleSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

GameSchema.index(
  {
    name: 1,
    category: 1,
    type: 1,
    gender: 1,
    ageCategory: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
