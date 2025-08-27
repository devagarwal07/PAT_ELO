import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api';

const Sessions = () => {
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const queryClient = useQueryClient();

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiGet('/api/sessions'),
  });

  // Fetch patients for session logging
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiGet('/api/patients', { assigned: true }),
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => apiPost('/api/sessions', sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      setShowSessionForm(false);
      alert('Session logged successfully!');
    },
  });

  const handleLogSession = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const sessionData = {
      patient: formData.get('patient'),
      date: formData.get('date'),
      durationMin: Number(formData.get('duration')),
      activities: formData.get('activities').split(',').map(a => a.trim()),
      observations: formData.get('observations'),
      outcomes: [
        {
          metric: formData.get('outcome_metric'),
          value: Number(formData.get('outcome_value')),
        }
      ],
      nextSteps: formData.get('nextSteps'),
    };
    createSessionMutation.mutate(sessionData);
  };

  if (isLoading) return <div className="loading">Loading sessions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Session Documentation</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowSessionForm(!showSessionForm)}
        >
          {showSessionForm ? 'Cancel' : 'Log New Session'}
        </button>
      </div>

      {showSessionForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Log New Session</h3>
          <form onSubmit={handleLogSession}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Patient:</label>
                <select name="patient" className="form-control" required>
                  <option value="">Select patient...</option>
                  {patients?.data?.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input 
                  name="date" 
                  type="datetime-local" 
                  className="form-control" 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Duration (minutes):</label>
              <input name="duration" type="number" className="form-control" required />
            </div>

            <div className="form-group">
              <label>Activities (comma-separated):</label>
              <input 
                name="activities" 
                className="form-control" 
                placeholder="e.g., Cognitive exercises, Physical therapy, Discussion"
                required 
              />
            </div>

            <div className="form-group">
              <label>Observations:</label>
              <textarea name="observations" className="form-control" rows="3" required></textarea>
            </div>

            <h4>Outcomes</h4>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Metric:</label>
                <input name="outcome_metric" className="form-control" placeholder="e.g., Mood scale" required />
              </div>
              <div className="form-group">
                <label>Value:</label>
                <input name="outcome_value" type="number" step="0.1" className="form-control" required />
              </div>
            </div>

            <div className="form-group">
              <label>Next Steps:</label>
              <textarea name="nextSteps" className="form-control" rows="2" required></textarea>
            </div>

            <button type="submit" className="btn btn-success" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? 'Logging...' : 'Log Session'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Recent Sessions</h3>
        {!sessions?.data?.length ? (
          <p>No sessions found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Activities</th>
                <th>Outcomes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.map(session => (
                <tr key={session._id}>
                  <td>{session.patient?.name || 'Unknown'}</td>
                  <td>{new Date(session.date).toLocaleDateString()}</td>
                  <td>{session.durationMin} min</td>
                  <td>{session.activities?.slice(0, 2).join(', ')}...</td>
                  <td>
                    {session.outcomes?.map(outcome => 
                      `${outcome.metric}: ${outcome.value}`
                    ).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Progress Visualization</h3>
        <div className="form-group">
          <label>Select Patient for Progress Chart:</label>
          <select 
            className="form-control"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="">Choose a patient...</option>
            {patients?.data?.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
        {selectedPatient && (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '4px' }}>
            <p>Progress chart for selected patient would be displayed here</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              (Chart.js or similar library would render actual progress data)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
