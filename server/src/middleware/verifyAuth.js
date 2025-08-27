export function verifyAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      error: "Unauthorized", 
      message: "No authentication token provided" 
    });
  }

  try {
    // TODO: Verify token signature and extract user/role (Clerk verification to be added later).
    // For now, pass through a placeholder user (DO NOT use in production).
    // In production, you would:
    // 1. Verify the JWT token using Clerk's public key
    // 2. Extract user information from the token
    // 3. Optionally fetch additional user data from your database
    
    req.auth = { 
      userId: "placeholder", 
      role: "therapist",
      clerkUserId: "user_placeholder"
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: "Unauthorized", 
      message: "Invalid authentication token" 
    });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Authentication required" 
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: errors
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid'
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
}
