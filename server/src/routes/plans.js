import { Router } from "express";
import TherapyPlan from "../models/TherapyPlan.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { patient, therapist, status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;
    if (therapist) filter.therapist = therapist;
    if (status) filter.status = status;
    
    const docs = await TherapyPlan.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ updatedAt: -1 })
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    
    const total = await TherapyPlan.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const plan = await TherapyPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id)
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    if (!plan) return res.status(404).json({ error: "Therapy plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const plan = await TherapyPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: "Therapy plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/submit", async (req, res) => {
  try {
    const plan = await TherapyPlan.findByIdAndUpdate(
      req.params.id,
      { status: "submitted", submittedAt: new Date() },
      { new: true }
    );
    if (!plan) return res.status(404).json({ error: "Therapy plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/review", async (req, res) => {
  try {
    const { decision, comments } = req.body; // decision: 'approved' | 'needs_revision'
    const plan = await TherapyPlan.findByIdAndUpdate(
      req.params.id,
      { status: decision, reviewedAt: new Date(), supervisorComments: comments },
      { new: true }
    );
    if (!plan) return res.status(404).json({ error: "Therapy plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
