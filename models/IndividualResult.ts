// import mongoose from "mongoose";

// const ResultSchema = new mongoose.Schema(
//   {
//     game: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Game",
//       required: true,
//     },

//     fixture: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Fixture",
//       default: null,
//     },

//     entryType: {
//       type: String,
//       enum: ["Employee", "Group"],
//       required: true,
//     },

//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       default: null,
//     },

//     group: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "GroupRegistration",
//       default: null,
//     },

//     team: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CompetitionTeam",
//       required: true,
//     },

//     position: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     outcome: {
//       type: String,
//       enum: ["Winner", "Loser"],
//       default: null,
//     },

//     points: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     remarks: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     isPublished: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true },
// );

// ResultSchema.index(
//   {
//     fixture: 1,
//     entryType: 1,
//     employee: 1,
//     group: 1,
//   },
//   {
//     unique: true,
//     sparse: true,
//   },
// );

// export default mongoose.models.Result || mongoose.model("Result", ResultSchema);

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
