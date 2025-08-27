import { Router } from "express";
import Patient from "../models/Patient.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { q, status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (status) filter.caseStatus = status;
    
    const docs = await Patient.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ updatedAt: -1 })
      .populate('assignedTherapist', 'name email')
      .populate('supervisor', 'name email');
    
    const total = await Patient.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = await Patient.create(req.body);
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Patient.findById(req.params.id)
      .populate('assignedTherapist', 'name email')
      .populate('supervisor', 'name email');
    if (!doc) return res.status(404).json({ error: "Patient not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Patient not found" });
    res.json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Patient.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
