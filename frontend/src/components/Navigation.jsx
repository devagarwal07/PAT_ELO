import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { user } = useUser();
  
  // Get user role from user metadata (you would typically set this during user creation)
  const userRole = user?.publicMetadata?.role || 'therapist';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['therapist', 'supervisor', 'admin'] },
    { path: '/allocation', label: 'Patient Allocation', roles: ['supervisor', 'admin'] },
    { path: '/plans', label: 'Therapy Plans', roles: ['therapist', 'supervisor', 'admin'] },
    { path: '/sessions', label: 'Sessions', roles: ['therapist', 'supervisor', 'admin'] },
    { path: '/reports', label: 'Progress Reports', roles: ['therapist', 'supervisor', 'admin'] },
    { path: '/evaluations', label: 'Evaluations', roles: ['supervisor', 'admin'] },
    { path: '/analytics', label: 'Analytics', roles: ['supervisor', 'admin'] },
    { path: '/users', label: 'User Management', roles: ['admin'] },
    { path: '/settings', label: 'Settings', roles: ['therapist', 'supervisor', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h3>Menu</h3>
        <div className="user-role">
          Role: {userRole}
        </div>
      </div>
      <ul className="nav-menu">
        {filteredMenuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
