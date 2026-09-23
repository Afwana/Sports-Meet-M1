import mongoose from "mongoose";

const IndividualRegistrationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      required: true,
    },

    games: [
      {
        _id: false,

        gameId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
          required: true,
        },

        gameName: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.IndividualRegistration ||
  mongoose.model("IndividualRegistration", IndividualRegistrationSchema);
