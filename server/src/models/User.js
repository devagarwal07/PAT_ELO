import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  weeklySlots: {
    type: Number,
    min: [0, 'Weekly slots cannot be negative'],
    max: [80, 'Weekly slots cannot exceed 80 hours']
  },
  schedule: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  timeZone: {
    type: String,
    default: 'UTC'
  }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: { 
      type: String, 
      unique: true, 
      sparse: true,
      index: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v) {
          return /^[\w\.-]+@[\w\.-]+\.\w+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: { 
      type: String, 
      enum: {
        values: ["therapist", "supervisor", "admin"],
        message: 'Role must be therapist, supervisor, or admin'
      },
      required: [true, 'Role is required']
    },
    specialties: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 15;
        },
        message: 'Cannot have more than 15 specialties'
      }
    },
    availability: {
      type: AvailabilitySchema,
      default: () => ({})
    },
    active: { 
      type: Boolean, 
      default: true 
    },
    licenseNumber: {
      type: String,
      sparse: true,
      validate: {
        validator: function(v) {
          return !v || /^[A-Z0-9]{5,20}$/.test(v);
        },
        message: 'License number must be 5-20 alphanumeric characters'
      }
    },
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
    department: String,
    hireDate: Date,
    lastLoginAt: Date,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.clerkUserId; // Don't expose in API responses
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual for full profile completeness
UserSchema.virtual('profileCompleteness').get(function() {
  let score = 0;
  const fields = ['name', 'email', 'role', 'phone', 'specialties', 'licenseNumber'];
  
  fields.forEach(field => {
    if (this[field]) {
      if (Array.isArray(this[field])) {
        score += this[field].length > 0 ? 1 : 0;
      } else {
        score += 1;
      }
    }
  });
  
  return Math.round((score / fields.length) * 100);
});

// Index for search and filtering
UserSchema.index({ name: 'text', email: 'text' });
UserSchema.index({ role: 1, active: 1 });
UserSchema.index({ specialties: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Normalize specialties
  if (this.specialties) {
    this.specialties = this.specialties
      .map(specialty => specialty.toLowerCase().trim())
      .filter(Boolean);
  }
  
  // Update lastLoginAt if this is a login operation
  if (this.isModified('lastLoginAt')) {
    this.lastLoginAt = new Date();
  }
  
  next();
});

// Static methods
UserSchema.statics.findByRole = function(role) {
  return this.find({ role, active: true });
};

UserSchema.statics.findAvailableTherapists = function() {
  return this.find({ 
    role: 'therapist', 
    active: true,
    'availability.weeklySlots': { $gt: 0 }
  });
};

// Instance methods
UserSchema.methods.getActivePatients = function() {
  const Patient = mongoose.model('Patient');
  return Patient.find({ 
    assignedTherapist: this._id, 
    caseStatus: 'active' 
  });
};

UserSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

export default mongoose.model("User", UserSchema);
