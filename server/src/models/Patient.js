import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const cleaned = v.replace(/[\s\-\(\)]/g, '');
        return /^\d{10,15}$/.test(cleaned);
      },
      message: 'Phone number must be between 10-15 digits'
    }
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w\.-]+@[\w\.-]+\.\w+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, { _id: false });

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(v) {
          const today = new Date();
          const age = today.getFullYear() - v.getFullYear();
          return age >= 0 && age <= 120;
        },
        message: 'Invalid date of birth'
      }
    },
    contact: {
      type: ContactSchema,
      required: [true, 'Contact information is required']
    },
    diagnoses: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 10;
        },
        message: 'Cannot have more than 10 diagnoses'
      }
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 20;
        },
        message: 'Cannot have more than 20 tags'
      }
    },
    assignedTherapist: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      validate: {
        validator: async function(v) {
          if (!v) return true; // Optional field
          const User = mongoose.model('User');
          const therapist = await User.findById(v);
          return therapist && therapist.role === 'therapist' && therapist.active;
        },
        message: 'Assigned therapist must be an active therapist'
      }
    },
    supervisor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      validate: {
        validator: async function(v) {
          if (!v) return true; // Optional field
          const User = mongoose.model('User');
          const supervisor = await User.findById(v);
          return supervisor && supervisor.role === 'supervisor' && supervisor.active;
        },
        message: 'Supervisor must be an active supervisor'
      }
    },
    caseStatus: { 
      type: String, 
      enum: {
        values: ["active", "paused", "closed"],
        message: 'Status must be active, paused, or closed'
      },
      default: "active" 
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    lastSessionDate: Date,
    nextAppointment: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for patient age
PatientSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Index for search performance
PatientSchema.index({ name: 'text', 'contact.email': 'text' });
PatientSchema.index({ assignedTherapist: 1, caseStatus: 1 });
PatientSchema.index({ createdAt: -1 });

// Pre-save middleware
PatientSchema.pre('save', function(next) {
  // Normalize tags and diagnoses
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);
  }
  if (this.diagnoses) {
    this.diagnoses = this.diagnoses.map(diagnosis => diagnosis.trim()).filter(Boolean);
  }
  next();
});

export default mongoose.model("Patient", PatientSchema);
