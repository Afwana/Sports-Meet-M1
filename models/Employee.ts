import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["Employee", "Captain"],
      default: "Employee",
    },

    team: {
      type: String,
      default: "",
      trim: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompetitionTeam",
      default: null,
    },

    isCaptain: {
      type: Boolean,
      default: false,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;
