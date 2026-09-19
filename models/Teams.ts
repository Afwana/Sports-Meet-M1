import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#2563EB",
    },
    logo: {
      type: String,
      default: "",
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
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

export default mongoose.models.CompetitionTeam ||
  mongoose.model("CompetitionTeam", TeamSchema);
