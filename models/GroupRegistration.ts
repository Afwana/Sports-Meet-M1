import mongoose from "mongoose";

const GroupRegistrationSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      required: true,
    },

    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

GroupRegistrationSchema.index(
  { game: 1, team: 1, groupName: 1 },
  { unique: true },
);

export default mongoose.models.GroupRegistration ||
  mongoose.model("GroupRegistration", GroupRegistrationSchema);
