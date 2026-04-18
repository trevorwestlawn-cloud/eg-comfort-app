import React from 'react';
import './PackageSelector.css';
import { CONFIG } from '../config/config';

function PackageSelector({
  homeProfile,
  scoreInputs,
  selectedPackage,
  selectedAddons,
  onPackageSelect,
  onAddonToggle,
  onBack,
  onReviewQuote,
}) {
  const isPackageSelected = selectedPackage !== null;

  return (
    <div className="packages-container">
      <div className="packages-content">
        <h2>Choose Your Package</h2>
        <p className="packages-subtitle">
          Select a package below, then customize with add-ons to fit your needs
        </p>

        {/* Packages Grid */}
        <div className="packages-grid">
          {Object.values(CONFIG.packages).map((pkg) => (
            <div
              key={pkg.id}
              className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
              onClick={() => onPackageSelect(pkg.id)}
            >
              {pkg.badge && <div className="package-badge">{pkg.badge}</div>}
              <h3>{pkg.name}</h3>
              <div className="package-price">${pkg.price.toLocaleString()}</div>
              <ul className="package-includes">
                {pkg.includes.map((item, idx) => (
                  <li key={idx}>✓ {item}</li>
                ))}
              </ul>
              <input
                type="radio"
                name="package"
                value={pkg.id}
                checked={selectedPackage === pkg.id}
                onChange={() => onPackageSelect(pkg.id)}
                className="package-radio"
              />
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        {isPackageSelected && (
          <div className="addons-section">
            <h3>Optional Add-ons</h3>
            <p className="addons-subtitle">Customize your package with these optional upgrades</p>

            <div className="addons-grid">
              {Object.values(CONFIG.addons)
                .filter((addon) => !addon.poolOnly || homeProfile.hasPool)
                .map((addon) => (
                  <div
                    key={addon.id}
                    className={`addon-card ${selectedAddons[addon.id] ? 'selected' : ''}`}
                  >
                    <div className="addon-header">
                      <input
                        type="checkbox"
                        id={addon.id}
                        checked={selectedAddons[addon.id] || false}
                        onChange={() => onAddonToggle(addon.id)}
                      />
                      <label htmlFor={addon.id}>
                        <strong>{addon.label}</strong>
                      </label>
                    </div>
                    <div className="addon-price">
                      from ${addon.minPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="packages-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={onReviewQuote}
            disabled={!isPackageSelected}
          >
            Review Quote & Financing →
          </button>
        </div>

        {!isPackageSelected && (
          <p className="selection-hint">Please select a package to continue</p>
        )}
      </div>
    </div>
  );
}

export default PackageSelector;
