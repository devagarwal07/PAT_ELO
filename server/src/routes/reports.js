import { Router } from "express";
import ProgressReport from "../models/ProgressReport.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { patient, therapist, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;
    if (therapist) filter.therapist = therapist;
    
    const docs = await ProgressReport.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ submittedAt: -1 })
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    
    const total = await ProgressReport.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const report = await ProgressReport.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const report = await ProgressReport.findById(req.params.id)
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    if (!report) return res.status(404).json({ error: "Progress report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/review", async (req, res) => {
  try {
    const { feedback } = req.body;
    const report = await ProgressReport.findByIdAndUpdate(
      req.params.id,
      { reviewedAt: new Date(), supervisorFeedback: feedback },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Progress report not found" });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
