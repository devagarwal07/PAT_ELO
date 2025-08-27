import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    method: { type: String, enum: ["auto", "manual"], required: true },
    rationale: String,
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", AssignmentSchema);
