import { CONFIG } from "../config/config";

const UPGRADE_IMPACTS = {
  ductSealing: { savingsLow: 0.08, savingsHigh: 0.20, scoreLow: 6, scoreHigh: 15, label: "Duct Sealing / Airflow Correction" },
  smartThermostat: { savingsLow: 0.03, savingsHigh: 0.08, scoreLow: 3, scoreHigh: 6, label: "Smart Thermostat" },
  roomSensors: { savingsLow: 0.02, savingsHigh: 0.06, scoreLow: 2, scoreHigh: 5, label: "Room Sensors" },
  filterUpgrade: { savingsLow: 0.01, savingsHigh: 0.04, scoreLow: 1, scoreHigh: 3, label: "Filter / Plenum Upgrade" },
  energyMonitor: { savingsLow: 0.01, savingsHigh: 0.05, scoreLow: 1, scoreHigh: 4, label: "Energy Monitor" },
  bootSealing: { savingsLow: 0.02, savingsHigh: 0.06, scoreLow: 2, scoreHigh: 5, label: "Boot Sealing" },
  ductCleaning: { savingsLow: 0.01, savingsHigh: 0.04, scoreLow: 1, scoreHigh: 3, label: "Duct Cleaning" },
  poolPump: { savingsLow: 0.03, savingsHigh: 0.10, scoreLow: 2, scoreHigh: 6, label: "Variable-Speed Pool Pump" },
};

export function getBasePrice(packageId) {
  if (packageId && CONFIG.packages[packageId]) {
    return CONFIG.packages[packageId].price;
  }
  return 0;
}

export function getUpgradesForSelection(packageId, addons) {
  const upgrades = [];

  if (packageId === "coreSeal" || packageId === "performance" || packageId === "ultimate") {
    upgrades.push("ductSealing");
  }
  if (packageId === "performance" || packageId === "ultimate") {
    upgrades.push("ductCleaning");
    upgrades.push("bootSealing");
  }
  if (packageId === "ultimate") {
    upgrades.push("smartThermostat");
    upgrades.push("roomSensors");
    upgrades.push("filterUpgrade");
    upgrades.push("energyMonitor");
  }

  if (addons?.thermostatPackage && upgrades.indexOf("smartThermostat") === -1)
    upgrades.push("smartThermostat");
  if (addons?.emporiaMonitor && upgrades.indexOf("energyMonitor") === -1)
    upgrades.push("energyMonitor");
  if (addons?.filterUpgrade && upgrades.indexOf("filterUpgrade") === -1)
    upgrades.push("filterUpgrade");
  if (addons?.bootSealing && upgrades.indexOf("bootSealing") === -1)
    upgrades.push("bootSealing");
  if (addons?.ductCleaning && upgrades.indexOf("ductCleaning") === -1)
    upgrades.push("ductCleaning");
  if (addons?.poolPump && upgrades.indexOf("poolPump") === -1)
    upgrades.push("poolPump");

  return upgrades;
}

export function getHvacShare(scoreInputs) {
  let base = 0.45;
  if (scoreInputs.runtime === "neverOff") base = 0.55;
  if (scoreInputs.airflow === "veryWeak") base = Math.min(0.55, base + 0.05);
  if (scoreInputs.comfort === "major") base = Math.min(0.55, base + 0.03);
  return base;
}

