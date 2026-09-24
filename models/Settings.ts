import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    programName: {
      type: String,
      default: "Recreation Meet 2026",
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    registrationOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
