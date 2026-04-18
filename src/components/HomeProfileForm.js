import React, { useState } from 'react';
import './HomeProfileForm.css';
import { CONFIG } from '../config/config';

function HomeProfileForm({ onSubmit }) {
  const [profile, setProfile] = useState({
    address: '',
    squareFeet: '2000',
    yearBuilt: new Date().getFullYear() - 15,
    systemCount: '2',
    hasPool: false,
    electricBill: '180',
    gasBill: '',
  });

  const [inputs, setInputs] = useState({
    comfort: 'fine',
    airflow: 'fine',
    bills: 'normal',
    runtime: 'normal',
    upgrades: 'some',
    dust: 'none',
    unusedRooms: 'none',
    hasThermostat: true,
    sensors: 'oneTwo',
    hasMonitoring: false,
    hvacAge: 'under5',
    thermostatType: 'basic',
    alreadySealed: false,
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile, inputs);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Tell us about your home</h2>
        <p className="form-subtitle">We'll assess your energy efficiency and identify savings opportunities</p>

        <form onSubmit={handleSubmit}>
          {/* Home Profile Section */}
          <fieldset className="form-section">
            <legend>Property Details</legend>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="123 Main St, City, ST 12345"
                value={profile.address}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="squareFeet">Square Footage</label>
                <input
                  type="number"
                  id="squareFeet"
                  name="squareFeet"
                  value={profile.squareFeet}
                  onChange={handleProfileChange}
                  min="500"
                  max="20000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearBuilt">Year Built</label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={profile.yearBuilt}
                  onChange={handleProfileChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="systemCount">Number of AC Systems</label>
                <select id="systemCount" name="systemCount" value={profile.systemCount} onChange={handleProfileChange}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="hasPool"
                name="hasPool"
                checked={profile.hasPool}
                onChange={handleProfileChange}
              />
              <label htmlFor="hasPool">Home has a pool</label>
            </div>
          </fieldset>

          {/* Energy Bills Section */}
          <fieldset className="form-section">
            <legend>Current Energy Bills</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="electricBill">Monthly Electric Bill ($)</label>
                <input
                  type="number"
                  id="electricBill"
                  name="electricBill"
                  value={profile.electricBill}
                  onChange={handleProfileChange}
                  min="0"
                  step="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gasBill">Monthly Gas Bill ($)</label>
                <input
                  type="number"
                  id="gasBill"
                  name="gasBill"
                  placeholder="Optional"
                  value={profile.gasBill}
                  onChange={handleProfileChange}
                  min="0"
                  step="10"
                />
              </div>
            </div>
          </fieldset>

          {/* Comfort & Performance Section */}
          <fieldset className="form-section">
            <legend>Comfort & Performance</legend>

            <div className="form-group">
              <label htmlFor="comfort">How's your comfort level?</label>
              <select id="comfort" name="comfort" value={inputs.comfort} onChange={handleInputChange}>
                <option value="fine">Fine throughout the home</option>
                <option value="some">Some inconsistency</option>
                <option value="major">Major hot/cold spots</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="airflow">Airflow to rooms:</label>
              <select id="airflow" name="airflow" value={inputs.airflow} onChange={handleInputChange}>
                <option value="fine">Good and balanced</option>
                <option value="weak">Weak to some rooms</option>
                <option value="veryWeak">Very weak in multiple rooms</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bills">Energy bills compared to similar homes:</label>
              <select id="bills" name="bills" value={inputs.bills} onChange={handleInputChange}>
                <option value="normal">Normal/expected</option>
                <option value="slightly">Slightly higher</option>
                <option value="much">Much higher than expected</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="runtime">HVAC system runtime:</label>
              <select id="runtime" name="runtime" value={inputs.runtime} onChange={handleInputChange}>
                <option value="normal">Normal runtime</option>
                <option value="long">Longer than typical</option>
                <option value="neverOff">Runs almost constantly</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hvacAge">HVAC system age:</label>
              <select id="hvacAge" name="hvacAge" value={inputs.hvacAge} onChange={handleInputChange}>
                <option value="under5">Less than 5 years</option>
                <option value="5to10">5-10 years old</option>
                <option value="10plus">More than 10 years old</option>
              </select>
            </div>
          </fieldset>

          {/* Systems & Upgrades Section */}
          <fieldset className="form-section">
            <legend>Current Systems</legend>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="hasThermostat"
                name="hasThermostat"
                checked={inputs.hasThermostat}
                onChange={handleInputChange}
              />
              <label htmlFor="hasThermostat">Have a programmable thermostat</label>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="hasMonitoring"
                name="hasMonitoring"
                checked={inputs.hasMonitoring}
                onChange={handleInputChange}
              />
              <label htmlFor="hasMonitoring">Have energy monitoring system</label>
            </div>

            <div className="form-group">
              <label htmlFor="sensors">Room sensors:</label>
              <select id="sensors" name="sensors" value={inputs.sensors} onChange={handleInputChange}>
                <option value="none">None</option>
                <option value="oneTwo">One or two</option>
                <option value="multiple">Multiple installed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="upgrades">Recent efficiency upgrades:</label>
              <select id="upgrades" name="upgrades" value={inputs.upgrades} onChange={handleInputChange}>
                <option value="none">None</option>
                <option value="some">Some (ducts, sealing, etc)</option>
                <option value="recent">Recent major upgrades</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="alreadySealed"
                name="alreadySealed"
                checked={inputs.alreadySealed}
                onChange={handleInputChange}
              />
              <label htmlFor="alreadySealed">Already had ductwork sealed</label>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg">
              Calculate My Score →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomeProfileForm;
