import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '../api';

const UserManagement = () => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiGet('/api/users'),
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: (userData) => apiPost('/api/users/invite', userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowInviteForm(false);
      alert('User invitation sent successfully!');
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => apiPatch(`/api/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      alert('User role updated successfully!');
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, active }) => apiPatch(`/api/users/${userId}/status`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      alert('User status updated successfully!');
    },
  });

  const handleInviteUser = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role'),
      specialties: formData.get('specialties').split(',').map(s => s.trim()).filter(s => s),
    };
    inviteUserMutation.mutate(userData);
  };

  const handleRoleChange = (userId, newRole) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      toggleStatusMutation.mutate({ userId, active: !currentStatus });
    }
  };

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowInviteForm(!showInviteForm)}
        >
          {showInviteForm ? 'Cancel' : 'Invite User'}
        </button>
      </div>

      {showInviteForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Invite New User</h3>
          <form onSubmit={handleInviteUser}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Email Address:</label>
                <input name="email" type="email" className="form-control" required />
              </div>
              <div className="form-group">
                <label>Full Name:</label>
                <input name="name" className="form-control" required />
              </div>
            </div>

            <div className="form-group">
              <label>Role:</label>
              <select name="role" className="form-control" required>
                <option value="">Select role...</option>
                <option value="therapist">Therapist</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Specialties (comma-separated):</label>
              <input 
                name="specialties" 
                className="form-control" 
                placeholder="e.g., Cognitive Therapy, EMDR, Family Therapy"
              />
            </div>

            <button type="submit" className="btn btn-success" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>System Users</h3>
        {!users?.data?.length ? (
          <p>No users found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Specialties</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="form-control"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="therapist">Therapist</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {user.specialties?.length > 0 
                      ? user.specialties.slice(0, 2).join(', ') + (user.specialties.length > 2 ? '...' : '')
                      : 'None'
                    }
                  </td>
                  <td>
                    <span className={`status-badge ${user.active ? 'status-active' : 'status-needs-revision'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={`btn ${user.active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(user._id, user.active)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(user)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>User Details: {selectedUser.name}</h3>
          <div className="grid grid-2">
            <div>
              <h4>Basic Information</h4>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.active ? 'Active' : 'Inactive'}</p>
              <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h4>Professional Details</h4>
              <p><strong>Specialties:</strong></p>
              <ul>
                {selectedUser.specialties?.length > 0 
                  ? selectedUser.specialties.map((specialty, index) => (
                      <li key={index}>{specialty}</li>
                    ))
                  : <li>No specialties listed</li>
                }
              </ul>
            </div>
          </div>

          {selectedUser.role === 'therapist' && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Performance Summary</h4>
              <div className="grid grid-3">
                <div className="card">
                  <h5>Active Cases</h5>
                  <div style={{ fontSize: '1.5rem', color: '#3498db' }}>8</div>
                </div>
                <div className="card">
                  <h5>Completed Cases</h5>
                  <div style={{ fontSize: '1.5rem', color: '#27ae60' }}>23</div>
                </div>
                <div className="card">
                  <h5>Success Rate</h5>
                  <div style={{ fontSize: '1.5rem', color: '#f39c12' }}>89%</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <h4>Recent Activity</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                Logged session with Patient #123
                <div style={{ fontSize: '0.8rem', color: '#666' }}>2 hours ago</div>
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                Submitted therapy plan for review
                <div style={{ fontSize: '0.8rem', color: '#666' }}>1 day ago</div>
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                Updated patient notes
                <div style={{ fontSize: '0.8rem', color: '#666' }}>3 days ago</div>
              </li>
            </ul>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedUser(null)}
            style={{ marginTop: '1rem' }}
          >
            Close
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Audit Log</h3>
        <p>Recent administrative actions:</p>
        <table className="table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Target</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Role Updated</td>
              <td>Admin User</td>
              <td>Dr. Sarah Johnson → Supervisor</td>
              <td>2 hours ago</td>
            </tr>
            <tr>
              <td>User Invited</td>
              <td>Admin User</td>
              <td>new.therapist@clinic.com</td>
              <td>1 day ago</td>
            </tr>
            <tr>
              <td>User Deactivated</td>
              <td>Admin User</td>
              <td>Dr. John Smith</td>
              <td>3 days ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
