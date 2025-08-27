import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api';

const Evaluations = () => {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const queryClient = useQueryClient();

  // Fetch therapists for evaluation
  const { data: therapists, isLoading: loadingTherapists } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => apiGet('/api/users', { role: 'therapist' }),
  });

  // Fetch clinical ratings
  const { data: ratings, isLoading: loadingRatings } = useQuery({
    queryKey: ['clinical-ratings'],
    queryFn: () => apiGet('/api/ratings'),
  });

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: (ratingData) => apiPost('/api/ratings', ratingData),
    onSuccess: () => {
      queryClient.invalidateQueries(['clinical-ratings']);
      setShowRatingForm(false);
      alert('Clinical rating submitted successfully!');
    },
  });

  const handleSubmitRating = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const ratingData = {
      therapist: formData.get('therapist'),
      period: formData.get('period'),
      scores: {
        clinicalSkills: Number(formData.get('clinicalSkills')),
        patientEngagement: Number(formData.get('patientEngagement')),
        documentation: Number(formData.get('documentation')),
        professionalism: Number(formData.get('professionalism')),
        outcomeEffectiveness: Number(formData.get('outcomeEffectiveness')),
      },
      comments: formData.get('comments'),
    };
    submitRatingMutation.mutate(ratingData);
  };

  if (loadingTherapists || loadingRatings) {
    return <div className="loading">Loading evaluation data...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Clinical Evaluations & Ratings</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRatingForm(!showRatingForm)}
        >
          {showRatingForm ? 'Cancel' : 'Rate Therapist'}
        </button>
      </div>

      {showRatingForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Clinical Rating Form</h3>
          <form onSubmit={handleSubmitRating}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Therapist:</label>
                <select name="therapist" className="form-control" required>
                  <option value="">Select therapist...</option>
                  {therapists?.data?.map(therapist => (
                    <option key={therapist._id} value={therapist._id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Evaluation Period:</label>
                <select name="period" className="form-control" required>
                  <option value="">Select period...</option>
                  <option value="Q1-2024">Q1 2024</option>
                  <option value="Q2-2024">Q2 2024</option>
                  <option value="Q3-2024">Q3 2024</option>
                  <option value="Q4-2024">Q4 2024</option>
                </select>
              </div>
            </div>

            <h4>Clinical Scores (1-10 scale)</h4>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Clinical Skills:</label>
                <input 
                  name="clinicalSkills" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Patient Engagement:</label>
                <input 
                  name="patientEngagement" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Documentation Quality:</label>
                <input 
                  name="documentation" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Professionalism:</label>
                <input 
                  name="professionalism" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Outcome Effectiveness:</label>
                <input 
                  name="outcomeEffectiveness" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Comments & Feedback:</label>
              <textarea 
                name="comments" 
                className="form-control" 
                rows="4"
                placeholder="Provide detailed feedback and areas for improvement..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success" disabled={submitRatingMutation.isPending}>
              {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Recent Clinical Ratings</h3>
        {!ratings?.data?.length ? (
          <p>No clinical ratings found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Therapist</th>
                <th>Period</th>
                <th>Overall Score</th>
                <th>Clinical Skills</th>
                <th>Patient Engagement</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.data.map(rating => {
                const overallScore = Object.values(rating.scores || {}).reduce((sum, score) => sum + score, 0) / Object.keys(rating.scores || {}).length;
                return (
                  <tr key={rating._id}>
                    <td>{rating.therapist?.name || 'Unknown'}</td>
                    <td>{rating.period}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: overallScore >= 8 ? '#27ae60' : overallScore >= 6 ? '#f39c12' : '#e74c3c' 
                      }}>
                        {overallScore.toFixed(1)}/10
                      </span>
                    </td>
                    <td>{rating.scores?.clinicalSkills || 'N/A'}</td>
                    <td>{rating.scores?.patientEngagement || 'N/A'}</td>
                    <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Therapist Performance Overview</h3>
        <div className="form-group">
          <label>Select Therapist for Detailed View:</label>
          <select 
            className="form-control"
            value={selectedTherapist}
            onChange={(e) => setSelectedTherapist(e.target.value)}
          >
            <option value="">Choose a therapist...</option>
            {therapists?.data?.map(therapist => (
              <option key={therapist._id} value={therapist._id}>
                {therapist.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTherapist && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Performance Trends</h4>
            <div className="grid grid-3">
              <div className="card">
                <h5>Average Score</h5>
                <div style={{ fontSize: '2rem', color: '#3498db', fontWeight: 'bold' }}>
                  8.2/10
                </div>
                <p>Last 4 quarters</p>
              </div>
              <div className="card">
                <h5>Improvement Areas</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>📈 Documentation (+0.5)</li>
                  <li>📈 Patient Engagement (+0.3)</li>
                </ul>
              </div>
              <div className="card">
                <h5>Strengths</h5>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>⭐ Clinical Skills (9.1)</li>
                  <li>⭐ Professionalism (8.8)</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '4px', marginTop: '1rem' }}>
              <p>Performance trend chart would be displayed here</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                (Chart showing score progression over time)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluations;
