import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api';

const PatientAllocation = () => {
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const queryClient = useQueryClient();

  // Fetch unassigned patients
  const { data: unassignedPatients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients', 'unassigned'],
    queryFn: () => apiGet('/api/patients', { assigned: false }),
  });

  // Fetch available therapists
  const { data: therapists, isLoading: loadingTherapists } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => apiGet('/api/users', { role: 'therapist', active: true }),
  });

  // Auto-assign mutation
  const autoAssignMutation = useMutation({
    mutationFn: (patientId) => apiPost('/api/assignments/auto-assign', { patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['assignments']);
      setShowAutoAssign(false);
      alert('Patient successfully auto-assigned!');
    },
    onError: (error) => {
      alert(`Auto-assignment failed: ${error.message}`);
    },
  });

  // Manual assign mutation
  const manualAssignMutation = useMutation({
    mutationFn: ({ patientId, therapistId, rationale }) => 
      apiPost('/api/assignments/manual-assign', { patientId, therapistId, rationale }),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['assignments']);
      alert('Patient successfully assigned!');
    },
    onError: (error) => {
      alert(`Assignment failed: ${error.message}`);
    },
  });

  const handleAutoAssign = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    autoAssignMutation.mutate(selectedPatient);
  };

  const handleManualAssign = (patientId, therapistId) => {
    const rationale = prompt('Please provide a rationale for this manual assignment:');
    if (rationale) {
      manualAssignMutation.mutate({ patientId, therapistId, rationale });
    }
  };

  if (loadingPatients || loadingTherapists) {
    return <div className="loading">Loading allocation data...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Patient Allocation</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAutoAssign(!showAutoAssign)}
        >
          {showAutoAssign ? 'Hide Auto-Assign' : 'Auto-Assign Wizard'}
        </button>
      </div>

      {showAutoAssign && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Auto-Assignment Wizard</h3>
          <div className="form-group">
            <label>Select Patient for Auto-Assignment:</label>
            <select 
              className="form-control"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">Choose a patient...</option>
              {unassignedPatients?.data?.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.diagnoses?.join(', ')}
                </option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-success"
            onClick={handleAutoAssign}
            disabled={!selectedPatient || autoAssignMutation.isPending}
          >
            {autoAssignMutation.isPending ? 'Assigning...' : 'Auto-Assign'}
          </button>
        </div>
      )}

      <div className="card">
        <h3>Unassigned Patients</h3>
        {!unassignedPatients?.data?.length ? (
          <p>No unassigned patients found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Diagnoses</th>
                <th>Tags</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unassignedPatients.data.map(patient => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.diagnoses?.join(', ') || 'None'}</td>
                  <td>{patient.tags?.join(', ') || 'None'}</td>
                  <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          handleManualAssign(patient._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="form-control"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="">Assign to...</option>
                      {therapists?.data?.map(therapist => (
                        <option key={therapist._id} value={therapist._id}>
                          {therapist.name} ({therapist.specialties?.join(', ')})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Available Therapists</h3>
        <div className="grid grid-3">
          {therapists?.data?.map(therapist => (
            <div key={therapist._id} className="card">
              <h4>{therapist.name}</h4>
              <p><strong>Specialties:</strong> {therapist.specialties?.join(', ') || 'None'}</p>
              <p><strong>Current Caseload:</strong> {therapist.caseload || 0} patients</p>
              <div className={`status-badge ${therapist.availability ? 'status-active' : 'status-draft'}`}>
                {therapist.availability ? 'Available' : 'Busy'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientAllocation;
