import { Router } from "express";
import ClinicalRating from "../models/ClinicalRating.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { therapist, supervisor, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (therapist) filter.therapist = therapist;
    if (supervisor) filter.supervisor = supervisor;
    
    const docs = await ClinicalRating.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('therapist', 'name email')
      .populate('supervisor', 'name email');
    
    const total = await ClinicalRating.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const rating = await ClinicalRating.create(req.body);
    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rating = await ClinicalRating.findById(req.params.id)
      .populate('therapist', 'name email')
      .populate('supervisor', 'name email');
    if (!rating) return res.status(404).json({ error: "Clinical rating not found" });
    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
