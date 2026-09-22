import mongoose from "mongoose";

const ResultPositionSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
      min: 1,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
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

const IndividualResultSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
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

export default mongoose.models.IndividualResult ||
  mongoose.model("IndividualResult", IndividualResultSchema);
