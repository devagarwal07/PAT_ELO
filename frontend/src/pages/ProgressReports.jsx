import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { apiGet, apiPost } from '../api';

const ProgressReports = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role || 'therapist';
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  // Fetch progress reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['progress-reports'],
    queryFn: () => apiGet('/api/progress-reports'),
  });

  // Fetch patients with 10+ sessions for report eligibility
  const { data: eligiblePatients } = useQuery({
    queryKey: ['patients', 'eligible-reports'],
    queryFn: () => apiGet('/api/patients', { sessionCount: 10 }),
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: (reportData) => apiPost('/api/progress-reports', reportData),
    onSuccess: () => {
      queryClient.invalidateQueries(['progress-reports']);
      setShowReportForm(false);
      alert('Progress report submitted successfully!');
    },
  });

  // Review report mutation
  const reviewReportMutation = useMutation({
    mutationFn: ({ reportId, feedback }) => 
      apiPost(`/api/progress-reports/${reportId}/review`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['progress-reports']);
      setSelectedReport(null);
      setFeedback('');
      alert('Report review completed!');
    },
  });

  const handleSubmitReport = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reportData = {
      patient: formData.get('patient'),
      sessionCount: Number(formData.get('sessionCount')),
      metricsSummary: [
        {
          metric: formData.get('metric1_name'),
          trend: formData.get('metric1_trend'),
          value: Number(formData.get('metric1_value')),
        }
      ],
      narrative: formData.get('narrative'),
      recommendation: formData.get('recommendation'),
    };
    submitReportMutation.mutate(reportData);
  };

  if (isLoading) return <div className="loading">Loading progress reports...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Progress Reports</h2>
        {userRole === 'therapist' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowReportForm(!showReportForm)}
          >
            {showReportForm ? 'Cancel' : 'Create Report'}
          </button>
        )}
      </div>

      {/* Reminder card for overdue reports */}
      <div className="card" style={{ marginBottom: '2rem', background: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <h3 style={{ color: '#856404' }}>📝 Report Reminders</h3>
        <p style={{ color: '#856404' }}>
          The following patients have completed 10+ sessions and are due for progress reports:
        </p>
        <ul style={{ color: '#856404' }}>
          {eligiblePatients?.data?.slice(0, 3).map(patient => (
            <li key={patient._id}>
              {patient.name} - {patient.sessionCount || 0} sessions completed
            </li>
          )) || <li>No patients currently due for reports</li>}
        </ul>
      </div>

      {showReportForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create Progress Report</h3>
          <form onSubmit={handleSubmitReport}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Patient:</label>
                <select name="patient" className="form-control" required>
                  <option value="">Select patient...</option>
                  {eligiblePatients?.data?.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.sessionCount || 0} sessions)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Session Count:</label>
                <input name="sessionCount" type="number" className="form-control" required />
              </div>
            </div>

            <h4>Metrics Summary</h4>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Metric Name:</label>
                <input name="metric1_name" className="form-control" placeholder="e.g., Mood Scale" required />
              </div>
              <div className="form-group">
                <label>Trend:</label>
                <select name="metric1_trend" className="form-control" required>
                  <option value="">Select trend...</option>
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="declining">Declining</option>
                </select>
              </div>
              <div className="form-group">
                <label>Current Value:</label>
                <input name="metric1_value" type="number" step="0.1" className="form-control" required />
              </div>
            </div>

            <div className="form-group">
              <label>Narrative Summary:</label>
              <textarea 
                name="narrative" 
                className="form-control" 
                rows="4"
                placeholder="Describe the patient's progress, challenges, and achievements..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Recommendation:</label>
              <textarea 
                name="recommendation" 
                className="form-control" 
                rows="3"
                placeholder="Recommend next steps, changes to treatment plan, etc..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success" disabled={submitReportMutation.isPending}>
              {submitReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Progress Reports</h3>
        {!reports?.data?.length ? (
          <p>No progress reports found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Sessions</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.map(report => (
                <tr key={report._id}>
                  <td>{report.patient?.name || 'Unknown'}</td>
                  <td>{report.sessionCount}</td>
                  <td>
                    <span className={`status-badge ${report.reviewedAt ? 'status-approved' : 'status-submitted'}`}>
                      {report.reviewedAt ? 'Reviewed' : 'Pending Review'}
                    </span>
                  </td>
                  <td>{new Date(report.submittedAt).toLocaleDateString()}</td>
                  <td>
                    {!report.reviewedAt && userRole === 'supervisor' && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedReport(report)}
                      >
                        Review
                      </button>
                    )}
                    {report.reviewedAt && (
                      <span className="status-badge status-approved">✓ Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedReport && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Review Report for {selectedReport.patient?.name}</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <h4>Metrics Summary:</h4>
            {selectedReport.metricsSummary?.map((metric, index) => (
              <p key={index}>
                <strong>{metric.metric}:</strong> {metric.trend} (Current: {metric.value})
              </p>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>Narrative:</h4>
            <p style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
              {selectedReport.narrative}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4>Recommendation:</h4>
            <p style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
              {selectedReport.recommendation}
            </p>
          </div>

          <div className="form-group">
            <label>Supervisor Feedback:</label>
            <textarea 
              className="form-control"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="3"
              placeholder="Provide feedback on the report..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-success"
              onClick={() => reviewReportMutation.mutate({ 
                reportId: selectedReport._id, 
                feedback 
              })}
              disabled={reviewReportMutation.isPending}
            >
              {reviewReportMutation.isPending ? 'Reviewing...' : 'Complete Review'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReports;
