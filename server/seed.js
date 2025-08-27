import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Patient from "./src/models/Patient.js";
import Assignment from "./src/models/Assignment.js";
import TherapyPlan from "./src/models/TherapyPlan.js";
import Session from "./src/models/Session.js";
import ProgressReport from "./src/models/ProgressReport.js";
import ClinicalRating from "./src/models/ClinicalRating.js";

dotenv.config();

const sampleUsers = [
  {
    clerkUserId: "user_therapist1",
    email: "sarah.johnson@therapycenter.com",
    name: "Dr. Sarah Johnson",
    role: "therapist",
    specialties: ["anxiety", "depression", "ptsd", "cognitive-behavioral-therapy"],
    availability: { 
      weeklySlots: 40,
      schedule: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "15:00" }
      }
    },
    phone: "5550101",
    licenseNumber: "LIC123456",
    department: "Mental Health",
    hireDate: new Date("2020-03-15"),
    active: true
  },
  {
    clerkUserId: "user_therapist2",
    email: "michael.chen@therapycenter.com",
    name: "Dr. Michael Chen",
    role: "therapist",
    specialties: ["autism", "adhd", "behavioral-therapy", "family-therapy"],
    availability: { 
      weeklySlots: 35,
      schedule: {
        monday: { start: "08:00", end: "16:00" },
        tuesday: { start: "08:00", end: "16:00" },
        wednesday: { start: "08:00", end: "16:00" },
        thursday: { start: "08:00", end: "16:00" },
        friday: { start: "08:00", end: "12:00" }
      }
    },
    phone: "5550102",
    licenseNumber: "LIC789012",
    department: "Pediatric Psychology",
    hireDate: new Date("2019-07-22"),
    active: true
  },
  {
    clerkUserId: "user_therapist3",
    email: "lisa.martinez@therapycenter.com",
    name: "Dr. Lisa Martinez",
    role: "therapist",
    specialties: ["trauma", "ptsd", "emdr", "grief-counseling"],
    availability: { 
      weeklySlots: 38,
      schedule: {
        tuesday: { start: "10:00", end: "18:00" },
        wednesday: { start: "10:00", end: "18:00" },
        thursday: { start: "10:00", end: "18:00" },
        friday: { start: "10:00", end: "18:00" },
        saturday: { start: "09:00", end: "13:00" }
      }
    },
    phone: "5550103",
    licenseNumber: "LIC345678",
    department: "Trauma Services",
    hireDate: new Date("2021-01-10"),
    active: true
  },
  {
    clerkUserId: "user_supervisor1",
    email: "emily.rodriguez@therapycenter.com",
    name: "Dr. Emily Rodriguez",
    role: "supervisor",
    specialties: ["clinical-supervision", "trauma-therapy", "program-development"],
    availability: { 
      weeklySlots: 30,
      schedule: {
        monday: { start: "08:00", end: "17:00" },
        tuesday: { start: "08:00", end: "17:00" },
        wednesday: { start: "08:00", end: "17:00" },
        thursday: { start: "08:00", end: "17:00" },
        friday: { start: "08:00", end: "16:00" }
      }
    },
    phone: "5550104",
    licenseNumber: "SUP123456",
    department: "Clinical Supervision",
    hireDate: new Date("2018-06-01"),
    active: true
  },
  {
    clerkUserId: "user_admin1",
    email: "admin@therapycenter.com",
    name: "James Wilson",
    role: "admin",
    specialties: ["system-administration", "data-management"],
    availability: { weeklySlots: 40 },
    phone: "5550105",
    department: "Administration",
    hireDate: new Date("2017-09-15"),
    active: true
  }
];

