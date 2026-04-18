import React from 'react';
import './ScoringDashboard.css';
import { calculateEfficiencyScore, getEfficiencyBand, calculateWaste, getTopIssues, getRecommendations } from '../utils/scoring';
import { getHomeEra, getEraContextLine } from '../utils/homeEra';

function ScoringDashboard({ homeProfile, scoreInputs, onBack, onContinue }) {
  const score = calculateEfficiencyScore(scoreInputs);
  const band = getEfficiencyBand(score);
  const waste = calculateWaste(parseFloat(homeProfile.squareFeet) || 2000, band, parseFloat(homeProfile.electricBill) || 180);
  const issues = getTopIssues(scoreInputs);
  const recommendations = getRecommendations(scoreInputs);
  const era = getHomeEra(homeProfile.yearBuilt);
  const eraContext = getEraContextLine(era.era, homeProfile.yearBuilt, scoreInputs);

  return (
    <div className="scoring-container">
      <div className="scoring-content">
        {/* Score Card */}
        <div className="score-card" style={{ backgroundColor: band.bg, borderLeft: `6px solid ${band.color}` }}>
          <div className="score-header">
            <h2>Your Energy Efficiency Score</h2>
            <p className="year-built">Home built: {homeProfile.yearBuilt} ({era.label})</p>
          </div>

          <div className="score-display">
            <div className="score-number" style={{ color: band.color }}>
              {score}
            </div>
            <div className="score-label" style={{ color: band.color }}>
              {band.label}
            </div>
          </div>

          <div className="score-description">
            <p>{eraContext}</p>
          </div>
        </div>

        {/* Issues & Opportunities */}
        <div className="dashboard-row">
          {/* Top Issues */}
          <div className="dashboard-card">
            <h3>Top Issues Identified</h3>
            {issues.length > 0 ? (
              <ul className="issues-list">
                {issues.map((issue, idx) => (
                  <li key={idx}>
                    <span className="issue-icon">⚠️</span>
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-issues">Great job! Few major issues detected.</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="dashboard-card">
            <h3>Priority Improvements</h3>
            {recommendations.length > 0 ? (
              <ul className="recommendations-list">
                {recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <strong>{rec.label}</strong>
                    <p>{rec.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No major recommendations at this time.</p>
            )}
          </div>
        </div>

        {/* Waste Estimate */}
        <div className="dashboard-card full-width">
          <h3>Estimated Energy Waste</h3>
          <p className="waste-description">
            Based on your home's profile and performance inputs, we estimate {score >= 85 ? 'minimal' : 'significant'} efficiency loss:
          </p>
          <div className="waste-metrics">
            <div className="metric">
              <span className="metric-label">Annual Waste Range</span>
              <span className="metric-value">
                ${waste.annualLow.toLocaleString()} - ${waste.annualHigh.toLocaleString()}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Monthly Waste Range</span>
              <span className="metric-value">
                ${waste.monthlyLow.toLocaleString()} - ${waste.monthlyHigh.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="scoring-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <button className="btn btn-primary btn-lg" onClick={onContinue}>
            View Available Packages →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoringDashboard;
