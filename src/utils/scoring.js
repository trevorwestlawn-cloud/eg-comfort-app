// Scoring and efficiency calculations
export function calculateEfficiencyScore(inputs) {
  let score = 100;

  if (inputs.comfort === "some") score -= 10;
  if (inputs.comfort === "major") score -= 20;

  if (inputs.bills === "slightly") score -= 10;
  if (inputs.bills === "much") score -= 20;

  if (inputs.airflow === "weak") score -= 10;
  if (inputs.airflow === "veryWeak") score -= 20;

  if (inputs.runtime === "long") score -= 10;
  if (inputs.runtime === "neverOff") score -= 20;

  if (inputs.upgrades === "none") score -= 15;

  if (inputs.dust === "some") score -= 5;
  if (inputs.dust === "severe") score -= 10;

  if (inputs.unusedRooms === "occasional") score -= 5;
  if (inputs.unusedRooms === "multiple") score -= 10;

  if (inputs.hasThermostat === false) score -= 8;

  if (inputs.sensors === "oneTwo") score -= 5;
  if (inputs.sensors === "none") score -= 10;

  if (inputs.hasMonitoring === false) score -= 8;

  if (inputs.hvacAge === "5to10") score -= 5;
  if (inputs.hvacAge === "10plus") score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function getEfficiencyBand(score) {
  if (score >= 85) return { label: "High Efficiency", color: "#27D17F", bg: "rgba(39,209,127,0.10)", wasteLow: 0.05, wasteHigh: 0.10 };
  if (score >= 70) return { label: "Moderate", color: "#F5A623", bg: "rgba(245,166,35,0.10)", wasteLow: 0.10, wasteHigh: 0.20 };
  if (score >= 50) return { label: "Low Efficiency", color: "#2F80ED", bg: "rgba(47,128,237,0.10)", wasteLow: 0.20, wasteHigh: 0.35 };
  return { label: "Major Loss", color: "#E05252", bg: "rgba(224,82,82,0.10)", wasteLow: 0.35, wasteHigh: 0.50 };
}

export function calculateWaste(squareFeet, band, monthlyBill) {
  const annualFromBill = (monthlyBill || 180) * 12;
  const annualFromSqFt = squareFeet * 1.80;
  const annualCost = Math.max(annualFromBill, annualFromSqFt);

  return {
    annualLow: Math.round(annualCost * band.wasteLow),
    annualHigh: Math.round(annualCost * band.wasteHigh),
    monthlyLow: Math.round((annualCost * band.wasteLow) / 12),
    monthlyHigh: Math.round((annualCost * band.wasteHigh) / 12),
  };
}

export function getTopIssues(inputs) {
  const issues = [];
  if (inputs.airflow === "veryWeak" || inputs.airflow === "weak")
    issues.push("Poor airflow to one or more rooms");
  if (inputs.comfort === "major" || inputs.comfort === "some")
    issues.push("Inconsistent temperatures throughout home");
  if (inputs.bills === "much" || inputs.bills === "slightly")
    issues.push("Energy bills higher than expected");
  if (inputs.runtime === "neverOff" || inputs.runtime === "long")
    issues.push("HVAC system runs excessively long cycles");
  if (inputs.dust === "severe" || inputs.dust === "some")
    issues.push("Dust and air quality concerns");
  if (inputs.upgrades === "none")
    issues.push("No efficiency upgrades installed");
  return issues.slice(0, 4);
}

export function getRecommendations(inputs) {
  const recs = [];
  if (inputs.airflow !== "fine")
    recs.push({ priority: 1, label: "Duct Sealing (Airflow)", note: "Primary driver of comfort and efficiency loss." });
  if (!inputs.hasThermostat)
    recs.push({ priority: 2, label: "Smart Thermostat", note: "Precise control reduces unnecessary runtime." });
  if (inputs.sensors === "none" || inputs.sensors === "oneTwo")
    recs.push({ priority: 3, label: "Room Sensors", note: "Identify hot and cold zones accurately." });
  if (!inputs.hasMonitoring)
    recs.push({ priority: 4, label: "Energy Monitoring", note: "Real-time visibility into consumption patterns." });
  if (inputs.hvacAge === "10plus")
    recs.push({ priority: 5, label: "System Health Check", note: "Aging equipment benefits from a full assessment." });
  return recs.slice(0, 5);
}
