import React from 'react';
import './SavingsProjection.css';
import { CONFIG } from '../config/config';
import { calculateEfficiencyScore, getEfficiencyBand } from '../utils/scoring';
import { calculateSavingsProjection } from '../utils/savings';

function SavingsProjection({
  homeProfile,
  scoreInputs,
  selectedPackage,
  selectedAddons,
  financingOption,
  onFinancingChange,
  onBack,
  onStartOver,
}) {
  const score = calculateEfficiencyScore(scoreInputs);
  const band = getEfficiencyBand(score);
  const projection = calculateSavingsProjection(
    score,
    homeProfile,
    scoreInputs,
    selectedPackage,
    selectedAddons,
    band
  );

  const packageData = CONFIG.packages[selectedPackage];
  const financeData = CONFIG.financeOptions.find((f) => f.id === financingOption);
  const packagePrice = packageData?.price || 0;

  // Calculate finance costs
  let totalCost = packagePrice;
  let monthlyPayment = 0;
  if (financeData && financeData.months > 0) {
    const monthlyRate = financeData.apr / 12;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, financeData.months);
    const denominator = Math.pow(1 + monthlyRate, financeData.months) - 1;
    monthlyPayment = Math.round(packagePrice * (numerator / denominator));
    totalCost = monthlyPayment * financeData.months;
  } else {
    monthlyPayment = packagePrice;
  }

  const paybackMonths = monthlyPayment > 0 ? (packagePrice / (projection.monthlyHigh || 1)).toFixed(1) : null;

  return (
    <div className="savings-container">
      <div className="savings-content">
        <h2>Your Savings Projection</h2>

        {/* Main Savings Card */}
        <div className="savings-card">
          <h3>{packageData?.name}</h3>
          <p className="savings-subtitle">Investment: ${packagePrice.toLocaleString()}</p>

          <div className="savings-metrics-grid">
            <div className="savings-metric">
              <span className="metric-label">Annual Savings</span>
              <span className="metric-value">
                ${projection.savingsLowTotal.toLocaleString()} - ${projection.savingsHighTotal.toLocaleString()}
              </span>
            </div>
            <div className="savings-metric">
              <span className="metric-label">Monthly Savings</span>
              <span className="metric-value">
                ${projection.monthlyLow.toLocaleString()} - ${projection.monthlyHigh.toLocaleString()}
              </span>
            </div>
            <div className="savings-metric">
              <span className="metric-label">Score Improvement</span>
              <span className="metric-value">
                +{projection.projScoreLow - score} to +{projection.projScoreHigh - score} points
              </span>
            </div>
            <div className="savings-metric">
              <span className="metric-label">Payback Period</span>
              <span className="metric-value">
                {paybackMonths} {paybackMonths === '1' ? 'month' : 'months'}
              </span>
            </div>
          </div>
        </div>

        {/* Financing Section */}
        <div className="financing-section">
          <h3>Financing Options</h3>
          <div className="financing-options">
            {CONFIG.financeOptions.map((option) => (
              <label key={option.id} className="finance-option">
                <input
                  type="radio"
                  name="financing"
                  value={option.id}
                  checked={financingOption === option.id}
                  onChange={(e) => onFinancingChange(e.target.value)}
                />
                <div className="finance-option-content">
                  <div className="finance-label">
                    {option.label}
                    {option.badge && <span className="finance-badge">{option.badge}</span>}
                  </div>
                  <div className="finance-detail">
                    {option.months === 0
                      ? `Total: $${packagePrice.toLocaleString()}`
                      : `${option.months} months @ ${(option.apr * 100).toFixed(1)}% APR`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quote Summary */}
        <div className="quote-summary">
          <h3>Quote Summary</h3>
          <div className="summary-item">
            <span>{packageData?.name}</span>
            <span>${packagePrice.toLocaleString()}</span>
          </div>
          {financeData?.months > 0 && (
            <>
              <div className="summary-item">
                <span>Financing: {financeData.months} months @ {(financeData.apr * 100).toFixed(1)}%</span>
                <span>${(totalCost - packagePrice).toLocaleString()}</span>
              </div>
              <div className="summary-item total">
                <span>Total With Financing</span>
                <span>${totalCost.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Monthly Payment</span>
                <span>${monthlyPayment.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Disclaimers */}
        <div className="disclaimers">
          <p className="disclaimer-small">{CONFIG.disclaimers.savings}</p>
          <p className="disclaimer-small">{CONFIG.disclaimers.finance}</p>
        </div>

        {/* Action Buttons */}
        <div className="savings-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Modify Package
          </button>
          <button className="btn btn-primary btn-lg" onClick={onStartOver}>
            Start Over
          </button>
          <button className="btn btn-success btn-lg">
            Request Consultation →
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavingsProjection;
