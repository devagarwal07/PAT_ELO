import React from 'react';
import { useUser } from '@clerk/clerk-react';

const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  const { user } = useUser();
  
  // TODO: Extract role from user metadata or custom claims
  // For now, we'll use a placeholder role system
  const userRole = user?.publicMetadata?.role || 'therapist';
  
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
  if (!hasAccess) {
    return fallback || (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#6c757d',
        background: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>Access Denied</h3>
        <p>You don't have permission to view this content.</p>
        <p>Required roles: {allowedRoles.join(', ')}</p>
      </div>
    );
  }
  
  return children;
};

export default RoleGuard;
