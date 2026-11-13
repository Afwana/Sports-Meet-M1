import mongoose from "mongoose";

/**
 * Program (event) photos uploaded by the admin and shown to everyone who is
 * logged in. This is separate from PhotoSubmission, which holds the
 * Photography-contest entries uploaded by employees.
 *
 * The image bytes live in MongoDB (a resized full copy + a small thumbnail),
 * so the gallery works on any host without extra storage configuration.
 * `data` and `thumb` are `select: false`, so normal queries only return the
 * light metadata - ask for them explicitly with .select("+data") / "+thumb".
 */
const GalleryPhotoSchema = new mongoose.Schema(
  {
    caption: { type: String, default: "", trim: true, maxlength: 150 },

    data: { type: Buffer, required: true, select: false },
    thumb: { type: Buffer, required: true, select: false },

    mimeType: { type: String, default: "image/jpeg" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

GalleryPhotoSchema.index({ createdAt: -1 });

export default mongoose.models.GalleryPhoto ||
  mongoose.model("GalleryPhoto", GalleryPhotoSchema);
