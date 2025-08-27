import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api';

const Analytics = () => {
  const [selectedReport, setSelectedReport] = useState('caseload');
  const [dateRange, setDateRange] = useState('last-month');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedReport, dateRange],
    queryFn: () => apiGet('/api/analytics', { report: selectedReport, range: dateRange }),
  });

  const reportTypes = [
    { value: 'caseload', label: 'Caseload Distribution' },
    { value: 'progress', label: 'Progress Rates' },
    { value: 'approval', label: 'Plan Approval Duration' },
    { value: 'performance', label: 'Therapist Performance' },
    { value: 'sessions', label: 'Session Analytics' },
    { value: 'overdue', label: 'Overdue Items' },
  ];

  const handleExport = (format) => {
    // In a real app, this would trigger a download
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}...`);
  };

  if (isLoading) return <div className="loading">Loading analytics...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Reports & Analytics</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Report Filters</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>Report Type:</label>
            <select 
              className="form-control"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date Range:</label>
            <select 
              className="form-control"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h4>Total Cases</h4>
          <div style={{ fontSize: '2rem', color: '#3498db', fontWeight: 'bold' }}>
            {analytics?.totalCases || 156}
          </div>
          <p style={{ color: '#27ae60' }}>↗ +12% from last month</p>
        </div>
        <div className="card">
          <h4>Active Therapists</h4>
          <div style={{ fontSize: '2rem', color: '#27ae60', fontWeight: 'bold' }}>
            {analytics?.activeTherapists || 24}
          </div>
          <p style={{ color: '#3498db' }}>→ No change</p>
        </div>
        <div className="card">
          <h4>Avg. Plan Approval</h4>
          <div style={{ fontSize: '2rem', color: '#f39c12', fontWeight: 'bold' }}>
            {analytics?.avgApprovalTime || '2.3'} days
          </div>
          <p style={{ color: '#27ae60' }}>↗ Improved by 0.5 days</p>
        </div>
        <div className="card">
          <h4>Completion Rate</h4>
          <div style={{ fontSize: '2rem', color: '#e74c3c', fontWeight: 'bold' }}>
            {analytics?.completionRate || '87'}%
          </div>
          <p style={{ color: '#e74c3c' }}>↘ -3% from last month</p>
        </div>
      </div>

      {/* Dynamic Report Content */}
      <div className="card">
        <h3>{reportTypes.find(r => r.value === selectedReport)?.label}</h3>
        
        {selectedReport === 'caseload' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h4>Caseload Distribution by Therapist</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Therapist</th>
                    <th>Active Cases</th>
                    <th>Completed Cases</th>
                    <th>Success Rate</th>
                    <th>Workload Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Dr. Sarah Johnson</td>
                    <td>8</td>
                    <td>23</td>
                    <td>89%</td>
                    <td><span className="status-badge status-active">Optimal</span></td>
                  </tr>
                  <tr>
                    <td>Dr. Michael Chen</td>
                    <td>12</td>
                    <td>18</td>
                    <td>92%</td>
                    <td><span className="status-badge status-draft">High</span></td>
                  </tr>
                  <tr>
                    <td>Dr. Emily Rodriguez</td>
                    <td>6</td>
                    <td>15</td>
                    <td>85%</td>
                    <td><span className="status-badge status-active">Optimal</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
              <p>Caseload distribution chart would be displayed here</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                (Bar chart showing case distribution across therapists)
              </p>
            </div>
          </div>
        )}

        {selectedReport === 'progress' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h4>Progress Metrics Summary</h4>
              <div className="grid grid-3">
                <div className="card">
                  <h5>Plans Approved</h5>
                  <div style={{ fontSize: '1.5rem', color: '#27ae60' }}>94%</div>
                  <p>Last 30 days</p>
                </div>
                <div className="card">
                  <h5>Goals Achieved</h5>
                  <div style={{ fontSize: '1.5rem', color: '#3498db' }}>78%</div>
                  <p>Across all cases</p>
                </div>
                <div className="card">
                  <h5>Session Completion</h5>
                  <div style={{ fontSize: '1.5rem', color: '#f39c12' }}>91%</div>
                  <p>Scheduled vs completed</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
              <p>Progress trends chart would be displayed here</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                (Line chart showing progress metrics over time)
              </p>
            </div>
          </div>
        )}

        {selectedReport === 'performance' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h4>Therapist Performance Rankings</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Therapist</th>
                    <th>Avg. Rating</th>
                    <th>Case Success Rate</th>
                    <th>Patient Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Dr. Michael Chen</td>
                    <td>9.2/10</td>
                    <td>94%</td>
                    <td>4.8/5</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Dr. Sarah Johnson</td>
                    <td>8.9/10</td>
                    <td>91%</td>
                    <td>4.7/5</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Dr. Emily Rodriguez</td>
                    <td>8.7/10</td>
                    <td>88%</td>
                    <td>4.6/5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
              <p>Performance comparison chart would be displayed here</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                (Radar chart comparing different performance metrics)
              </p>
            </div>
          </div>
        )}

        {selectedReport === 'sessions' && (
          <div>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <h4>Session Statistics</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    Total Sessions: <strong>1,247</strong>
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    Average Duration: <strong>52 minutes</strong>
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    No-Show Rate: <strong>8.3%</strong>
                  </li>
                  <li style={{ padding: '0.5rem 0' }}>
                    Patient Satisfaction: <strong>4.6/5</strong>
                  </li>
                </ul>
              </div>
              <div className="card">
                <h4>Peak Hours</h4>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <p>Most sessions occur between:</p>
                  <ul>
                    <li><strong>10:00 AM - 12:00 PM</strong> (23%)</li>
                    <li><strong>2:00 PM - 4:00 PM</strong> (28%)</li>
                    <li><strong>6:00 PM - 8:00 PM</strong> (19%)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
              <p>Session frequency and timing charts would be displayed here</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                (Heatmap showing session distribution by day/time)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
