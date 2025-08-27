import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({ 
  title: String, 
  metric: String, 
  target: Number 
}, { _id: false });

const ActivitySchema = new mongoose.Schema({ 
  name: String, 
  frequency: String, 
  duration: String 
}, { _id: false });

const TherapyPlanSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "submitted", "approved", "needs_revision"], default: "draft" },
    goals: [GoalSchema],
    activities: [ActivitySchema],
    notes: String,
    attachments: [String],
    submittedAt: Date,
    reviewedAt: Date,
    supervisorComments: String,
  },
  { timestamps: true }
);

export default mongoose.model("TherapyPlan", TherapyPlanSchema);
