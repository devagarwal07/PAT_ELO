import { Router } from "express";
import Session from "../models/Session.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { patient, therapist, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;
    if (therapist) filter.therapist = therapist;
    
    const docs = await Session.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 })
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    
    const total = await Session.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('patient', 'name')
      .populate('therapist', 'name email');
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
