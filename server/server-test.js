import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
}));

// Import routes after basic setup
let patientRoutes, planRoutes, sessionRoutes, reportRoutes, ratingRoutes, assignmentRoutes, userRoutes;

try {
  patientRoutes = (await import("./src/routes/patients.js")).default;
  planRoutes = (await import("./src/routes/plans.js")).default;
  sessionRoutes = (await import("./src/routes/sessions.js")).default;
  reportRoutes = (await import("./src/routes/reports.js")).default;
  ratingRoutes = (await import("./src/routes/ratings.js")).default;
  assignmentRoutes = (await import("./src/routes/assignments.js")).default;
  userRoutes = (await import("./src/routes/users.js")).default;

  // API Routes
  app.use("/api/users", userRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/plans", planRoutes);
  app.use("/api/sessions", sessionRoutes);
  app.use("/api/progress-reports", reportRoutes);
  app.use("/api/ratings", ratingRoutes);
  app.use("/api/assignments", assignmentRoutes);

  console.log("All routes loaded successfully");
} catch (error) {
  console.error("Error loading routes:", error);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: errors.join(', ')
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Error',
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Authentication token is invalid'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

app.use(errorHandler);

// Start server
const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});
