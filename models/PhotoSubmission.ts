import mongoose from "mongoose";

const PhotoSubmissionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    employeeCode: { type: String, required: true, uppercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, default: "", trim: true },
    phoneNumber: { type: String, default: "", trim: true },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      required: true,
      index: true,
    },
    teamName: { type: String, default: "", trim: true },

    title: { type: String, default: "", trim: true, maxlength: 80 },
    caption: { type: String, default: "", trim: true, maxlength: 300 },

    // Files live in a private Vercel Blob store; only references are kept here.
    blobPathname: { type: String, required: true },
    blobUrl: { type: String, required: true },
    thumbPathname: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    mimeType: { type: String, default: "image/jpeg" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.PhotoSubmission ||
  mongoose.model("PhotoSubmission", PhotoSubmissionSchema);