export function calculateSavingsProjection(score, homeProfile, scoreInputs, packageId, addons, band) {
  const elec = parseFloat(homeProfile.electricBill) || 0;
  const gas = parseFloat(homeProfile.gasBill) || 0;
  const monthlyBill = elec + gas > 0 ? elec + gas : parseFloat(homeProfile.monthlyBill) || 180;
  const sqft = parseFloat(homeProfile.squareFeet) || 2000;
  const annualBill = monthlyBill * 12;
  const annualFloor = sqft * 1.8;
  const annualTotal = Math.max(annualBill, annualFloor);
  const hvacShare = getHvacShare(scoreInputs);
  const hvacAnnual = annualTotal * hvacShare;

  const wasteLow = Math.round(hvacAnnual * band.wasteLow);
  const wasteHigh = Math.round(hvacAnnual * band.wasteHigh);

  let tier;
  if (score >= 90) tier = "High Performing";
  else if (score >= 75) tier = "Good — Room to Improve";
  else if (score >= 60) tier = "Moderate Inefficiency";
  else tier = "Significant Performance Loss";

  let explanation;
  if (score >= 90) {
    explanation = "This home is performing well. Energy use is close to optimal for the systems in place. Minor improvements may still offer incremental gains.";
  } else if (score >= 75) {
    explanation =
      "This home has a solid foundation but has measurable inefficiencies. Targeted upgrades could improve comfort noticeably and reduce energy waste by an estimated " +
      Math.round(band.wasteLow * 100) +
      "% to " +
      Math.round(band.wasteHigh * 100) +
      "% of current HVAC spend.";
  } else if (score >= 60) {
    explanation =
      "This home is showing moderate signs of energy loss — likely through duct leakage, poor airflow distribution, or limited control. The estimated waste represents real dollars that improvements could recover.";
  } else {
    explanation =
      "This home has significant efficiency gaps. Duct leakage, poor airflow, and limited system control are likely costing more than necessary each month. This profile responds well to targeted upgrades.";
  }

  const upgrades = getUpgradesForSelection(packageId, addons);

  const controlGroup = ["smartThermostat", "roomSensors"];
  const airflowGroup = ["ductSealing", "bootSealing", "ductCleaning", "filterUpgrade"];

  let savingsLowTotal = 0;
  let savingsHighTotal = 0;
  let scoreLowTotal = 0;
  let scoreHighTotal = 0;
  let controlCount = 0;
  let airflowCount = 0;
  const upgradeDetails = [];

  upgrades.forEach((uid) => {
    const u = UPGRADE_IMPACTS[uid];
    if (!u) return;

    let multiplier = 1.0;

    if (controlGroup.indexOf(uid) > -1) {
      controlCount++;
      if (controlCount === 2) multiplier = 0.6;
      if (controlCount >= 3) multiplier = 0.35;
    }

    if (airflowGroup.indexOf(uid) > -1) {
      airflowCount++;
      if (airflowCount === 2) multiplier = 0.65;
      if (airflowCount === 3) multiplier = 0.4;
      if (airflowCount >= 4) multiplier = 0.25;
    }

    const sl = hvacAnnual * u.savingsLow * multiplier;
    const sh = hvacAnnual * u.savingsHigh * multiplier;
    savingsLowTotal += sl;
    savingsHighTotal += sh;
    scoreLowTotal += u.scoreLow;
    scoreHighTotal += u.scoreHigh;

    upgradeDetails.push({
      label: u.label,
      savingsLow: Math.round(sl),
      savingsHigh: Math.round(sh),
      scoreLow: u.scoreLow,
      scoreHigh: u.scoreHigh,
      multiplier,
    });
  });

  savingsLowTotal = Math.min(Math.round(savingsLowTotal), wasteHigh);
  savingsHighTotal = Math.min(Math.round(savingsHighTotal), wasteHigh);

  const projScoreLow = Math.min(97, score + scoreLowTotal);
  const projScoreHigh = Math.min(97, score + scoreHighTotal);

  const monthlyLow = Math.round(savingsLowTotal / 12);
  const monthlyHigh = Math.round(savingsHighTotal / 12);

  return {
    score,
    tier,
    explanation,
    wasteLow,
    wasteHigh,
    savingsLowTotal,
    savingsHighTotal,
    projScoreLow,
    projScoreHigh,
    monthlyLow,
    monthlyHigh,
    upgradeDetails,
    hvacAnnual,
  };
}
