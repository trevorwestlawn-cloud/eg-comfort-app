import React, { useState } from 'react';
import './App.css';
import { CONFIG } from './config/config';
import Header from './components/Header';
import HomeProfileForm from './components/HomeProfileForm';
import ScoringDashboard from './components/ScoringDashboard';
import PackageSelector from './components/PackageSelector';
import SavingsProjection from './components/SavingsProjection';
import Footer from './components/Footer';

function App() {
  const [step, setStep] = useState('profile'); // profile, scoring, packages, savings
  const [homeProfile, setHomeProfile] = useState({
    address: '',
    squareFeet: '2000',
    yearBuilt: '',
    systemCount: '2',
    hasPool: false,
    electricBill: '180',
    gasBill: '',
    monthlyBill: '',
  });

  const [scoreInputs, setScoreInputs] = useState({
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

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [financingOption, setFinancingOption] = useState('cash');

  const handleProfileSubmit = (profile, inputs) => {
    setHomeProfile(profile);
    setScoreInputs(inputs);
    setStep('scoring');
  };

  const handleContinueToPackages = () => {
    setStep('packages');
  };

  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  const handleReviewQuote = () => {
    setStep('savings');
  };

  const handleBack = () => {
    if (step === 'savings') setStep('packages');
    else if (step === 'packages') setStep('scoring');
    else if (step === 'scoring') setStep('profile');
  };

  const handleStartOver = () => {
    setStep('profile');
    setSelectedPackage(null);
    setSelectedAddons({});
    setFinancingOption('cash');
  };

  return (
    <div className="app">
      <Header />
      
      <div className="app-container">
        {step === 'profile' && (
          <HomeProfileForm onSubmit={handleProfileSubmit} />
        )}

        {step === 'scoring' && (
          <ScoringDashboard
            homeProfile={homeProfile}
            scoreInputs={scoreInputs}
            onBack={handleBack}
            onContinue={handleContinueToPackages}
          />
        )}

        {step === 'packages' && (
          <PackageSelector
            homeProfile={homeProfile}
            scoreInputs={scoreInputs}
            selectedPackage={selectedPackage}
            selectedAddons={selectedAddons}
            onPackageSelect={handlePackageSelect}
            onAddonToggle={handleAddonToggle}
            onBack={handleBack}
            onReviewQuote={handleReviewQuote}
          />
        )}

        {step === 'savings' && (
          <SavingsProjection
            homeProfile={homeProfile}
            scoreInputs={scoreInputs}
            selectedPackage={selectedPackage}
            selectedAddons={selectedAddons}
            financingOption={financingOption}
            onFinancingChange={setFinancingOption}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
