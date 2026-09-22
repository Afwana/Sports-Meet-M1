import { Schema, model, models } from "mongoose";

const MarathonResultSchema = new Schema(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: "Games",
      required: true,
      unique: true,
    },

    published: {
      type: Boolean,
      default: false,
    },

    teams: [
      {
        team: {
          type: Schema.Types.ObjectId,
          ref: "CompetitionTeam",
          required: true,
        },

        teamName: String,

        participants: {
          type: Number,
          default: 0,
        },

        points: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default models.MarathonResult ||
  model("MarathonResult", MarathonResultSchema);
