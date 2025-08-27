import mongoose from "mongoose";

const ProgressReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionCount: Number,
    metricsSummary: [{ metric: String, trend: String, value: Number }],
    narrative: String,
    recommendation: String,
    submittedAt: Date,
    reviewedAt: Date,
    supervisorFeedback: String,
  },
  { timestamps: true }
);

export default mongoose.model("ProgressReport", ProgressReportSchema);
