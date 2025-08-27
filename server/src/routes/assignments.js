import { Router } from "express";
import Assignment from "../models/Assignment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.use(verifyAuth);

router.get("/", async (req, res) => {
  try {
    const { patient, therapist, method, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;
    if (therapist) filter.therapist = therapist;
    if (method) filter.method = method;
    
    const docs = await Assignment.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('patient', 'name')
      .populate('therapist', 'name email')
      .populate('supervisor', 'name email');
    
    const total = await Assignment.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/auto-assign", async (req, res) => {
  try {
    const { patientId } = req.body;
    
    // Get patient details
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    
    // Get available therapists
    const therapists = await User.find({ role: "therapist", active: true });
    
    // Simple scoring algorithm (can be enhanced)
    let bestTherapist = null;
    let bestScore = -1;
    
    for (const therapist of therapists) {
      let score = 0;
      
      // Match specialties with patient diagnoses/tags
      const matchingSpecialties = therapist.specialties?.filter(specialty => 
        patient.diagnoses?.includes(specialty) || patient.tags?.includes(specialty)
      ) || [];
      score += matchingSpecialties.length * 10;
      
      // Get current caseload (simplified)
      const caseload = await Patient.countDocuments({ assignedTherapist: therapist._id, caseStatus: "active" });
      score -= caseload * 2; // Prefer therapists with lower caseload
      
      if (score > bestScore) {
        bestScore = score;
        bestTherapist = therapist;
      }
    }
    
    if (!bestTherapist) {
      return res.status(400).json({ error: "No available therapist found" });
    }
    
    // Create assignment
    const assignment = await Assignment.create({
      patient: patientId,
      therapist: bestTherapist._id,
      method: "auto",
      rationale: `Auto-assigned based on specialty match and caseload. Score: ${bestScore}`
    });
    
    // Update patient
    await Patient.findByIdAndUpdate(patientId, { assignedTherapist: bestTherapist._id });
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/manual-assign", async (req, res) => {
  try {
    const { patientId, therapistId, rationale } = req.body;
    
    const assignment = await Assignment.create({
      patient: patientId,
      therapist: therapistId,
      method: "manual",
      rationale: rationale || "Manual assignment"
    });
    
    // Update patient
    await Patient.findByIdAndUpdate(patientId, { assignedTherapist: therapistId });
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