const samplePatients = [
  {
    name: "John Smith",
    dob: new Date("1985-03-15"),
    contact: { 
      phone: "5551001", 
      email: "john.smith@email.com",
      address: "123 Main St, Anytown, ST 12345",
      emergencyContact: {
        name: "Jane Smith",
        phone: "5551002",
        relationship: "Spouse"
      }
    },
    diagnoses: ["generalized-anxiety-disorder", "major-depressive-disorder"],
    tags: ["high-priority", "anxiety", "new-patient"],
    caseStatus: "active",
    priority: "high",
    notes: "Patient referred by primary care physician for anxiety and depression treatment."
  },
  {
    name: "Maria Garcia",
    dob: new Date("1992-07-22"),
    contact: { 
      phone: "5551003", 
      email: "maria.garcia@email.com",
      address: "456 Oak Ave, Somewhere, ST 67890",
      emergencyContact: {
        name: "Carlos Garcia",
        phone: "5551004",
        relationship: "Brother"
      }
    },
    diagnoses: ["ptsd", "panic-disorder"],
    tags: ["trauma", "ptsd", "active-duty"],
    caseStatus: "active",
    priority: "urgent",
    notes: "Military veteran seeking treatment for combat-related PTSD."
  },
  {
    name: "David Wilson",
    dob: new Date("2010-11-08"),
    contact: { 
      phone: "5551005", 
      email: "parent.wilson@email.com",
      address: "789 Pine St, Elsewhere, ST 13579",
      emergencyContact: {
        name: "Sarah Wilson",
        phone: "5551006",
        relationship: "Mother"
      }
    },
    diagnoses: ["autism-spectrum-disorder", "adhd"],
    tags: ["child", "autism", "behavioral-support"],
    caseStatus: "active",
    priority: "medium",
    notes: "13-year-old patient requiring behavioral therapy and social skills training."
  },
  {
    name: "Emily Thompson",
    dob: new Date("1978-12-03"),
    contact: { 
      phone: "5551007", 
      email: "emily.thompson@email.com",
      address: "321 Elm Dr, Newtown, ST 24680"
    },
    diagnoses: ["bipolar-disorder", "anxiety"],
    tags: ["mood-disorder", "medication-management"],
    caseStatus: "active",
    priority: "medium",
    notes: "Patient with bipolar disorder seeking therapy to complement medication treatment."
  },
  {
    name: "Robert Johnson",
    dob: new Date("1965-05-18"),
    contact: { 
      phone: "5551009", 
      email: "robert.johnson@email.com",
      address: "654 Maple Ln, Oldtown, ST 97531"
    },
    diagnoses: ["grief", "adjustment-disorder"],
    tags: ["grief-counseling", "recent-loss"],
    caseStatus: "active",
    priority: "medium",
    notes: "Recently lost spouse, seeking grief counseling and support."
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Assignment.deleteMany({});
    await TherapyPlan.deleteMany({});
    await Session.deleteMany({});
    await ProgressReport.deleteMany({});
    await ClinicalRating.deleteMany({});
    console.log("Existing data cleared");

    // Create users
    console.log("Creating users...");
    const users = await User.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create patients
    console.log("Creating patients...");
    const patients = await Patient.insertMany(samplePatients);
    console.log(`Created ${patients.length} patients`);

    // Find therapists and supervisor
    const therapists = users.filter(u => u.role === "therapist");
    const supervisor = users.find(u => u.role === "supervisor");

    // Create assignments and update patients
    console.log("Creating assignments...");
    const assignments = [];
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const therapist = therapists[i % therapists.length];
      
      const assignment = await Assignment.create({
        patient: patient._id,
        therapist: therapist._id,
        supervisor: supervisor._id,
        method: i % 2 === 0 ? "auto" : "manual",
        rationale: i % 2 === 0 
          ? `Auto-assigned based on specialty match. Therapist specializes in ${therapist.specialties.join(', ')}`
          : `Manual assignment by supervisor for optimal patient-therapist match`
      });
      
      assignments.push(assignment);

      // Update patient with assigned therapist and supervisor
      await Patient.findByIdAndUpdate(patient._id, {
        assignedTherapist: therapist._id,
        supervisor: supervisor._id
      });
    }
    
    console.log(`Created ${assignments.length} assignments`);

    // Create sample therapy plans
    console.log("Creating therapy plans...");
    const therapyPlans = [];
    
    for (let i = 0; i < Math.min(3, patients.length); i++) {
      const patient = patients[i];
      const therapist = therapists.find(t => t._id.equals(patient.assignedTherapist));
      
      const plan = await TherapyPlan.create({
        patient: patient._id,
        therapist: therapist._id,
        status: ["draft", "submitted", "approved"][i % 3],
        goals: [
          {
            title: "Reduce anxiety symptoms",
            metric: "anxiety-scale",
            target: 3
          },
          {
            title: "Improve coping strategies",
            metric: "coping-skills-assessment",
            target: 7
          }
        ],
        activities: [
          {
            name: "Deep breathing exercises",
            frequency: "daily",
            duration: "10 minutes"
          },
          {
            name: "Cognitive restructuring",
            frequency: "weekly",
            duration: "50 minutes"
          }
        ],
        notes: "Initial therapy plan focusing on anxiety reduction and coping skill development.",
        submittedAt: i > 0 ? new Date() : undefined,
        reviewedAt: i === 2 ? new Date() : undefined,
        supervisorComments: i === 2 ? "Plan approved. Good focus on evidence-based interventions." : undefined
      });
      
      therapyPlans.push(plan);
    }
    
    console.log(`Created ${therapyPlans.length} therapy plans`);

    // Create sample sessions
    console.log("Creating sessions...");
    const sessions = [];
    
    for (let i = 0; i < Math.min(10, patients.length * 2); i++) {
      const patient = patients[i % patients.length];
      const therapist = therapists.find(t => t._id.equals(patient.assignedTherapist));
      
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - (i * 7)); // Weekly sessions going back
      
      const session = await Session.create({
        patient: patient._id,
        therapist: therapist._id,
        date: sessionDate,
        durationMin: 50,
        activities: ["Initial assessment", "Cognitive behavioral therapy", "Homework assignment"],
        observations: `Session ${i + 1}: Patient showing good engagement and progress in therapy goals.`,
        outcomes: [
          { metric: "mood-rating", value: Math.floor(Math.random() * 5) + 5 },
          { metric: "anxiety-level", value: Math.floor(Math.random() * 4) + 2 }
        ],
        nextSteps: "Continue with current treatment plan, practice coping strategies at home."
      });
      
      sessions.push(session);
    }
    
    console.log(`Created ${sessions.length} sessions`);

    // Create sample clinical ratings
    console.log("Creating clinical ratings...");
    const ratings = [];
    
    for (const therapist of therapists) {
      const rating = await ClinicalRating.create({
        therapist: therapist._id,
        supervisor: supervisor._id,
        period: "Q1-2024",
        scores: {
          clinicalSkills: Math.floor(Math.random() * 3) + 8, // 8-10
          documentation: Math.floor(Math.random() * 3) + 7, // 7-9
          patientEngagement: Math.floor(Math.random() * 3) + 8, // 8-10
          professionalDevelopment: Math.floor(Math.random() * 3) + 7, // 7-9
          overallPerformance: Math.floor(Math.random() * 3) + 8 // 8-10
        },
        comments: `${therapist.name} demonstrates strong clinical skills and maintains excellent rapport with patients. Continues to show professional growth and dedication to evidence-based practice.`
      });
      
      ratings.push(rating);
    }
    
    console.log(`Created ${ratings.length} clinical ratings`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`- ${users.length} users created`);
    console.log(`- ${patients.length} patients created`);
    console.log(`- ${assignments.length} assignments created`);
    console.log(`- ${therapyPlans.length} therapy plans created`);
    console.log(`- ${sessions.length} sessions created`);
    console.log(`- ${ratings.length} clinical ratings created`);
    
    console.log("\n👥 Sample Users:");
    users.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user.email}`);
    });
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seedDatabase();
