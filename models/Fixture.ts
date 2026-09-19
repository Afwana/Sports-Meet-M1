import mongoose from "mongoose";

const FixtureEntrySchema = new mongoose.Schema(
  {
    entryType: {
      type: String,
      enum: ["Employee", "Group"],
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupRegistration",
      default: null,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      required: true,
    },

    lane: {
      type: Number,
      default: null,
    },

    seed: {
      type: Number,
      default: null,
    },
  },
  {
    _id: true,
  },
);

const FixtureSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },

    roundNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    roundName: {
      type: String,
      required: true,
      trim: true,
    },

    fixtureName: {
      type: String,
      required: true,
      trim: true,
    },

    fixtureNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    venue: {
      type: String,
      default: "",
      trim: true,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    entries: {
      type: [FixtureEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

FixtureSchema.index(
  {
    game: 1,
    roundNumber: 1,
    fixtureNumber: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.models.Fixture ||
  mongoose.model("Fixture", FixtureSchema);
