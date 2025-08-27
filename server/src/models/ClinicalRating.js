import mongoose from "mongoose";

const ClinicalRatingSchema = new mongoose.Schema(
  {
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: String,
    scores: Object,
    comments: String,
  },
  { timestamps: true }
);

export default mongoose.model("ClinicalRating", ClinicalRatingSchema);
