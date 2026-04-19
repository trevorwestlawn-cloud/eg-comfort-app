import { useState } from "react";

// ============================================================
// CONFIG -- edit all values here
// ============================================================
const CONFIG = {
  brand: {
    companyName: "Energy Guys Comfort",
    shortName: "EG Comfort",
    domain: "egcomfort.com",
    tagline: "Fix the home, not just the HVAC",
    sub: "Lower bills. Better comfort. Proven results.",
  },

  // Source: Grayson-Collin Electric Co-op, Account 198416203, 7212 Faraday Ln, McKinney TX
  // Current bill:  March 2026 (02/05/2026 to 03/05/2026)
  // Prior bill:    March 2025 (02/05/2025 to 03/05/2025) -- same 28-day period one year prior
  exampleBill: {
    // ---- Current period (March 2026) ----
    currentCharges:       180.13,
    monthlyBill:          180.13,
    usageKwhCurrent:      1057,
    energyCharge:         144.81,    // 1,057 kWh @ $0.137
    baseFee:              25.00,
    cityTax:              3.53,
    franchiseFee:         6.79,
    avgDailyKwhCurrent:   38,
    avgDailyCostCurrent:  6.06,
    serviceFrom:          "02/05/2026",
    serviceTo:            "03/05/2026",
    serviceDays:          28,

    // ---- Prior year same period (March 2025) ----
    priorBill:            314.56,
    usageKwhLastYear:     1982,
    energyChargeLastYear: 271.53,    // 1,982 kWh @ $0.137
    baseFeeLastYear:      25.00,
    cityTaxLastYear:      6.17,
    franchiseFeeLastYear: 11.86,
    avgDailyKwhLastYear:  71,
    avgDailyCostLastYear: 10.59,
    serviceFromLastYear:  "02/05/2025",
    serviceToLastYear:    "03/05/2025",

    // ---- Year-over-year delta ----
    kwhReduction:         925,       // 1,982 - 1,057
    dollarSavings:        134.43,    // $314.56 - $180.13
    reductionPercent:     46.7,
    reductionLabel:       "47% lower kWh usage vs same month last year",
    dollarSavingsLabel:   "$134.43 lower bill vs same month last year",
    billImageUrl:         "",
  },

  packages: {
    coreSeal: {
      id: "coreSeal",
      name: "EG Comfort Core Seal",
      price: 3000,
      badge: "Best place to start",
      includes: [
        "Two-system core sealing package",
        "Airflow optimization",
        "Basic performance verification",
      ],
      includedAddons: [],
    },
    performance: {
      id: "performance",
      name: "EG Comfort Performance",
      price: 4198,
      badge: "Most Popular",
      includes: [
        "Everything in Core Seal",
        "Duct cleaning",
        "Boot sealing",
      ],
      includedAddons: ["ductCleaning", "bootSealing"],
    },
    ultimate: {
      id: "ultimate",
      name: "EG Comfort Ultimate",
      price: 6995,
      badge: "Premium Comfort + Control",
      includes: [
        "Everything in Performance",
        "2 smart thermostats",
        "3 room sensors",
        "2 upgraded 4-inch filter/plenum upgrades",
        "Emporia energy monitor",
      ],
      includedAddons: ["ductCleaning", "bootSealing", "emporiaMonitor", "thermostatPackage", "filterUpgrade"],
    },
  },

  // ---- ADD-ON PRICING ENGINE ----
  // Prices are computed dynamically from homeProfile inputs.
  // basePrice here is the fallback only -- actual price flows through calculateAddonPrice().
  addons: {
    ductCleaning: {
      id: "ductCleaning", label: "Duct Cleaning", poolOnly: false, perSystem: false,
      basePrice: 650,
      // Multiplied by homeSize: small=1.0, medium=1.15, large=1.3
      sizeMultipliers: { small: 1.0, medium: 1.15, large: 1.3 },
      minPrice: 650, maxPrice: 1200,
    },
    bootSealing: {
      id: "bootSealing", label: "Boot Sealing", poolOnly: false, perSystem: true,
      pricePerSystem: 299,
      minPrice: 299, maxPrice: 900,
    },
    emporiaMonitor: {
      id: "emporiaMonitor", label: "Emporia Energy Monitor", poolOnly: false, perSystem: false,
      // 400 hardware + 200 install per panel
      basePricePerPanel: 400, installPerPanel: 200,
      minPricePerPanel: 500, maxPricePerPanel: 800,
    },
    thermostatPackage: {
      id: "thermostatPackage", label: "Smart Thermostat Package", poolOnly: false, perSystem: false,
      // Types: basic=350, advanced=550, premium=850
      types: { basic: 350, advanced: 550, premium: 850 },
      // Install: standard=150, complex=300
      install: { standard: 150, complex: 300 },
      sensorPrice: 85,
      minPrice: 900, maxPrice: 2000,
      // Default config shown in add-ons card before rep configures
      defaultType: "advanced", defaultInstall: "standard", defaultSensors: 3,
    },
    filterUpgrade: {
      id: "filterUpgrade", label: "4\" Filter / Plenum Upgrade", poolOnly: false, perSystem: true,
      pricePerSystem: 850,
      // Complexity adjustments per system
      complexityAdj: { standard: 0, difficult: 150, premium: 200 },
      defaultComplexity: "standard",
      minPrice: 850, maxPrice: 3000,
    },
    poolPump: {
      id: "poolPump", label: "Variable-Speed Pool Pump", poolOnly: true, perSystem: false,
      // Types: entry=1800, mid=2200, premium=2600
      types: { entry: 1800, mid: 2200, premium: 2600 },
      // Install: standard=600, complex=1000
      install: { standard: 600, complex: 1000 },
      // Pool size multipliers
      sizeMultipliers: { small: 1.0, medium: 1.1, large: 1.2 },
      minPrice: 2500, maxPrice: 3800,
      // Default config
      defaultType: "mid", defaultInstall: "standard", defaultPoolSize: "medium",
    },
    hvacReplacement: {
      id: "hvacReplacement", label: "New HVAC System(s)", poolOnly: false, perSystem: false,
      // Per-unit price by type: AC only, Furnace only, Heat Pump, Full System (AC + Furnace)
      types: { ac: 5500, furnace: 5500, heatPump: 8500, fullSystem: 10500 },
      // SEER tier multiplier
      tierMultipliers: { standard: 1.0, high: 1.25, premium: 1.55 },
      defaultType: "fullSystem", defaultTier: "high",
      minPrice: 5000, maxPrice: 50000,
    },
  },

  // APRs are illustrative placeholders -- replace with real lender terms
  financeOptions: [
    { id: "cash", label: "Pay in Full",  months: 0,  apr: 0,    badge: "Best Value",     note: "No finance charge. Lowest total cost." },
    { id: "m3",   label: "3 Months",    months: 3,  apr: 0.05, badge: "Same as Cash",   note: "Pay over 3 months, minimal interest." },
    { id: "m6",   label: "6 Months",    months: 6,  apr: 0.07, badge: null,             note: "Pay over 6 months." },
    { id: "m12",  label: "12 Months",   months: 12, apr: 0.10, badge: null,             note: "12-month installment plan." },
    { id: "m24",  label: "24 Months",   months: 24, apr: 0.14, badge: null,             note: "24-month installment plan." },
    { id: "m36",  label: "36 Months",   months: 36, apr: 0.18, badge: null,             note: "36-month installment plan." },
    { id: "m48",  label: "48 Months",   months: 48, apr: 0.22, badge: null,             note: "48-month installment plan." },
    { id: "m60",  label: "60 Months",   months: 60, apr: 0.26, badge: "Lowest Monthly", note: "60-month installment plan." },
  ],

  disclaimers: {
    general:  "Pricing, incentives, financing terms, and offers are subject to change.",
    savings:  "Savings and scoring examples are illustrative only. Actual results vary.",
    finance:  "Financing is subject to approval and actual lender terms.",
    property: "Property details may be estimated or imported and should be verified.",
    aeroseal: "Aeroseal statistics are sourced from Aeroseal published data and refer to the Aeroseal technology platform, not EG Comfort operating history.",
  },

  // YouTube embed -- use /embed/ URL format, not the share or watch URL
  videos: [
    {
      id: "aeroseal-overview",
      title: "How Duct Sealing Works",
      caption: "A short visual explanation of the Aeroseal duct sealing process.",
      url: "https://www.youtube.com/embed/K3JAR0dCNhc",
      embedType: "iframe",
    },
  ],
};

// ============================================================
// HOUSECALL PRO SERVICE
// Calls the /api/property and /api/order serverless functions which
// proxy to the real Housecall Pro API. When HCP credentials are not
// set on the deployment, the property endpoint returns mock data and
// the order endpoint returns a 'not configured' error -- both of which
// the UI handles gracefully. See INTEGRATIONS.md for setup.
// ============================================================
const housecallProService = {
  getPropertyData: async function(address) {
    try {
      const resp = await fetch("/api/property?address=" + encodeURIComponent(address || ""));
      const data = await resp.json();
      if (!resp.ok) {
        return {
          source: "error",
          confidence: "none",
          error: data.error || "Lookup failed",
        };
      }
      return data;
    } catch (e) {
      // Network / API route not available -- fall back to deterministic mock
      return {
        squareFeet: 3700,
        yearBuilt: 2003,
        systemCount: 2,
        hasPool: true,
        source: "fallback (API not reachable)",
        confidence: "low",
      };
    }
  },

  createOrder: async function(orderPayload) {
    const resp = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      const err = new Error(data.error || data.message || "Order creation failed");
      err.detail = data;
      throw err;
    }
    return data;
  },
};

// ============================================================
// HOME AGE + CODE ERA ENGINE
// Assigns homes to an era bucket and returns weighted adjustments
// for the score engine and recommendation engine.
// Symptoms/bills/known upgrades always override era assumptions.
// ============================================================

function getHomeEra(yearBuilt) {
  var y = parseInt(yearBuilt) || 0;
  if (y === 0)        return { era: "unknown", label: "Unknown era", eraCode: "X" };
  if (y < 1980)       return { era: "A", label: "Pre-1980", eraCode: "A" };
  if (y < 1990)       return { era: "B", label: "1980s", eraCode: "B" };
  if (y < 2006)       return { era: "C", label: "1990-2005", eraCode: "C" };
  if (y < 2016)       return { era: "D", label: "2006-2015", eraCode: "D" };
  if (y < 2022)       return { era: "E", label: "2016-2021", eraCode: "E" };
  return              { era: "F", label: "2022-present", eraCode: "F" };
}

// Returns score penalty points attributable to home age alone.
// These are probability-based, not verified facts.
// Symptoms/bills/upgrades in the main score engine will add more.
function getEraScorePenalty(era, scoreInputs) {
  var penalty = 0;
  var si = scoreInputs;
  // Older eras get a baseline penalty for likely unverified deficiencies
  if (era === "A") penalty += 8;   // Pre-1980: high leakage/insulation risk
  if (era === "B") penalty += 6;   // 1980s: moderate-high risk
  if (era === "C") penalty += 4;   // 1990-2005: moderate risk
  if (era === "D") penalty += 2;   // 2006-2015: mild baseline risk
  // Era E and F get no era-only penalty -- symptoms must drive the score
  // Override: if upgrades confirmed, reduce era penalty
  if (si.upgrades === "recent") penalty = Math.max(0, penalty - 4);
  return penalty;
}

// Returns a human-readable context line about the home era for the advisor
function getEraContextLine(era, yearBuilt, scoreInputs) {
  var si = scoreInputs;
  var hasComfort = si.comfort !== "fine";
  var hasAirflow = si.airflow !== "fine";
  var hasBills   = si.bills !== "normal";

  switch(era) {
    case "A":
      return "Homes from this era commonly have weak air sealing, limited attic insulation, and duct systems that were built before modern leakage standards. That likely creates meaningful opportunity here.";
    case "B":
      return "Homes built in the 1980s often show moderate-to-high duct leakage and insulation levels below today's standards. The improvements below are weighted based on both the age of the home and the symptoms reported.";
    case "C":
      if (hasAirflow || hasComfort) {
        return "Homes from this era had better basics than older homes, but duct leakage and poor airflow balance are still very common. The comfort symptoms you have described make duct sealing and balancing strong candidates here.";
      }
      return "Homes built between 1990 and 2005 typically have a reasonable foundation, but duct leakage, limited control, and moderate insulation gaps still appear regularly. The recommendations below reflect that profile alongside the symptoms reported.";
    case "D":
      if (hasComfort || hasAirflow) {
        return "This home was built in a better-performing era, so the issues you have described are more likely tied to duct routing, airflow balance, or system control than to major shell deficiencies.";
      }
      return "Homes from this era generally have a reasonable energy baseline. The focus here shifts toward optimization, duct verification, and control improvements rather than rescue.";
    case "E":
      if (hasComfort || hasAirflow) {
        return "A home built between 2016 and 2021 should generally perform well. When comfort issues appear in this era, they more often point to balancing, duct routing, room control gaps, or system setup rather than basic insulation deficiency.";
      }
      return "This is a newer-code-era home. Efficiency opportunities here are typically around optimization, control, and system tuning rather than major envelope deficiencies.";
    case "F":
      return "As one of the newest-construction homes, efficiency complaints here are most likely tied to commissioning, airflow balance, room sensors, or system setup rather than insulation or shell performance. Recommendations are framed accordingly.";
    default:
      return "Enter the year the home was built to apply age-based weighting to the recommendations below.";
  }
}

// Returns era-based weight adjustments to apply to each recommendation.
// Positive = boost the weight. Negative = reduce the weight.
// IMPORTANT: symptom signals always add on top of these.
function getEraWeightAdjustments(era, scoreInputs) {
  var si = scoreInputs;
  var hasComfort = si.comfort !== "fine";
  var hasAirflow = si.airflow !== "fine";
  var hasBills   = si.bills !== "normal";
  var hasGas     = si.bills !== "normal"; // proxy for gas pressure
  var alreadySealed = si.alreadySealed === true;

  // Base adjustments keyed by recommendation ID
  var adj = {
    ductSealing:     0,
    smartThermostat: 0,
    roomSensors:     0,
    energyMonitor:   0,
    filterUpgrade:   0,
    atticInsulation: 0, // carried through to explanation only for now
  };

  switch(era) {
    case "A":
      // Strong era boost for duct sealing and thermostat
      adj.ductSealing     += alreadySealed ? -1 : 3;
      adj.smartThermostat += 2;
      adj.roomSensors     += 1;
      adj.filterUpgrade   += 1;
      adj.atticInsulation += 3; // for context line only
      break;
    case "B":
      adj.ductSealing     += alreadySealed ? -1 : 2;
      adj.smartThermostat += 2;
      adj.roomSensors     += 1;
      adj.atticInsulation += 2;
      break;
    case "C":
      adj.ductSealing     += alreadySealed ? -1 : 2;
      adj.smartThermostat += 1;
      adj.roomSensors     += (hasComfort || hasAirflow) ? 2 : 1;
      adj.atticInsulation += 1;
      break;
    case "D":
      adj.ductSealing     += alreadySealed ? -2 : (hasAirflow ? 1 : 0);
      adj.smartThermostat += 1;
      adj.roomSensors     += hasComfort ? 2 : 1;
      adj.energyMonitor   += 1;
      break;
    case "E":
      // Newer home: shift emphasis to balancing/sensors/controls
      adj.ductSealing     += alreadySealed ? -2 : (hasAirflow ? 0 : -1);
      adj.smartThermostat += si.thermostatType === "smart" ? -1 : 1;
      adj.roomSensors     += hasComfort ? 3 : 1;
      adj.energyMonitor   += 2;
      break;
    case "F":
      // Newest: only symptom-driven, era itself does not boost duct sealing
      adj.ductSealing     += alreadySealed ? -3 : (hasAirflow ? 0 : -2);
      adj.roomSensors     += hasComfort ? 3 : 0;
      adj.energyMonitor   += 2;
      adj.smartThermostat += si.thermostatType === "smart" ? -2 : 0;
      break;
    default:
      break;
  }
  return adj;
}

// ============================================================
// EFFICIENCY SCORE ENGINE
// ============================================================
function calculateEfficiencyScore(inputs) {
  var score = 100;

  // Comfort issues
  if (inputs.comfort === "some")  score -= 10;
  if (inputs.comfort === "major") score -= 20;

  // Energy bills
  if (inputs.bills === "slightly") score -= 10;
  if (inputs.bills === "much")     score -= 20;

  // Airflow
  if (inputs.airflow === "weak")      score -= 10;
  if (inputs.airflow === "veryWeak")  score -= 20;

  // Runtime
  if (inputs.runtime === "long")     score -= 10;
  if (inputs.runtime === "neverOff") score -= 20;

  // Upgrades
  if (inputs.upgrades === "none") score -= 15;

  // Dust
  if (inputs.dust === "some")   score -= 5;
  if (inputs.dust === "severe") score -= 10;

  // Unused rooms
  if (inputs.unusedRooms === "occasional") score -= 5;
  if (inputs.unusedRooms === "multiple")   score -= 10;

  // Thermostat
  if (inputs.hasThermostat === false) score -= 8;

  // Sensors
  if (inputs.sensors === "oneTwo") score -= 5;
  if (inputs.sensors === "none")   score -= 10;

  // Monitoring
  if (inputs.hasMonitoring === false) score -= 8;

  // HVAC age
  if (inputs.hvacAge === "5to10") score -= 5;
  if (inputs.hvacAge === "10plus") score -= 10;

  // Home era baseline penalty (probability-based, overridden by known upgrades)
  var era = getHomeEra(inputs.yearBuilt || 0);
  score -= getEraScorePenalty(era.era, inputs);

  return Math.max(0, Math.min(100, score));
}

function getEfficiencyBand(score) {
  if (score >= 85) return { label: "High Efficiency",  color: "#27D17F", bg: "rgba(39,209,127,0.10)",  wasteLow: 0.05, wasteHigh: 0.12 };
  if (score >= 70) return { label: "Moderate",         color: "#F5A623", bg: "rgba(245,166,35,0.10)",  wasteLow: 0.12, wasteHigh: 0.22 };
  if (score >= 50) return { label: "Low Efficiency",   color: "#2F80ED", bg: "rgba(47,128,237,0.10)",  wasteLow: 0.22, wasteHigh: 0.40 };
  return               { label: "Major Loss",          color: "#E05252", bg: "rgba(224,82,82,0.10)",   wasteLow: 0.40, wasteHigh: 0.55 };
}

// Waste calculation anchored to actual annual bill spend.
// monthlyBill is passed from homeProfile (or the example bill as fallback).
// The square footage is kept as a secondary floor so the number is never
// unreasonably small for very low-bill homes.
function calculateWaste(squareFeet, band, monthlyBill) {
  var annualFromBill  = (monthlyBill || 180) * 12;
  var annualFromSqFt  = squareFeet * 1.80; // ~$1.80/sqft/yr as a floor estimate
  var annualCost      = Math.max(annualFromBill, annualFromSqFt);
  return {
    annualLow:   Math.round(annualCost * band.wasteLow),
    annualHigh:  Math.round(annualCost * band.wasteHigh),
    monthlyLow:  Math.round((annualCost * band.wasteLow)  / 12),
    monthlyHigh: Math.round((annualCost * band.wasteHigh) / 12),
  };
}

function getTopIssues(inputs) {
  var issues = [];
  if (inputs.airflow === "veryWeak" || inputs.airflow === "weak") issues.push("Poor airflow to one or more rooms");
  if (inputs.comfort === "major" || inputs.comfort === "some")     issues.push("Inconsistent temperatures throughout home");
  if (inputs.bills === "much" || inputs.bills === "slightly")       issues.push("Energy bills higher than expected");
  if (inputs.runtime === "neverOff" || inputs.runtime === "long")   issues.push("HVAC system runs excessively long cycles");
  if (inputs.dust === "severe" || inputs.dust === "some")           issues.push("Dust and air quality concerns");
  if (inputs.upgrades === "none")                                    issues.push("No efficiency upgrades installed");
  return issues.slice(0, 4);
}

function getRecommendations(inputs) {
  var recs = [];
  // Priority order per spec
  if (inputs.airflow !== "fine")          recs.push({ priority: 1, label: "Duct Sealing (Airflow)", note: "Primary driver of comfort and efficiency loss." });
  if (!inputs.hasThermostat)              recs.push({ priority: 2, label: "Smart Thermostat",        note: "Precise control reduces unnecessary runtime." });
  if (inputs.sensors === "none" || inputs.sensors === "oneTwo")
                                          recs.push({ priority: 3, label: "Room Sensors",            note: "Identify hot and cold zones accurately." });
  if (!inputs.hasMonitoring)              recs.push({ priority: 4, label: "Energy Monitoring",       note: "Real-time visibility into consumption patterns." });
  if (inputs.hvacAge === "10plus")        recs.push({ priority: 5, label: "System Health Check",     note: "Aging equipment benefits from a full assessment." });
  return recs.slice(0, 5);
}

// ============================================================
// SAVINGS & RECOMMENDATION ENGINE
// Implements the spec: waste estimate, upgrade savings with
// diminishing returns, score improvement, payback period.
// All outputs are ranges -- never fake-precise single numbers.
// ============================================================

// Upgrade impact catalog
// savingsLow/High = % of HVAC-related annual spend
// scoreLow/High   = points added to efficiency score
//
// Recalibrated against real EG Comfort customer data: 3,700 sqft TX
// home with pool that received sealing + smart thermostat + sensors +
// plenum upgrade + variable-speed pool pump achieved ~45-55% reduction
// of HVAC-related annual spend (electric + gas combined).
var UPGRADE_IMPACTS = {
  ductSealing:       { savingsLow: 0.12, savingsHigh: 0.25, scoreLow: 6,  scoreHigh: 15, label: "Duct Sealing / Airflow Correction" },
  smartThermostat:   { savingsLow: 0.04, savingsHigh: 0.10, scoreLow: 3,  scoreHigh: 6,  label: "Smart Thermostat" },
  roomSensors:       { savingsLow: 0.03, savingsHigh: 0.07, scoreLow: 2,  scoreHigh: 5,  label: "Room Sensors" },
  filterUpgrade:     { savingsLow: 0.02, savingsHigh: 0.05, scoreLow: 1,  scoreHigh: 3,  label: "Filter / Plenum Upgrade" },
  energyMonitor:     { savingsLow: 0.01, savingsHigh: 0.05, scoreLow: 1,  scoreHigh: 4,  label: "Energy Monitor" },
  bootSealing:       { savingsLow: 0.03, savingsHigh: 0.08, scoreLow: 2,  scoreHigh: 5,  label: "Boot Sealing" },
  ductCleaning:      { savingsLow: 0.02, savingsHigh: 0.05, scoreLow: 1,  scoreHigh: 3,  label: "Duct Cleaning" },
  poolPump:          { savingsLow: 0.05, savingsHigh: 0.13, scoreLow: 2,  scoreHigh: 6,  label: "Variable-Speed Pool Pump" },
  hvacReplacement:   { savingsLow: 0.20, savingsHigh: 0.35, scoreLow: 12, scoreHigh: 22, label: "New HVAC System(s)" },
};

// Map package/addon IDs to upgrade impact keys
function getUpgradesForSelection(packageId, addons) {
  var upgrades = [];
  // Package-based upgrades
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
  // Active add-ons not already in package
  if (addons.thermostatPackage && upgrades.indexOf("smartThermostat") === -1) upgrades.push("smartThermostat");
  if (addons.emporiaMonitor    && upgrades.indexOf("energyMonitor")    === -1) upgrades.push("energyMonitor");
  if (addons.filterUpgrade     && upgrades.indexOf("filterUpgrade")    === -1) upgrades.push("filterUpgrade");
  if (addons.bootSealing       && upgrades.indexOf("bootSealing")      === -1) upgrades.push("bootSealing");
  if (addons.ductCleaning      && upgrades.indexOf("ductCleaning")     === -1) upgrades.push("ductCleaning");
  if (addons.poolPump          && upgrades.indexOf("poolPump")         === -1) upgrades.push("poolPump");
  if (addons.hvacReplacement   && upgrades.indexOf("hvacReplacement")  === -1) upgrades.push("hvacReplacement");
  return upgrades;
}

// HVAC share of total bill (50-65% depending on home conditions).
// Calibrated for Texas where AC dominates summer and heating runs
// hard in winter -- HVAC routinely accounts for over half of total
// utility spend in single-family homes here.
function getHvacShare(scoreInputs) {
  var base = 0.50;
  if (scoreInputs.runtime === "neverOff") base = 0.65;
  if (scoreInputs.runtime === "long")     base = 0.58;
  if (scoreInputs.airflow === "veryWeak") base = Math.min(0.65, base + 0.05);
  if (scoreInputs.comfort === "major")    base = Math.min(0.65, base + 0.03);
  return base;
}

// Main savings engine
function calculateSavingsProjection(score, homeProfile, scoreInputs, packageId, addons) {
  var elec = parseFloat(homeProfile.electricBill) || 0;
  var gas  = parseFloat(homeProfile.gasBill)     || 0;
  var monthlyBill = (elec + gas) > 0 ? (elec + gas) : (parseFloat(homeProfile.monthlyBill) || 180);
  var sqft        = parseFloat(homeProfile.squareFeet)  || 2000;
  var annualBill  = monthlyBill * 12;
  var annualFloor = sqft * 1.80;
  var annualTotal = Math.max(annualBill, annualFloor);
  var hvacShare   = getHvacShare(scoreInputs);
  var hvacAnnual  = annualTotal * hvacShare;

  // Current waste range based on score band
  var band = getEfficiencyBand(score);
  var wasteLow  = Math.round(hvacAnnual * band.wasteLow);
  var wasteHigh = Math.round(hvacAnnual * band.wasteHigh);

  // Tier label mapped to spec
  var tier;
  if (score >= 90)      tier = "High Performing";
  else if (score >= 75) tier = "Good — Room to Improve";
  else if (score >= 60) tier = "Moderate Inefficiency";
  else                  tier = "Significant Performance Loss";

  // Plain-English explanation
  var explanation;
  if (score >= 90) {
    explanation = "This home is performing well. Energy use is close to optimal for the systems in place. Minor improvements may still offer incremental gains in comfort and control.";
  } else if (score >= 75) {
    explanation = "This home has a solid foundation but has measurable inefficiencies. Targeted upgrades could improve comfort noticeably and reduce energy waste by an estimated " + Math.round(band.wasteLow * 100) + "% to " + Math.round(band.wasteHigh * 100) + "% of current HVAC spend.";
  } else if (score >= 60) {
    explanation = "This home is showing moderate signs of energy loss — likely through duct leakage, poor airflow distribution, or limited control. The estimated waste represents real dollars that improvements could recover.";
  } else {
    explanation = "This home has significant efficiency gaps. Duct leakage, poor airflow, and limited system control are likely costing the homeowner considerably more than necessary each month. This profile responds well to targeted upgrades.";
  }

  // Upgrade savings with diminishing returns
  var upgrades = getUpgradesForSelection(packageId, addons);

  // Group overlapping categories for diminishing returns
  var controlGroup = ["smartThermostat", "roomSensors"];     // control/scheduling overlap
  var airflowGroup = ["ductSealing", "bootSealing", "ductCleaning", "filterUpgrade"]; // delivery overlap

  var savingsLowTotal  = 0;
  var savingsHighTotal = 0;
  var scoreLowTotal    = 0;
  var scoreHighTotal   = 0;
  var controlCount     = 0;
  var airflowCount     = 0;
  var upgradeDetails   = [];

  upgrades.forEach(function(uid) {
    var u = UPGRADE_IMPACTS[uid];
    if (!u) return;

    var multiplier = 1.0;
    // Apply diminishing returns within groups (less aggressive --
    // real-world data shows stacked upgrades retain more value)
    if (controlGroup.indexOf(uid) > -1) {
      controlCount++;
      if (controlCount === 2) multiplier = 0.7;
      if (controlCount >= 3) multiplier = 0.5;
    }
    if (airflowGroup.indexOf(uid) > -1) {
      airflowCount++;
      if (airflowCount === 2) multiplier = 0.75;
      if (airflowCount === 3) multiplier = 0.55;
      if (airflowCount >= 4)  multiplier = 0.35;
    }

    var sl = hvacAnnual * u.savingsLow  * multiplier;
    var sh = hvacAnnual * u.savingsHigh * multiplier;
    savingsLowTotal  += sl;
    savingsHighTotal += sh;
    scoreLowTotal    += u.scoreLow;
    scoreHighTotal   += u.scoreHigh;

    upgradeDetails.push({
      label:       u.label,
      savingsLow:  Math.round(sl),
      savingsHigh: Math.round(sh),
      scoreLow:    u.scoreLow,
      scoreHigh:   u.scoreHigh,
      multiplier:  multiplier,
    });
  });

  // Cap savings at current waste (can't save more than you're wasting)
  savingsLowTotal  = Math.min(Math.round(savingsLowTotal),  wasteHigh);
  savingsHighTotal = Math.min(Math.round(savingsHighTotal), wasteHigh);

  // Projected score (capped at 97 -- no home is perfect)
  var projScoreLow  = Math.min(99, score + scoreLowTotal);
  var projScoreHigh = Math.min(99, score + scoreHighTotal);

  // Payback period using package subtotal
  var pkgPrice = getBasePrice(packageId) + addonTotal(packageId, addons, homeProfile.systemCount || 1);
  var paybackLow  = savingsHighTotal > 0 ? (pkgPrice / savingsHighTotal).toFixed(1) : null;
  var paybackHigh = savingsLowTotal  > 0 ? (pkgPrice / savingsLowTotal).toFixed(1)  : null;

  // Mid-point for representative monthly figure
  var monthlyLow  = Math.round(savingsLowTotal  / 12);
  var monthlyHigh = Math.round(savingsHighTotal / 12);

  return {
    score,
    tier,
    explanation,
    wasteLow,
    wasteHigh,
    monthlyWasteLow:  Math.round(wasteLow  / 12),
    monthlyWasteHigh: Math.round(wasteHigh / 12),
    savingsLow:  savingsLowTotal,
    savingsHigh: savingsHighTotal,
    monthlyLow,
    monthlyHigh,
    projScoreLow,
    projScoreHigh,
    paybackLow,
    paybackHigh,
    upgradeDetails,
    pkgPrice,
    hvacShare,
    annualTotal,
  };
}

// ============================================================
// DUAL-UTILITY SAVINGS ENGINE
// Splits savings across electric and gas separately.
// Each upgrade has electric_pct and gas_pct of its total impact.
// ============================================================

// Heating/cooling split by system type
function getUtilitySplit(scoreInputs) {
  var sysType = scoreInputs.systemType || "mixed";
  // electricPct = share of HVAC energy that is electric (cooling dominant)
  // gasPct      = share that is gas (heating dominant)
  if (sysType === "allElectric") return { e: 0.85, g: 0.15 };
  if (sysType === "gasFurnace")  return { e: 0.45, g: 0.55 };
  return { e: 0.55, g: 0.45 }; // mixed / heat pump default
}

// How much of each upgrade's savings goes to electric vs gas
var UPGRADE_UTILITY_SPLIT = {
  ductSealing:     { e: 0.50, g: 0.50 }, // affects both equally -- leakage in both seasons
  smartThermostat: { e: 0.50, g: 0.50 }, // schedules both heating and cooling
  roomSensors:     { e: 0.50, g: 0.50 }, // balance affects both seasons
  filterUpgrade:   { e: 0.60, g: 0.40 }, // slightly more cooling-side impact
  energyMonitor:   { e: 0.70, g: 0.30 }, // more behavioral on electric side
  bootSealing:     { e: 0.50, g: 0.50 },
  ductCleaning:    { e: 0.55, g: 0.45 },
  poolPump:        { e: 1.00, g: 0.00 }, // pool pump is electric only
  hvacReplacement: { e: 0.55, g: 0.45 }, // balanced — actual split varies by system type
};

function calculateDualUtilitySavings(score, homeProfile, scoreInputs, packageId, addons) {
  var elecMonthly = parseFloat(homeProfile.electricBill) || 0;
  var gasMonthly  = parseFloat(homeProfile.gasBill)     || 0;
  var bothProvided = elecMonthly > 0 && gasMonthly > 0;

  // Fall back to legacy single-bill mode if needed
  var totalMonthly = (elecMonthly + gasMonthly) > 0
    ? (elecMonthly + gasMonthly)
    : (parseFloat(homeProfile.monthlyBill) || 180);

  var elecAnnual = elecMonthly > 0 ? elecMonthly * 12 : totalMonthly * 12 * 0.55;
  var gasAnnual  = gasMonthly  > 0 ? gasMonthly  * 12 : totalMonthly * 12 * 0.45;
  var sqft       = parseFloat(homeProfile.squareFeet) || 2000;

  // Apply sqft floors
  var floorTotal = sqft * 1.80;
  if ((elecAnnual + gasAnnual) < floorTotal) {
    var ratio = floorTotal / (elecAnnual + gasAnnual || 1);
    elecAnnual = Math.round(elecAnnual * ratio);
    gasAnnual  = Math.round(gasAnnual  * ratio);
  }

  var hvacShare  = getHvacShare(scoreInputs);
  var split      = getUtilitySplit(scoreInputs);
  var hvacElec   = Math.round(elecAnnual * hvacShare * split.e + gasAnnual * hvacShare * (1 - split.g));
  var hvacGas    = Math.round(gasAnnual  * hvacShare * split.g + elecAnnual * hvacShare * (1 - split.e));
  // Simpler and more accurate: just apply hvacShare to each utility
  hvacElec = Math.round(elecAnnual * hvacShare);
  hvacGas  = Math.round(gasAnnual  * hvacShare);

  var band = getEfficiencyBand(score);

  // Waste by utility
  var elecWasteLow  = Math.round(hvacElec * band.wasteLow);
  var elecWasteHigh = Math.round(hvacElec * band.wasteHigh);
  var gasWasteLow   = Math.round(hvacGas  * band.wasteLow);
  var gasWasteHigh  = Math.round(hvacGas  * band.wasteHigh);

  // Upgrade savings split by utility
  var upgrades = getUpgradesForSelection(packageId, addons);
  var controlCount = 0; var airflowCount = 0;
  var controlGroup = ["smartThermostat", "roomSensors"];
  var airflowGroup = ["ductSealing", "bootSealing", "ductCleaning", "filterUpgrade"];

  var elecSavLow = 0; var elecSavHigh = 0;
  var gasSavLow  = 0; var gasSavHigh  = 0;
  var scoreLow   = 0; var scoreHigh   = 0;

  upgrades.forEach(function(uid) {
    var u  = UPGRADE_IMPACTS[uid];
    var us = UPGRADE_UTILITY_SPLIT[uid] || { e: 0.5, g: 0.5 };
    if (!u) return;
    var mult = 1.0;
    if (controlGroup.indexOf(uid) > -1) { controlCount++; if (controlCount === 2) mult = 0.7; if (controlCount >= 3) mult = 0.5; }
    if (airflowGroup.indexOf(uid) > -1) {
      airflowCount++;
      if (airflowCount === 2) mult = 0.75;
      if (airflowCount === 3) mult = 0.55;
      if (airflowCount >= 4)  mult = 0.35;
    }
    var hvacTotal = hvacElec + hvacGas;
    var sl = hvacTotal * u.savingsLow  * mult;
    var sh = hvacTotal * u.savingsHigh * mult;
    elecSavLow  += sl * us.e;
    elecSavHigh += sh * us.e;
    gasSavLow   += sl * us.g;
    gasSavHigh  += sh * us.g;
    scoreLow  += u.scoreLow;
    scoreHigh += u.scoreHigh;
  });

  // Cap at waste
  elecSavLow  = Math.min(Math.round(elecSavLow),  elecWasteHigh);
  elecSavHigh = Math.min(Math.round(elecSavHigh), elecWasteHigh);
  gasSavLow   = Math.min(Math.round(gasSavLow),   gasWasteHigh);
  gasSavHigh  = Math.min(Math.round(gasSavHigh),  gasWasteHigh);

  var combLow  = elecSavLow  + gasSavLow;
  var combHigh = elecSavHigh + gasSavHigh;
  var projScoreLow  = Math.min(99, score + scoreLow);
  var projScoreHigh = Math.min(99, score + scoreHigh);
  var pkgCost = getBasePrice(packageId) + addonTotal(packageId, addons, homeProfile.systemCount || 1);
  var paybackLow  = combHigh > 0 ? (pkgCost / combHigh).toFixed(1) : null;
  var paybackHigh = combLow  > 0 ? (pkgCost / combLow).toFixed(1)  : null;

  return {
    elecAnnual, gasAnnual, hvacElec, hvacGas,
    elecWasteLow, elecWasteHigh, gasWasteLow, gasWasteHigh,
    elecSavLow, elecSavHigh,
    gasSavLow,  gasSavHigh,
    combLow, combHigh,
    monthlyLow:  Math.round(combLow  / 12),
    monthlyHigh: Math.round(combHigh / 12),
    projScoreLow, projScoreHigh, scoreLow, scoreHigh,
    paybackLow, paybackHigh, pkgCost,
    bothProvided,
    hvacShare,
  };
}

// Live recommendation engine -- builds cards dynamically from scoreInputs
function buildLiveRecommendations(scoreInputs, homeProfile) {
  var si = scoreInputs;
  var gasMonthly  = parseFloat(homeProfile.gasBill) || 0;
  var elecMonthly = parseFloat(homeProfile.electricBill) || 0;
  var hasGas      = gasMonthly > 0;
  var hasElec     = elecMonthly > 0;

  // Era-based adjustments -- applied on top of symptom weights
  var era    = getHomeEra(homeProfile.yearBuilt || si.yearBuilt || 0);
  var eraAdj = getEraWeightAdjustments(era.era, si);

  var recs = [];

  // 1. Duct Sealing
  var ductWeight = 0;
  if (si.airflow === "weak" || si.airflow === "veryWeak") ductWeight += 3;
  if (si.comfort === "major") ductWeight += 2;
  if (si.comfort === "some")  ductWeight += 1;
  if (si.runtime === "neverOff" || si.runtime === "long") ductWeight += 1;
  if (si.upgrades === "none") ductWeight += 1;
  if (si.alreadySealed === true) ductWeight -= 3;
  ductWeight += eraAdj.ductSealing; // era-based boost or reduction
  if (ductWeight >= 2) {
    var conf = ductWeight >= 5 ? "Strong Match" : ductWeight >= 3 ? "Likely Helpful" : "Optional";
    // Era-sensitive "why it fits" line
    var ductWhy;
    if (si.airflow === "veryWeak") {
      ductWhy = "Severely weak airflow is a strong indicator of significant duct leakage. Sealing could materially improve delivery to affected rooms.";
    } else if (era.era === "A" || era.era === "B") {
      ductWhy = "Homes from this era commonly have duct systems built before modern leakage standards. Sealing is one of the highest-return improvements available at this age.";
    } else if (era.era === "C") {
      ductWhy = "Homes built between 1990 and 2005 still regularly show duct leakage that contributes to comfort issues and higher bills. The symptoms you have described support this as a priority.";
    } else if (era.era === "E" || era.era === "F") {
      ductWhy = "Even in newer homes, duct routing and connection quality can vary. Your reported symptoms suggest a verification test is worth doing before assuming the system is tight.";
    } else {
      ductWhy = si.comfort !== "fine"
        ? "Uneven temperatures and comfort complaints are common signs that conditioned air is escaping before reaching rooms."
        : "The home profile suggests duct leakage may be contributing to higher bills and system strain.";
    }
    recs.push({
      id: "ductSealing", priority: 1, confidence: conf, weight: ductWeight,
      name: "Duct Sealing (Aeroseal)",
      what: "Seals leaks inside the duct system from the inside using a pressurized sealant mist — no demolition required.",
      why: ductWhy,
      impact: { comfort: "High", control: "Moderate", electric: hasElec ? "High" : "Moderate", gas: hasGas ? "High" : "Moderate" },
      detail: "Duct sealing addresses the delivery system rather than the equipment. When leaks are sealed, more of the heated or cooled air you pay to produce actually reaches the rooms — reducing waste in both heating and cooling seasons.",
    });
  }

  // 2. Smart Thermostat
  var tstatWeight = 0;
  if (si.hasThermostat === false) tstatWeight += 4;
  if (si.thermostatType === "basic" || si.thermostatType === "manual") tstatWeight += 3;
  if (si.runtime === "long" || si.runtime === "neverOff") tstatWeight += 2;
  if (si.bills === "much" || si.bills === "slightly") tstatWeight += 1;
  if (si.hasThermostat === true && si.thermostatType === "smart") tstatWeight -= 3;
  tstatWeight += eraAdj.smartThermostat; // era-based boost
  if (tstatWeight >= 2) {
    var tconf = tstatWeight >= 5 ? "Strong Match" : tstatWeight >= 3 ? "Likely Helpful" : "Optional";
    var tstatWhy;
    if (si.hasThermostat === false) {
      tstatWhy = "Without a smart thermostat, the system likely runs at full demand even when it does not need to -- particularly overnight and during unoccupied periods.";
    } else if (era.era === "A" || era.era === "B") {
      tstatWhy = "Older homes with basic or manual thermostats tend to lose meaningful energy through poor scheduling and lack of setback control. A modern thermostat is one of the faster payback improvements available here.";
    } else {
      tstatWhy = "A thermostat upgrade could reduce unnecessary runtime and give the homeowner better visibility into usage patterns.";
    }
    recs.push({
      id: "smartThermostat", priority: 2, confidence: tconf, weight: tstatWeight,
      name: "Smart Thermostat",
      what: "Automates temperature scheduling, setbacks during unoccupied hours, and remote control from a phone or app.",
      why: tstatWhy,
      impact: { comfort: "Moderate", control: "High", electric: "Moderate", gas: hasGas ? "Moderate" : "Low" },
      detail: "Smart thermostats learn usage patterns and optimize cycles across heating and cooling seasons. The impact on gas tends to be meaningful in homes where furnace runtime is longer than necessary.",
    });
  }

  // 3. Room Sensors
  var sensWeight = 0;
  if (si.sensors === "none") sensWeight += 3;
  if (si.sensors === "oneTwo") sensWeight += 1;
  if (si.comfort === "major" || si.unusedRooms === "multiple") sensWeight += 2;
  if (si.airflow === "weak" || si.airflow === "veryWeak") sensWeight += 1;
  sensWeight += eraAdj.roomSensors; // newer homes get a boost when comfort issues exist
  if (sensWeight >= 2) {
    var sconf = sensWeight >= 5 ? "Strong Match" : sensWeight >= 3 ? "Likely Helpful" : "Optional";
    var sensWhy;
    if (era.era === "E" || era.era === "F") {
      sensWhy = "In a newer home like this, room-level comfort issues are more often about sensor gaps and control strategy than about the envelope. Sensors are typically a high-value fix in this era.";
    } else if (si.comfort !== "fine") {
      sensWhy = "Hot and cold spots between rooms typically indicate airflow imbalance. Sensors help identify which areas are underserved and give the control system better data.";
    } else {
      sensWhy = "Adding sensors to a home with multiple systems or unused zones can meaningfully improve temperature distribution.";
    }
    recs.push({
      id: "roomSensors", priority: 3, confidence: sconf, weight: sensWeight,
      name: "Room Sensors",
      what: "Measures actual temperature in multiple zones and reports imbalances to the thermostat for more accurate control.",
      why: sensWhy,
      impact: { comfort: "High", control: "High", electric: "Moderate", gas: "Low" },
      detail: "Room sensors work alongside a smart thermostat to average temperatures across occupied zones rather than relying on a single wall unit. They are especially effective in multi-story or multi-system homes.",
    });
  }

  // 4. Energy Monitor
  var monWeight = 0;
  if (si.hasMonitoring === false) monWeight += 2;
  if (si.bills === "much") monWeight += 2;
  if (si.bills === "slightly") monWeight += 1;
  monWeight += eraAdj.energyMonitor; // newer homes benefit more from visibility
  if (monWeight >= 2) {
    recs.push({
      id: "energyMonitor", priority: 4, confidence: "Likely Helpful", weight: monWeight,
      name: "Whole-Home Energy Monitor",
      what: "Tracks energy consumption in real time at the circuit level, identifying patterns and unusual usage spikes.",
      why: si.bills === "much"
        ? "When bills are running higher than expected and the cause is unclear, monitoring tools can pinpoint which systems or circuits are driving the excess."
        : "A monitoring system gives the homeowner ongoing visibility so improvements can be measured and sustained over time.",
      impact: { comfort: "Low", control: "High", electric: "Moderate", gas: "Low" },
      detail: "Energy monitoring is primarily a visibility and behavioral tool rather than a direct mechanical improvement. Typical savings come from identifying standby loads, inefficient cycles, and usage patterns that can be changed.",
    });
  }

  // 5. Filter / Airflow
  var filterWeight = 0;
  if (si.dust === "severe") filterWeight += 3;
  if (si.dust === "some") filterWeight += 1;
  if (si.airflow === "weak" || si.airflow === "veryWeak") filterWeight += 1;
  if (si.hvacAge === "10plus") filterWeight += 1;
  filterWeight += eraAdj.filterUpgrade;
  if (filterWeight >= 2) {
    recs.push({
      id: "filterUpgrade", priority: 5, confidence: filterWeight >= 3 ? "Strong Match" : "Likely Helpful", weight: filterWeight,
      name: "Filter and Airflow Upgrade",
      what: "Replaces restrictive or undersized filter assemblies with higher-flow configurations to reduce strain on the air handler.",
      why: si.dust === "severe"
        ? "Severe dust accumulation often indicates a combination of poor filtration and duct leakage. Correcting the filter assembly reduces system strain and improves air quality."
        : "Improving filtration and filter sizing can restore airflow that has gradually degraded over time.",
      impact: { comfort: "Moderate", control: "Low", electric: "Moderate", gas: "Moderate" },
      detail: "Restrictive filters force the air handler to work harder, increasing energy consumption without improving air quality. Proper sizing and media selection balances filtration performance with airflow efficiency.",
    });
  }

  // 6. New HVAC System(s) -- highest-impact but also highest-cost upgrade.
  // Recommended only when there are strong signals (aging equipment +
  // performance issues), since the investment is significant.
  var hvacWeight = 0;
  if (si.hvacAge === "10plus")    hvacWeight += 4;
  if (si.runtime === "neverOff")  hvacWeight += 2;
  if (si.runtime === "long")      hvacWeight += 1;
  if (si.bills === "much")        hvacWeight += 2;
  if (si.comfort === "major")     hvacWeight += 1;
  // Higher threshold than other recs -- only surface when the case is real
  if (hvacWeight >= 5) {
    var hconf = hvacWeight >= 9 ? "Strong Match" : hvacWeight >= 7 ? "Likely Helpful" : "Consider";
    var hvacWhy;
    if (si.hvacAge === "10plus" && (si.runtime === "neverOff" || si.bills === "much")) {
      hvacWhy = "Equipment over 10 years old combined with the performance signals reported here suggests replacement may be more cost-effective than continuing to operate aging units. Often qualifies for utility rebates and federal tax credits that can offset 10-30% of the cost.";
    } else if (si.hvacAge === "10plus") {
      hvacWhy = "HVAC equipment over 10 years old typically operates at 60-75% of the efficiency of modern systems. Worth pricing out if you're planning major upgrades anyway -- often qualifies for utility rebates and federal tax credits.";
    } else {
      hvacWhy = "Worth pricing out if other improvements alone do not deliver enough relief. Should be considered alongside, not instead of, sealing and control upgrades, which have much faster paybacks.";
    }
    recs.push({
      id: "hvacReplacement", priority: 6, confidence: hconf, weight: hvacWeight,
      name: "New HVAC System(s)",
      what: "Replace aging HVAC equipment with modern high-efficiency systems (SEER 16-22) that use 30-50% less energy.",
      why: hvacWhy,
      impact: { comfort: "High", control: "Moderate", electric: "High", gas: "High" },
      detail: "Modern equipment carries SEER ratings of 16-22 vs 8-12 for systems 10+ years old. Combined with proper duct sealing, this delivers the largest single improvement available -- typically 20-35% reduction in HVAC-related energy spend. However, the upfront cost is significantly higher than other improvements, so it makes the most sense paired with rebates/tax credits or when the existing equipment is near end-of-life.",
      cost: "$5,500 – $50,000+",
      costNote: "Major investment. Ranges from a single AC ($5,500) to four premium full systems ($42,000+). May qualify for utility rebates and federal tax credits.",
      costTone: "warning",
    });
  }

  // Attach cost info to all other recs (HVAC already has its own above)
  recs.forEach(function(r) {
    if (r.cost) return;
    if (r.id === "ductSealing")     { r.cost = "Included";          r.costNote = "Bundled in every EG Comfort package -- no add-on cost."; }
    if (r.id === "smartThermostat") { r.cost = "$900 – $2,000";     r.costNote = "Per system, depending on thermostat tier and install complexity."; }
    if (r.id === "roomSensors")     { r.cost = "$255 – $425";       r.costNote = "$85 per sensor; typical install is 3-5 sensors."; }
    if (r.id === "energyMonitor")   { r.cost = "$600 – $1,800";     r.costNote = "$600 per electrical panel (hardware + install)."; }
    if (r.id === "filterUpgrade")   { r.cost = "$850 – $3,000";     r.costNote = "Per system, depending on cabinet complexity."; }
  });

  // Sort by weight descending
  recs.sort(function(a, b) { return b.weight - a.weight; });
  return recs;
}

// Sub-scores for heating / cooling / control efficiency
function calculateSubScores(scoreInputs) {
  var heating = 100;
  var cooling = 100;
  var control = 100;

  // Heating sub-score
  if (scoreInputs.airflow === "veryWeak") heating -= 25;
  if (scoreInputs.airflow === "weak")     heating -= 12;
  if (scoreInputs.runtime === "neverOff") heating -= 20;
  if (scoreInputs.runtime === "long")     heating -= 10;
  if (scoreInputs.hvacAge === "10plus")   heating -= 15;
  if (scoreInputs.hvacAge === "5to10")    heating -= 7;
  if (scoreInputs.upgrades === "none")    heating -= 10;

  // Cooling sub-score
  if (scoreInputs.comfort === "major")    cooling -= 20;
  if (scoreInputs.comfort === "some")     cooling -= 10;
  if (scoreInputs.unusedRooms === "multiple")  cooling -= 10;
  if (scoreInputs.unusedRooms === "occasional") cooling -= 5;
  if (scoreInputs.airflow === "veryWeak") cooling -= 20;
  if (scoreInputs.airflow === "weak")     cooling -= 10;
  if (scoreInputs.bills === "much")       cooling -= 10;
  if (scoreInputs.bills === "slightly")   cooling -= 5;

  // Control sub-score
  if (scoreInputs.hasThermostat === false)  control -= 20;
  if (scoreInputs.sensors === "none")       control -= 20;
  if (scoreInputs.sensors === "oneTwo")     control -= 10;
  if (scoreInputs.hasMonitoring === false)  control -= 15;
  if (scoreInputs.thermostatType === "manual") control -= 10;
  if (scoreInputs.thermostatType === "basic")  control -= 5;

  return {
    heating: Math.max(0, Math.min(100, heating)),
    cooling: Math.max(0, Math.min(100, cooling)),
    control: Math.max(0, Math.min(100, control)),
  };
}

// Live score explanation based on combination of inputs + home era
function getLiveExplanation(score, scoreInputs, homeProfile) {
  var issues = [];
  if (scoreInputs.airflow !== "fine") issues.push("airflow imbalance");
  if (!scoreInputs.hasThermostat)     issues.push("limited scheduling control");
  if (scoreInputs.runtime === "neverOff" || scoreInputs.runtime === "long") issues.push("excessive system runtime");
  if (scoreInputs.comfort !== "fine") issues.push("inconsistent room temperatures");
  if (scoreInputs.bills !== "normal") issues.push("above-expected utility costs");

  // Era context prepended when a year is known
  var era        = getHomeEra(homeProfile.yearBuilt || 0);
  var eraLine    = getEraContextLine(era.era, homeProfile.yearBuilt, scoreInputs);
  var hasEraLine = era.era !== "X";

  var symptomLine;
  if (score >= 85) {
    symptomLine = "The inputs suggest a reasonably efficient system with limited waste. There may be incremental improvements available in comfort and control.";
  } else if (issues.length === 0) {
    symptomLine = "Continue filling in the comfort and bill questions to generate a personalized efficiency assessment.";
  } else if (issues.length === 1) {
    symptomLine = "Your answers suggest the home may have " + issues[0] + ". Targeted improvements in this area could help recover some of the estimated waste.";
  } else {
    symptomLine = "Your answers suggest the home is likely losing efficiency through " + issues.slice(0, 2).join(" and ") + ". These issues tend to compound each other and typically respond well to the improvements shown below.";
  }

  return hasEraLine ? (eraLine + " " + symptomLine) : symptomLine;
}

// ============================================================
// FINANCING ENGINE
// Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
// ============================================================
function calculatePayment(subtotal, months, apr) {
  if (months === 0) {
    return { monthly: subtotal, totalPaid: subtotal, financeCharge: 0 };
  }
  if (apr === 0) {
    var mo = Math.round((subtotal / months) * 100) / 100;
    return { monthly: mo, totalPaid: Math.round(mo * months * 100) / 100, financeCharge: 0 };
  }
  var r  = apr / 12;
  var n  = months;
  var mo = subtotal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  mo = Math.round(mo * 100) / 100;
  var total = Math.round(mo * n * 100) / 100;
  return { monthly: mo, totalPaid: total, financeCharge: Math.round((total - subtotal) * 100) / 100 };
}

function calculateSavingsScenarios(monthlyBill) {
  return [
    { label: "Conservative", pct: "15%", mo: Math.round(monthlyBill * 0.15 * 100) / 100 },
    { label: "Moderate",     pct: "25%", mo: Math.round(monthlyBill * 0.25 * 100) / 100 },
    { label: "Strong",       pct: "35%", mo: Math.round(monthlyBill * 0.35 * 100) / 100 },
  ];
}

// Engine-driven payoff scenarios. Pulls the actual annual savings range
// produced by the savings/score engine for the customer's selected
// package + add-ons (which is itself calibrated against real EG Comfort
// customer outcomes). Returns three points in that range so the close /
// summary screens can show conservative / expected / strong payoffs
// that genuinely reflect the additions made to the system.
function buildEngineScenarios(savingsLowAnnual, savingsHighAnnual) {
  if (!(savingsLowAnnual > 0) || !(savingsHighAnnual > 0)) return [];
  var mid = Math.round((savingsLowAnnual + savingsHighAnnual) / 2);
  return [
    { label: "Conservative", note: "low end of projected range",  annual: savingsLowAnnual,  mo: Math.round(savingsLowAnnual / 12) },
    { label: "Expected",     note: "midpoint of projected range", annual: mid,                mo: Math.round(mid / 12) },
    { label: "Strong",       note: "high end of projected range", annual: savingsHighAnnual, mo: Math.round(savingsHighAnnual / 12) },
  ];
}

// Returns combined monthly bill from homeProfile -- always use this instead of homeProfile.monthlyBill
function getCombinedBill(homeProfile) {
  var elec = parseFloat(homeProfile.electricBill) || 0;
  var gas  = parseFloat(homeProfile.gasBill)      || 0;
  if (elec + gas > 0) return elec + gas;
  return parseFloat(homeProfile.monthlyBill) || CONFIG.exampleBill.monthlyBill;
}

function payoffMonths(total, monthly) {
  if (!monthly || monthly <= 0) return null;
  return Math.round(total / monthly);
}
function payoffYears(months) {
  if (months === null) return null;
  return (months / 12).toFixed(1);
}

// ============================================================
// PACKAGE / ADDON HELPERS
// ============================================================
function getBasePrice(pid) { return CONFIG.packages[pid] ? CONFIG.packages[pid].price : 0; }
function getIncluded(pid)  { return CONFIG.packages[pid] ? CONFIG.packages[pid].includedAddons : []; }
function addonIncluded(pid, aid) { return getIncluded(pid).indexOf(aid) > -1; }
function visibleAddons(hasPool) { return Object.values(CONFIG.addons).filter(function(a) { return !a.poolOnly || hasPool; }); }

// homeSize: "small" | "medium" | "large" -- derived from squareFeet
function getHomeSize(sqft) {
  if (!sqft || sqft < 2000) return "small";
  if (sqft < 3500) return "medium";
  return "large";
}

// Estimated Texas year-round average residential utility bills.
// Based on typical TX residential rates ($0.13-$0.14/kWh electric,
// ~$1.20/CCF gas) and average usage scaled to home size.
// Pool adds ~$70/month averaged across the year (heavy summer load).
// Used for placeholder/helper text only -- actual bills should be
// entered when known.
function estimateTexasBills(sqft, hasPool) {
  var s = parseFloat(sqft) || 2000;
  var electric;
  if (s < 1500)      electric = 120;
  else if (s < 2500) electric = 160;
  else if (s < 3500) electric = 210;
  else if (s < 4500) electric = 260;
  else               electric = 320;
  if (hasPool) electric += 70;

  var gas;
  if (s < 1500)      gas = 50;
  else if (s < 2500) gas = 70;
  else if (s < 3500) gas = 90;
  else if (s < 4500) gas = 110;
  else               gas = 135;

  return { electric: electric, gas: gas };
}

// Full pricing engine -- calculates each addon dynamically from homeProfile + addonConfig
// addonConfig is the per-addon object from the addonConfigs state (thermostatType, pumpType etc)
function calculateAddonPrice(aid, homeProfile, addonConfigs) {
  var a = CONFIG.addons[aid];
  if (!a) return 0;
  var sys  = homeProfile.systemCount || 1;
  var sqft = homeProfile.squareFeet || 2000;
  var cfg  = addonConfigs || {};

  if (aid === "ductCleaning") {
    var size = getHomeSize(sqft);
    var mult = a.sizeMultipliers[size] || 1.0;
    var raw  = Math.round(a.basePrice * mult);
    return Math.max(a.minPrice, Math.min(a.maxPrice, raw));
  }

  if (aid === "bootSealing") {
    var raw = a.pricePerSystem * sys;
    return Math.max(a.minPrice, Math.min(a.maxPrice, raw));
  }

  if (aid === "emporiaMonitor") {
    var panels = cfg.panelCount || 1;
    var perPanel = a.basePricePerPanel + a.installPerPanel;
    var raw = panels * perPanel;
    return Math.round(Math.max(panels * a.minPricePerPanel, Math.min(panels * a.maxPricePerPanel, raw)));
  }

  if (aid === "thermostatPackage") {
    var tType   = cfg.thermostatType   || a.defaultType;
    var tInstall = cfg.thermostatInstall || a.defaultInstall;
    var sensors  = (cfg.sensorCount != null) ? cfg.sensorCount : a.defaultSensors;
    var tBase    = a.types[tType]    || a.types[a.defaultType];
    var tInst    = a.install[tInstall] || a.install[a.defaultInstall];
    var sysTotal = sys * (tBase + tInst);
    var sensorTotal = sensors * a.sensorPrice;
    var raw = sysTotal + sensorTotal;
    return Math.max(a.minPrice, Math.min(a.maxPrice, Math.round(raw)));
  }

  if (aid === "filterUpgrade") {
    var complexity = cfg.filterComplexity || a.defaultComplexity;
    var adj = a.complexityAdj[complexity] || 0;
    var raw = sys * (a.pricePerSystem + adj);
    return Math.max(a.minPrice, Math.min(a.maxPrice, Math.round(raw)));
  }

  if (aid === "poolPump") {
    var pType   = cfg.pumpType    || a.defaultType;
    var pInstall = cfg.pumpInstall  || a.defaultInstall;
    var pSize    = cfg.poolSize     || a.defaultPoolSize;
    var pBase    = a.types[pType]   || a.types[a.defaultType];
    var pInst    = a.install[pInstall] || a.install[a.defaultInstall];
    var pMult    = a.sizeMultipliers[pSize] || 1.0;
    var raw = Math.round((pBase + pInst) * pMult);
    return Math.max(a.minPrice, Math.min(a.maxPrice, raw));
  }

  if (aid === "hvacReplacement") {
    var hType  = cfg.hvacType  || a.defaultType;
    var hTier  = cfg.hvacTier  || a.defaultTier;
    var hCount = cfg.hvacCount != null ? cfg.hvacCount : sys;
    var hBase  = a.types[hType] || a.types[a.defaultType];
    var hMult  = a.tierMultipliers[hTier] || 1.0;
    var raw    = Math.round(hBase * hMult * hCount);
    return Math.max(a.minPrice, Math.min(a.maxPrice, raw));
  }

  return 0;
}

// Legacy simple price used in package total when addonConfigs not available
function addonPrice(aid, sys) {
  var a = CONFIG.addons[aid];
  if (!a) return 0;
  // Use default config values for a reasonable static fallback
  if (aid === "bootSealing")     return (a.pricePerSystem || 299) * sys;
  if (aid === "filterUpgrade")   return (a.pricePerSystem || 850) * sys;
  if (aid === "ductCleaning")    return a.basePrice || 650;
  if (aid === "emporiaMonitor")  return (a.basePricePerPanel + a.installPerPanel) || 600;
  if (aid === "thermostatPackage") {
    var tBase = a.types[a.defaultType] || 550;
    var tInst = a.install[a.defaultInstall] || 150;
    return Math.max(a.minPrice, sys * (tBase + tInst) + (a.defaultSensors * a.sensorPrice));
  }
  if (aid === "poolPump") {
    var pBase = a.types[a.defaultType] || 2200;
    var pInst = a.install[a.defaultInstall] || 600;
    return Math.max(a.minPrice, Math.round((pBase + pInst) * (a.sizeMultipliers[a.defaultPoolSize] || 1.1)));
  }
  if (aid === "hvacReplacement") {
    var hBase = a.types[a.defaultType] || 10500;
    var hMult = a.tierMultipliers[a.defaultTier] || 1.25;
    return Math.max(a.minPrice, Math.round(hBase * hMult * sys));
  }
  return 0;
}

function addonTotal(pid, addons, sys) {
  return Object.entries(addons)
    .filter(function(e) { return e[1] && !addonIncluded(pid, e[0]); })
    .reduce(function(s, e) { return s + addonPrice(e[0], sys); }, 0);
}
function subtotalPrice(pid, addons, sys) { return getBasePrice(pid) + addonTotal(pid, addons, sys); }

// ============================================================
// FREE-FORM ORDER ENGINE
// Supports multiple packages, systems, and add-ons in any order.
// orderItems = array of { id, type, label, unitPrice, qty, note }
// ============================================================

// Catalog of everything a rep can add to an order
var ORDER_CATALOG = [
  // Packages
  { id: "pkg_coreSeal",    type: "package", label: "Core Seal Package",          unitPrice: 3000, category: "Packages",   defaultQty: 1 },
  { id: "pkg_performance", type: "package", label: "Performance Package",         unitPrice: 4198, category: "Packages",   defaultQty: 1 },
  { id: "pkg_ultimate",    type: "package", label: "Ultimate Package",            unitPrice: 6995, category: "Packages",   defaultQty: 1 },
  // HVAC Systems / Furnaces
  { id: "sys_furnace",     type: "system",  label: "Additional Furnace / System", unitPrice: 1200, category: "Systems",    defaultQty: 1, note: "Per additional HVAC system added to scope" },
  { id: "sys_airhandler",  type: "system",  label: "Air Handler Unit",            unitPrice: 950,  category: "Systems",    defaultQty: 1 },
  { id: "sys_heatpump",    type: "system",  label: "Heat Pump System",            unitPrice: 1100, category: "Systems",    defaultQty: 1 },
  // Add-Ons
  { id: "ao_ductClean",    type: "addon",   label: "Duct Cleaning",               unitPrice: 799,  category: "Add-Ons",   defaultQty: 1, note: "Adjust qty for multiple systems" },
  { id: "ao_bootSeal",     type: "addon",   label: "Boot Sealing",                unitPrice: 299,  category: "Add-Ons",   defaultQty: 1, note: "Per system" },
  { id: "ao_emporia",      type: "addon",   label: "Emporia Energy Monitor",      unitPrice: 649,  category: "Add-Ons",   defaultQty: 1 },
  { id: "ao_thermostat",   type: "addon",   label: "Smart Thermostat Package",    unitPrice: 700,  category: "Add-Ons",   defaultQty: 1, note: "Per thermostat unit" },
  { id: "ao_filter",       type: "addon",   label: "4-inch Filter / Plenum Upgrade", unitPrice: 895,  category: "Add-Ons",   defaultQty: 1, note: "Per system" },
  { id: "ao_poolPump",     type: "addon",   label: "Variable-Speed Pool Pump",    unitPrice: 3195, category: "Add-Ons",   defaultQty: 1 },
  { id: "ao_sensors",      type: "addon",   label: "Room Sensors (each)",         unitPrice: 85,   category: "Add-Ons",   defaultQty: 1 },
  // Service
  { id: "svc_inspection",  type: "service", label: "Full System Inspection",      unitPrice: 0,    category: "Services",  defaultQty: 1, note: "Included with all packages" },
  { id: "svc_custom",      type: "custom",  label: "Custom Line Item",            unitPrice: 0,    category: "Custom",    defaultQty: 1, note: "Enter description and price" },
];

var ORDER_CATEGORIES = ["Packages", "Systems", "Add-Ons", "Services", "Custom"];

function orderTotal(orderItems) {
  return orderItems.reduce(function(s, item) { return s + (item.unitPrice * item.qty); }, 0);
}

function newOrderItem(catalogEntry) {
  return {
    key:       catalogEntry.id + "_" + Date.now(),
    id:        catalogEntry.id,
    type:      catalogEntry.type,
    label:     catalogEntry.label,
    unitPrice: catalogEntry.unitPrice,
    qty:       catalogEntry.defaultQty || 1,
    note:      catalogEntry.note || "",
    customLabel: "",
  };
}

// ============================================================
// FORMAT HELPERS
// ============================================================
var fmt = function(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); };
var fmtD = function(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); };
var fmtPct = function(n) { return (n * 100).toFixed(1) + "%"; };

// ============================================================
// DESIGN TOKENS -- EG Comfort Brand System (Light / Warm)
// ============================================================
var LOGO_B64 = "data:image/png;base64,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";

var T = {
  // Backgrounds -- warm off-white, easy on older eyes
  bg:           "#F5F4F1",        // warm page background
  surface:      "#FFFFFF",        // card / panel surface
  surfaceHigh:  "#F0EEE9",        // slightly raised surface
  surfaceBorder:"#E2DFDA",        // subtle card borders

  // Text -- high contrast for readability
  textPrimary:  "#1A1A1A",        // near-black body text
  textSec:      "#4A4A4A",        // secondary text
  textMuted:    "#888580",        // placeholder / captions
  white:        "#FFFFFF",

  // Brand gradient -- blue -> teal -> green (matches logo)
  // Used ONLY for primary buttons, progress bar, key accents
  gradStart:    "#2F80ED",
  gradMid:      "#2BB3A3",
  gradEnd:      "#27D17F",
  grad:         "linear-gradient(135deg, #2F80ED 0%, #2BB3A3 55%, #27D17F 100%)",

  // Accent green (single tone for inline use)
  accent:       "#1A9E6B",
  accentLight:  "#E8F7F0",
  accentMid:    "#2BB3A3",

  // Semantic
  positive:     "#1A9E6B",
  positiveD:    "#E8F7F0",
  warn:         "#B07D1A",
  warnD:        "#FBF4E0",
  danger:       "#C0392B",
  dangerD:      "#FCECEA",
  info:         "#2369C4",
  infoD:        "#E8F0FB",

  // Legacy aliases
  dark:         "#1A1A1A",
  mid:          "#4A4A4A",
  muted:        "#888580",
  border:       "#E2DFDA",
  gold:         "#B07D1A",
  goldLight:    "#FBF4E0",
  red:          "#C0392B",
  redLight:     "#FCECEA",
  orange:       "#C05A28",
  orangeLight:  "#FEF0E8",

  // Geometry -- generous for tap targets
  radius:       "12px",
  radiusSm:     "8px",
  radiusLg:     "16px",

  // Shadows -- soft, readable depth
  shadow:       "0 1px 4px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.05)",
  shadowMd:     "0 4px 20px rgba(0,0,0,0.10)",
  shadowGlow:   "0 0 0 3px rgba(27,158,107,0.18)",

  // Typography -- Inter for clarity
  font:         "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  sans:         "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

// Primary gradient button style helper
var gradBtn = function(disabled) {
  if (disabled) return { background: T.surfaceHigh, color: T.textMuted, border: "1px solid " + T.border, cursor: "not-allowed" };
  return { background: T.grad, color: T.white, border: "none", cursor: "pointer", boxShadow: "0 3px 14px rgba(43,179,163,0.30)" };
};

// ============================================================
// SHARED COMPONENTS
// ============================================================

function Header({ currentScreen, totalScreens }) {
  var p = ((currentScreen + 1) / totalScreens) * 100;
  return (
    <div style={{
      background: T.surface,
      borderBottom: "1px solid " + T.surfaceBorder,
      height: 68,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={LOGO_B64}
          alt="EG Comfort Logo"
          style={{ height: 44, width: "auto", objectFit: "contain" }}
        />
      </div>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
            Step {currentScreen + 1} of {totalScreens}
          </div>
          <div style={{ width: 160, height: 5, background: T.surfaceBorder, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: p + "%", height: "100%", background: T.grad, transition: "width 0.4s ease", borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </div>
  );
}


function NavFooter({ current, total, onPrev, onNext, nextLabel }) {
  var atEnd   = current === total - 1;
  var atStart = current === 0;
  return (
    <div style={{
      background: T.surface,
      borderTop: "1px solid " + T.surfaceBorder,
      padding: "16px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      bottom: 0,
      zIndex: 100,
      boxShadow: "0 -1px 0 rgba(0,0,0,0.05)",
    }}>
      <button onClick={onPrev} disabled={atStart} style={{
        background: "none",
        border: "1.5px solid " + T.border,
        borderRadius: T.radiusSm,
        padding: "13px 30px",
        fontFamily: T.sans,
        fontSize: 16,
        fontWeight: 500,
        color: atStart ? T.textMuted : T.textSec,
        cursor: atStart ? "not-allowed" : "pointer",
        opacity: atStart ? 0.4 : 1,
        transition: "all 0.15s",
      }}>Back</button>
      <button onClick={onNext} disabled={atEnd} style={Object.assign({
        borderRadius: T.radiusSm,
        padding: "14px 44px",
        fontFamily: T.sans,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: "0.01em",
        transition: "opacity 0.15s",
        opacity: atEnd ? 0.5 : 1,
      }, gradBtn(atEnd))}>{nextLabel || "Continue"}</button>
    </div>
  );
}


function Wrap({ children }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 32px 56px", maxWidth: 900, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

function RepNote({ say, phrase, ask }) {
  var s = useState(false);
  var open = s[0]; var setOpen = s[1];
  return (
    <div style={{ marginTop: 28, border: "1px solid #D9C870", borderRadius: T.radiusSm, background: T.warnD, overflow: "hidden" }}>
      <button onClick={function() { setOpen(function(v) { return !v; }); }} style={{ width: "100%", background: "none", border: "none", padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: T.sans, fontSize: 12, color: "#7A6010", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        <span>Rep Notes</span>
        <span style={{ fontWeight: 500, opacity: 0.7, fontSize: 12 }}>{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div style={{ padding: "4px 16px 14px", fontFamily: T.sans, fontSize: 14, color: "#5C4A0C", lineHeight: 1.7, borderTop: "1px solid #D9C870" }}>
          {say    && <p style={{ margin: "8px 0 4px" }}><strong>Say:</strong> {say}</p>}
          {phrase && <p style={{ margin: "4px 0" }}><strong>Key phrase:</strong> <em>"{phrase}"</em></p>}
          {ask    && <p style={{ margin: "4px 0" }}><strong>Ask:</strong> {ask}</p>}
        </div>
      )}
    </div>
  );
}

function Card({ children, style, onClick, selected }) {
  return (
    <div onClick={onClick} style={Object.assign({
      background: T.surface,
      border: "1.5px solid " + (selected ? T.accent : T.border),
      borderRadius: T.radius,
      padding: "20px",
      boxShadow: selected ? T.shadowGlow : T.shadow,
      transition: "all 0.2s",
      cursor: onClick ? "pointer" : "default",
    }, style)}>
      {children}
    </div>
  );
}

function SecTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: T.sans, fontSize: 26, fontWeight: 800, color: T.textPrimary, margin: 0, lineHeight: 1.2, letterSpacing: "-0.3px" }}>{children}</h2>
      {sub && <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSec, marginTop: 8, marginBottom: 0, lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}

function Bdg({ children, variant }) {
  var v = variant || "accent";
  var map = {
    accent: { bg: T.positiveD,  color: T.positive },
    gold:   { bg: T.warnD,      color: T.warn },
    muted:  { bg: T.surfaceHigh, color: T.textSec },
    red:    { bg: T.dangerD,    color: T.danger },
    info:   { bg: T.infoD,      color: T.info },
    grad:   { bg: "transparent", color: T.white, grad: true },
  };
  var c = map[v] || map.accent;
  if (c.grad) {
    return <span style={{ display: "inline-block", background: T.grad, color: T.white, fontFamily: T.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99 }}>{children}</span>;
  }
  return <span style={{ display: "inline-block", background: c.bg, color: c.color, fontFamily: T.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99 }}>{children}</span>;
}

function Disc({ lines }) {
  return (
    <div style={{ background: T.dark, border: "none", borderRadius: T.radiusSm, padding: "12px 16px", fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.65, marginTop: 16 }}>
      {lines.map(function(l, i) { return <div key={i} style={{ marginBottom: i < lines.length - 1 ? 4 : 0 }}>{l}</div>; })}
    </div>
  );
}

// VideoCard -- extracts YouTube video ID and renders a tappable thumbnail.
// Clicking opens the video in a new tab. Works in all environments including
// Safari, iOS, and sandboxed iframes where YouTube embeds are blocked.
function getYouTubeId(url) {
  if (!url) return null;
  // Handles: youtu.be/ID, youtube.com/embed/ID, youtube.com/watch?v=ID
  var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function VideoCard({ video }) {
  if (!video) return null;
  var base = { background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow };

  if (!video.url || !video.url.trim()) {
    return (
      <div style={Object.assign({}, base, { padding: "20px 22px" })}>
        <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 5 }}>{video.title}</div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, marginBottom: 12 }}>{video.caption}</div>
        <div style={{ background: T.border, borderRadius: T.radiusSm, padding: "10px", textAlign: "center", fontFamily: T.sans, fontSize: 12, color: T.muted }}>Video URL not set -- add url in CONFIG.videos</div>
      </div>
    );
  }

  var ytId = getYouTubeId(video.url);

  // YouTube: show thumbnail with play button, tap opens video in new tab
  if (ytId) {
    var thumbUrl = "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";
    var watchUrl = "https://www.youtube.com/watch?v=" + ytId;
    return (
      <div style={base}>
        <div style={{ padding: "14px 18px 10px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark }}>{video.title}</div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{video.caption}</div>
        </div>
        <a href={watchUrl} target="_blank" rel="noreferrer" style={{ display: "block", position: "relative", textDecoration: "none" }}>
          <img
            src={thumbUrl}
            alt={video.title}
            style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
          />
          {/* Play button overlay */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.28)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "18px solid " + T.accent,
                marginLeft: 4,
              }} />
            </div>
          </div>
        </a>
        <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted }}>Tap to watch on YouTube</span>
          <a href={watchUrl} target="_blank" rel="noreferrer" style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.accent, textDecoration: "none" }}>Open video</a>
        </div>
      </div>
    );
  }

  // Non-YouTube direct video file
  if (video.embedType === "video") {
    return (
      <div style={base}>
        <div style={{ padding: "14px 18px 8px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark }}>{video.title}</div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{video.caption}</div>
        </div>
        <video src={video.url} controls style={{ width: "100%", display: "block", maxHeight: 240 }} />
      </div>
    );
  }

  // Generic link fallback for anything else
  return (
    <div style={Object.assign({}, base, { padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
      <div>
        <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{video.title}</div>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{video.caption}</div>
      </div>
      <a href={video.url} target="_blank" rel="noreferrer" style={{ background: T.accent, color: T.white, fontFamily: T.sans, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: T.radiusSm, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 16 }}>Open Video</a>
    </div>
  );
}

// ============================================================
// SCREEN 1 -- Cover
// ============================================================
function CoverScreen({ onNext }) {
  return (
    <Wrap>
      <div style={{ minHeight: "62vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 28, height: 3, background: T.grad, borderRadius: 99 }} />
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.10em", textTransform: "uppercase" }}>{CONFIG.brand.companyName}</span>
        </div>
        <h1 style={{ fontFamily: T.sans, fontSize: 40, fontWeight: 800, color: T.textPrimary, lineHeight: 1.1, margin: "0 0 16px", maxWidth: 560, letterSpacing: "-0.5px" }}>{CONFIG.brand.tagline}</h1>
        <p style={{ fontFamily: T.sans, fontSize: 18, color: T.textSec, margin: "0 0 40px", maxWidth: 420, lineHeight: 1.65 }}>{CONFIG.brand.sub}</p>
        <button onClick={onNext} style={Object.assign({ alignSelf: "flex-start", borderRadius: T.radiusSm, padding: "16px 44px", fontFamily: T.sans, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }, gradBtn(false))}>
          Let's take a look
        </button>
      </div>
      {/* Feature pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        {[
          { icon: "bolt",    label: "Lower Energy Bills" },
          { icon: "home",    label: "Consistent Comfort" },
          { icon: "leaf",    label: "Cleaner Air" },
        ].map(function(s) {
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, background: T.surfaceHigh, border: "1px solid " + T.border, borderRadius: 99, padding: "10px 18px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.grad }} />
              <span style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, fontWeight: 500 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      <RepNote say="Introduce yourself and what EG Comfort does." phrase="We fix how the whole system performs, not just the equipment." ask="What made you want to take a closer look today?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 2 -- Property Prefill
// ============================================================
function PropertyPrefillScreen({ homeProfile, setHomeProfile }) {
  var st = useState(false);
  var loading = st[0]; var setLoading = st[1];
  var st2 = useState(null);
  var imported = st2[0]; var setImported = st2[1];

  // Texas-based estimates that update as sqft / pool change
  var est = estimateTexasBills(homeProfile.squareFeet, homeProfile.hasPool);

  function billField(label, key, estValue) {
    var hasValue = homeProfile[key] != null && homeProfile[key] !== "";
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</label>
        <input
          type="number"
          value={homeProfile[key] != null ? homeProfile[key] : ""}
          placeholder={"Estimated $" + estValue + "/mo (Texas avg)"}
          onChange={function(e) {
            var raw = e.target.value;
            var val = (raw !== "" && raw !== "-") ? parseFloat(raw) : raw;
            setHomeProfile(function(p) { return Object.assign({}, p, { [key]: val }); });
          }}
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 14px", fontFamily: T.sans, fontSize: 15, color: T.dark, background: T.surface, outline: "none" }}
        />
        <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>
            Texas year-round avg for this home: <strong style={{ color: T.textSec }}>${estValue}/mo</strong>
          </div>
          {!hasValue && (
            <button
              type="button"
              onClick={function() { setHomeProfile(function(p) { return Object.assign({}, p, { [key]: estValue }); }); }}
              style={{ background: T.accentLight, color: T.accent, border: "1px solid " + T.accent + "33", borderRadius: T.radiusSm, padding: "4px 10px", fontFamily: T.sans, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Use estimate
            </button>
          )}
        </div>
      </div>
    );
  }

  function handleImport() {
    var addr = homeProfile.address || "";
    if (!addr.trim()) return;
    setLoading(true);
    housecallProService.getPropertyData(addr).then(function(data) {
      setHomeProfile(function(p) {
        // Only overwrite fields that came back -- preserve manually entered values
        var patch = {};
        if (data.squareFeet  != null) patch.squareFeet  = data.squareFeet;
        if (data.yearBuilt   != null) patch.yearBuilt   = data.yearBuilt;
        if (data.systemCount != null) patch.systemCount = data.systemCount;
        if (data.hasPool     != null) patch.hasPool     = data.hasPool;
        if (data.customerName) {
          var parts = data.customerName.split(" ");
          if (!p.customerFirstName) patch.customerFirstName = parts[0] || "";
          if (!p.customerLastName)  patch.customerLastName  = parts.slice(1).join(" ") || "";
        }
        if (data.email && !p.customerEmail) patch.customerEmail = data.email;
        if (data.phone && !p.customerPhone) patch.customerPhone = data.phone;
        if (data.customerId) patch.hcpCustomerId = data.customerId;
        return Object.assign({}, p, patch);
      });
      setImported(data);
      setLoading(false);
    });
  }

  function field(label, key, type, placeholder) {
    // Store the raw string while typing so the field can be blank.
    // Downstream calculations guard against empty/NaN with || fallback.
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</label>
        <input
          type={type || "text"}
          value={homeProfile[key] != null ? homeProfile[key] : ""}
          placeholder={placeholder || ""}
          onChange={function(e) {
            var raw = e.target.value;
            // Keep as string while editing so field can be blank or mid-typing
            var val = (type === "number" && raw !== "" && raw !== "-") ? parseFloat(raw) : raw;
            setHomeProfile(function(p) { return Object.assign({}, p, { [key]: val }); });
          }}
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 14px", fontFamily: T.sans, fontSize: 15, color: T.dark, background: T.surface, outline: "none" }}
        />
      </div>
    );
  }

  return (
    <Wrap>
      <SecTitle children="Let's Start with the Property" sub="Enter the address to auto-fill details, or fill in manually." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
        <div style={{ marginBottom: 18, gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Street Address</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={homeProfile.address || ""}
              placeholder="e.g. 1234 Maple Dr, Orlando FL"
              onChange={function(e) { setHomeProfile(function(p) { return Object.assign({}, p, { address: e.target.value }); }); }}
              style={{ flex: 1, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 14px", fontFamily: T.sans, fontSize: 15, color: T.dark, background: T.surface, outline: "none" }}
            />
            <button onClick={handleImport} style={{ background: T.accent, color: T.white, border: "none", borderRadius: T.radiusSm, padding: "13px 22px", fontFamily: T.sans, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {loading ? "Loading..." : "Import Data"}
            </button>
          </div>
          {imported && <div style={{ marginTop: 8, fontFamily: T.sans, fontSize: 12, color: imported.error ? T.danger : T.accent }}>{imported.error ? "Lookup error: " + imported.error : "Imported from " + imported.source + " -- confidence: " + imported.confidence + ". Verify below."}</div>}
        </div>

        {/* Customer info -- needed to push order to Housecall Pro */}
        <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Customer Info</div>
        </div>
        {field("First Name", "customerFirstName", "text", "e.g. John")}
        {field("Last Name", "customerLastName", "text", "e.g. Smith")}
        {field("Email", "customerEmail", "email", "e.g. john@example.com")}
        {field("Phone", "customerPhone", "tel", "e.g. (555) 123-4567")}

        <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Property Details</div>
        </div>
        {field("Square Feet", "squareFeet", "number", "e.g. 3700")}
        {field("Year Built", "yearBuilt", "number", "e.g. 2003")}
        {billField("Avg Monthly Electric Bill ($)", "electricBill", est.electric)}
        {billField("Avg Monthly Gas Bill ($)", "gasBill", est.gas)}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Number of HVAC Systems</label>
          <select value={homeProfile.systemCount || 1} onChange={function(e) { setHomeProfile(function(p) { return Object.assign({}, p, { systemCount: parseInt(e.target.value) }); }); }} style={{ width: "100%", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 14px", fontFamily: T.sans, fontSize: 15, color: T.dark, background: T.surface, outline: "none" }}>
            {[1,2,3,4].map(function(n) { return <option key={n} value={n}>{n} System{n > 1 ? "s" : ""}</option>; })}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Pool on property?</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{v: true, l: "Yes"}, {v: false, l: "No"}].map(function(o) {
              var sel = homeProfile.hasPool === o.v;
              return <button key={o.l} onClick={function() { setHomeProfile(function(p) { return Object.assign({}, p, { hasPool: o.v }); }); }} style={{ padding: "11px 30px", borderRadius: T.radiusSm, border: "2px solid " + (sel ? T.accent : T.border), background: sel ? T.accentLight : T.white, color: sel ? T.accent : T.mid, fontFamily: T.sans, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{o.l}</button>;
            })}
          </div>
        </div>
      </div>
      <Disc lines={[CONFIG.disclaimers.property]} />
      <RepNote say="Enter the address and tap Import, or fill in manually. Always confirm with the homeowner." phrase="Let me pull up the property details so we have the right numbers." ask="Does this look accurate for your home?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 3 -- Home Performance Advisor (Full Rebuild)
// 5-section single-column live advisor experience
// ============================================================
function EfficiencyScoreScreen({ scoreInputs, setScoreInputs, homeProfile, setHomeProfile, selectedPackageId, setSelectedPackageId, addons }) {

  // Live calculations -- all update on every keystroke / button press
  var score     = calculateEfficiencyScore(scoreInputs);
  var band      = getEfficiencyBand(score);
  var subScores = calculateSubScores(scoreInputs);
  var recs      = buildLiveRecommendations(scoreInputs, homeProfile);
  var dual      = calculateDualUtilitySavings(score, homeProfile, scoreInputs, selectedPackageId, addons);
  var explanation = getLiveExplanation(score, scoreInputs, homeProfile);
  var homeEra   = getHomeEra(homeProfile.yearBuilt || 0);
  var billEst   = estimateTexasBills(homeProfile.squareFeet, homeProfile.hasPool);

  var openRec   = useState(null); var expandedRec = openRec[0]; var setExpandedRec = openRec[1];

  function setVal(key, val) {
    setScoreInputs(function(p) { return Object.assign({}, p, { [key]: val }); });
  }
  function setHP(key, val) {
    setHomeProfile(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  // Pill button -- used throughout
  function Pill(label, active, onClick) {
    return (
      <button key={label} onClick={onClick} style={{
        padding: "10px 18px", borderRadius: 99, fontFamily: T.sans, fontSize: 14,
        fontWeight: active ? 700 : 400,
        border: "1.5px solid " + (active ? T.accent : T.border),
        background: active ? T.accentLight : T.surface,
        color: active ? T.accent : T.textSec, cursor: "pointer", transition: "all 0.15s",
      }}>{label}</button>
    );
  }

  // Number input helper
  function NumInput(label, hpKey, placeholder, helper) {
    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</label>
        <input
          type="number"
          value={homeProfile[hpKey] != null ? homeProfile[hpKey] : ""}
          placeholder={placeholder}
          onChange={function(e) {
            var raw = e.target.value;
            var val = raw !== "" ? parseFloat(raw) : raw;
            setHP(hpKey, val);
          }}
          style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 16px", fontFamily: T.sans, fontSize: 16, color: T.textPrimary, background: T.surface, outline: "none" }}
        />
        {helper && <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 5, lineHeight: 1.5 }}>{helper}</div>}
      </div>
    );
  }

  // Score bar sub-metric
  function SubMetric(label, val, color) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSec }}>{label}</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: color }}>{val}%</span>
        </div>
        <div style={{ height: 6, background: T.surfaceBorder, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: val + "%", height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>
    );
  }

  // Impact pill
  function ImpactPill(label, level) {
    var colors = { High: { bg: T.positiveD, color: T.positive }, Moderate: { bg: T.infoD, color: T.info }, Low: { bg: T.surfaceHigh, color: T.textMuted } };
    var c = colors[level] || colors.Low;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, width: 68, flexShrink: 0 }}>{label}</span>
        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, padding: "2px 10px", borderRadius: 99 }}>{level}</span>
      </div>
    );
  }

  // Confidence badge
  function ConfBadge(conf) {
    var map = { "Strong Match": { bg: T.positiveD, color: T.positive }, "Likely Helpful": { bg: T.infoD, color: T.info }, "Optional": { bg: T.surfaceHigh, color: T.textMuted } };
    var c = map[conf] || map.Optional;
    return <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, padding: "3px 10px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.07em" }}>{conf}</span>;
  }

  // Savings bar row
  function SavingsBar(label, low, high, annualTotal, color) {
    var pct = annualTotal > 0 ? Math.min(100, Math.round((high / annualTotal) * 100)) : 0;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{label}</span>
          <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 800, color: color }}>{low > 0 ? fmt(low) + " -- " + fmt(high) + "/yr" : "Enter bill above"}</span>
        </div>
        <div style={{ height: 10, background: T.surfaceBorder, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
        {annualTotal > 0 && <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 4 }}>Projected {pct}% of annual HVAC-related spend</div>}
      </div>
    );
  }

  var pkgs = Object.values(CONFIG.packages);

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 60px", boxSizing: "border-box" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 2, background: T.grad, borderRadius: 99 }} />
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>Home Performance Advisor</span>
          </div>
          <h2 style={{ fontFamily: T.sans, fontSize: 26, fontWeight: 800, color: T.textPrimary, margin: "0 0 8px", letterSpacing: "-0.3px" }}>Your Home Efficiency Assessment</h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSec, margin: 0, lineHeight: 1.55 }}>Fill in the details below. Your score, recommendations, and savings update live as you go.</p>
        </div>

        {/* ════════════════════════════════════════
            SECTION 1: HOME PROFILE
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Section 1 — Home Profile</div>

          {/* Basic details */}
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "22px", marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 18 }}>Property Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              {NumInput("Square Footage", "squareFeet", "e.g. 3700", "")}
              {NumInput("Year Built", "yearBuilt", "e.g. 2003", "")}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Number of HVAC Systems</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1,2,3,4].map(function(n) {
                  return Pill(n + " System" + (n > 1 ? "s" : ""), (homeProfile.systemCount || 1) === n, function() { setHP("systemCount", n); });
                })}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Number of Floors</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["1", "2", "3+"].map(function(n) {
                  return Pill(n, (scoreInputs.floors || "1") === n, function() { setVal("floors", n); });
                })}
              </div>
            </div>
          </div>

          {/* Utility bills */}
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "22px", marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Monthly Utility Bills</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, marginBottom: 18, lineHeight: 1.5 }}>Enter your average monthly bills. Both are used to calculate heating and cooling savings separately.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              {NumInput("Electric Bill ($)", "electricBill", "Estimated $" + billEst.electric + "/mo (TX avg)", "Texas year-round avg for this home: $" + billEst.electric + "/mo. Affects cooling savings.")}
              {NumInput("Gas Bill ($)", "gasBill", "Estimated $" + billEst.gas + "/mo (TX avg)", "Texas year-round avg for this home: $" + billEst.gas + "/mo. Affects heating savings.")}
            </div>
          </div>

          {/* System & thermostat */}
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "22px", marginBottom: 14, boxShadow: T.shadow }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 18 }}>System Setup</div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Primary Heating System</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ v: "gasFurnace", l: "Gas Furnace" }, { v: "heatPump", l: "Heat Pump" }, { v: "allElectric", l: "All Electric" }, { v: "mixed", l: "Mixed / Other" }].map(function(o) {
                  return Pill(o.l, (scoreInputs.systemType || "mixed") === o.v, function() { setVal("systemType", o.v); });
                })}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 6 }}>Affects how savings are split between electric and gas</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Current Thermostat</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ v: "smart", l: "Smart / App-connected" }, { v: "basic", l: "Programmable" }, { v: "manual", l: "Manual / Basic" }].map(function(o) {
                  return Pill(o.l, (scoreInputs.thermostatType || "manual") === o.v, function() {
                    setVal("thermostatType", o.v);
                    setVal("hasThermostat", o.v === "smart");
                  });
                })}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 6 }}>Older thermostats increase smart control opportunity</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>HVAC System Age</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ v: "under5", l: "Under 5 yrs" }, { v: "5to10", l: "5-10 yrs" }, { v: "10plus", l: "10+ yrs" }].map(function(o) {
                  return Pill(o.l, scoreInputs.hvacAge === o.v, function() { setVal("hvacAge", o.v); });
                })}
              </div>
            </div>
          </div>

          {/* Comfort & symptoms */}
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "22px", boxShadow: T.shadow }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 18 }}>Comfort & Performance Symptoms</div>
            {[
              { key: "comfort",     label: "Temperature comfort",           helper: "Hot/cold rooms increase airflow and control recommendations", options: [{ v: "fine", l: "Comfortable" }, { v: "some", l: "Some issues" }, { v: "major", l: "Major issues" }] },
              { key: "airflow",     label: "Airflow to rooms",              helper: "Weak airflow is a strong duct leakage indicator", options: [{ v: "fine", l: "Good" }, { v: "weak", l: "Weak in some" }, { v: "veryWeak", l: "Very weak" }] },
              { key: "bills",       label: "Bills vs. expectations",        helper: "", options: [{ v: "normal", l: "About normal" }, { v: "slightly", l: "Slightly high" }, { v: "much", l: "Much higher" }] },
              { key: "runtime",     label: "HVAC runtime",                  helper: "Long cycles often mean the system is compensating for losses", options: [{ v: "normal", l: "Normal" }, { v: "long", l: "Runs long" }, { v: "neverOff", l: "Almost never off" }] },
              { key: "dust",        label: "Dust levels",                   helper: "Severe dust often indicates leaky return ducts", options: [{ v: "none", l: "Minimal" }, { v: "some", l: "Some" }, { v: "severe", l: "Severe" }] },
              { key: "unusedRooms", label: "Unused rooms (vents open)",     helper: "", options: [{ v: "none", l: "None" }, { v: "occasional", l: "1-2 rooms" }, { v: "multiple", l: "Several" }] },
              { key: "upgrades",    label: "Prior efficiency upgrades",     helper: "", options: [{ v: "recent", l: "Yes, recent" }, { v: "none", l: "None" }] },
            ].map(function(q) {
              return (
                <div key={q.key} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textSec }}>{q.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {q.options.map(function(o) { return Pill(o.l, scoreInputs[q.key] === o.v, function() { setVal(q.key, o.v); }); })}
                  </div>
                  {q.helper && <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 5 }}>{q.helper}</div>}
                </div>
              );
            })}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 8 }}>Room sensors installed?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ v: "multiple", l: "3+" }, { v: "oneTwo", l: "1-2" }, { v: "none", l: "None" }].map(function(o) { return Pill(o.l, scoreInputs.sensors === o.v, function() { setVal("sensors", o.v); }); })}
              </div>
            </div>
            <div style={{ marginBottom: 0, marginTop: 16 }}>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 8 }}>Whole-home energy monitoring?</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(function(o) { return Pill(o.l, scoreInputs.hasMonitoring === o.v, function() { setVal("hasMonitoring", o.v); }); })}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 2: LIVE SCORE
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Section 2 — Live Efficiency Score</div>

          <div style={{ background: band.bg, border: "2px solid " + band.color + "55", borderRadius: T.radius, padding: "26px 24px", marginBottom: 14 }}>
            {/* Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontFamily: T.sans, fontSize: 64, fontWeight: 900, color: band.color, lineHeight: 1 }}>{score}</div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 2 }}>out of 100</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "inline-block", background: band.color, color: "#FFF", fontFamily: T.sans, fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 99, marginBottom: 10 }}>{band.label}</div>
                {homeEra.era !== "X" && (
                  <div style={{ display: "inline-block", background: "rgba(0,0,0,0.12)", color: T.textSec, fontFamily: T.sans, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, marginLeft: 8, marginBottom: 10 }}>
                    Built {homeEra.label}
                  </div>
                )}
                {/* Score bar */}
                <div style={{ height: 8, background: T.surfaceBorder, borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: score + "%", height: "100%", background: "linear-gradient(90deg, " + band.color + "88, " + band.color + ")", borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
                {/* Sub-scores */}
                {SubMetric("Heating efficiency", subScores.heating, "#2F80ED")}
                {SubMetric("Cooling efficiency", subScores.cooling, "#2BB3A3")}
                {SubMetric("Control & comfort",  subScores.control, "#27D17F")}
              </div>
            </div>
            {/* Live explanation */}
            <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: T.radiusSm, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textPrimary, lineHeight: 1.65 }}>{explanation}</div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 3: LIVE RECOMMENDATIONS
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Section 3 — Recommended Based on Your Home</div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, marginBottom: 20, lineHeight: 1.55 }}>
            {recs.length > 0
              ? "These improvements are building as you fill in the profile above. They update automatically as more context is added."
              : "Fill in the symptom questions above to generate personalized recommendations."}
          </p>

          {recs.map(function(rec) {
            var isOpen = expandedRec === rec.id;
            return (
              <div key={rec.id} style={{ background: T.surface, border: "1.5px solid " + (rec.confidence === "Strong Match" ? T.accent + "66" : T.border), borderRadius: T.radius, marginBottom: 14, overflow: "hidden", boxShadow: T.shadow }}>
                {/* Card header */}
                <div style={{ padding: "18px 20px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{rec.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.55 }}>{rec.what}</div>
                    </div>
                    {ConfBadge(rec.confidence)}
                  </div>

                  {/* Why it fits */}
                  <div style={{ background: T.surfaceHigh, borderRadius: T.radiusSm, padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Why it fits this home</div>
                    <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{rec.why}</div>
                  </div>

                  {/* Estimated cost */}
                  {rec.cost && (
                    <div style={{
                      background: rec.costTone === "warning" ? T.warnD : T.surfaceHigh,
                      border: rec.costTone === "warning" ? "1px solid #D9C870" : "1px solid " + T.border,
                      borderRadius: T.radiusSm, padding: "12px 14px", marginBottom: 14,
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: rec.costTone === "warning" ? "#7A6010" : T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                          {rec.costTone === "warning" ? "⚠ Estimated investment" : "Estimated cost"}
                        </div>
                        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, lineHeight: 1.55 }}>{rec.costNote}</div>
                      </div>
                      <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 800, color: rec.costTone === "warning" ? "#7A6010" : T.textPrimary, whiteSpace: "nowrap", marginTop: 2 }}>
                        {rec.cost}
                      </div>
                    </div>
                  )}

                  {/* Impact grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px" }}>
                    {ImpactPill("Comfort", rec.impact.comfort)}
                    {ImpactPill("Control", rec.impact.control)}
                    {ImpactPill("Electric", rec.impact.electric)}
                    {ImpactPill("Gas", rec.impact.gas)}
                  </div>

                  {/* Cost-effectiveness alternative -- shown on HVAC rec to point
                      to the sealing + boot combo as the higher-leverage entry point */}
                  {rec.id === "hvacReplacement" && (function() {
                    var perfPkg = CONFIG.packages.performance;
                    if (!perfPkg) return null;
                    return (
                      <div style={{ marginTop: 14, background: T.accentLight, border: "1px solid " + T.accent + "44", borderRadius: T.radiusSm, padding: "12px 14px" }}>
                        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>💡 Compare: a higher-leverage starting point</div>
                        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>
                          The <strong style={{ color: T.textPrimary }}>{perfPkg.name} package</strong> ({fmt(perfPkg.price)}) bundles <strong>duct sealing + boot sealing + duct cleaning</strong>. For most homes this combination delivers a meaningful share of the comfort and efficiency gains a full system replacement would, at a fraction of the investment and a much shorter payback. Worth doing first; a full HVAC replacement can be staged in later if needed.
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Learn more toggle */}
                <button onClick={function() { setExpandedRec(isOpen ? null : rec.id); }} style={{ width: "100%", background: T.surfaceHigh, border: "none", borderTop: "1px solid " + T.border, padding: "10px 20px", fontFamily: T.sans, fontSize: 13, color: T.textSec, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                  <span>{isOpen ? "Show less" : "Learn more about this improvement"}</span>
                  <span>{isOpen ? "^" : "v"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "16px 20px 20px", borderTop: "1px solid " + T.border }}>
                    <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.7, margin: 0 }}>{rec.detail}</p>
                    {rec.id === "ductSealing" && (
                      <div style={{ marginTop: 14 }}>
                        <AerosealModule packageId="coreSeal" context="rec" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════
            SECTION 4: PROJECTED SAVINGS
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Section 4 — Projected Savings Summary</div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, marginBottom: 20, lineHeight: 1.55 }}>Includes projected heating and cooling savings based on your current utility inputs and selected improvements.</p>

          {/* Utility baseline grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Annual Electric Spend",       val: dual.elecAnnual  > 0 ? fmt(dual.elecAnnual)  : "--", sub: "Based on your monthly electric bill", color: "#2F80ED" },
              { label: "Annual Gas Spend",             val: dual.gasAnnual   > 0 ? fmt(dual.gasAnnual)   : "--", sub: "Based on your monthly gas bill",      color: "#F5A623" },
              { label: "HVAC-Related Electric",        val: dual.hvacElec    > 0 ? fmt(dual.hvacElec)    : "--", sub: Math.round(dual.hvacShare * 100) + "% of electric attributed to HVAC", color: "#2F80ED" },
              { label: "HVAC-Related Gas",             val: dual.hvacGas     > 0 ? fmt(dual.hvacGas)     : "--", sub: Math.round(dual.hvacShare * 100) + "% of gas attributed to HVAC",     color: "#F5A623" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "14px 16px", boxShadow: T.shadow }}>
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 3 }}>{s.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Savings bars */}
          <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "22px", marginBottom: 14, boxShadow: T.shadow }}>
            {SavingsBar("Projected Electric Savings", dual.elecSavLow, dual.elecSavHigh, dual.hvacElec, "#2F80ED")}
            {SavingsBar("Projected Gas Savings",      dual.gasSavLow,  dual.gasSavHigh,  dual.hvacGas,  "#F5A623")}
          </div>

          {/* Combined savings card */}
          <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "22px 24px" }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Projected Combined Savings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Annual Savings</div>
                <div style={{ fontFamily: T.sans, fontSize: 26, fontWeight: 800, color: "#27D17F" }}>
                  {dual.combLow > 0 ? fmt(dual.combLow) + " -- " + fmt(dual.combHigh) : "Enter bills above"}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>per year</div>
              </div>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Monthly Equivalent</div>
                <div style={{ fontFamily: T.sans, fontSize: 26, fontWeight: 800, color: "#27D17F" }}>
                  {dual.monthlyLow > 0 ? fmt(dual.monthlyLow) + " -- " + fmt(dual.monthlyHigh) : "--"}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>per month</div>
              </div>
            </div>
            <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Score Improvement</div>
                <div style={{ fontFamily: T.sans, fontSize: 20, fontWeight: 700, color: "#FFFFFF" }}>
                  {dual.scoreLow > 0 ? "+" + dual.scoreLow + " to +" + dual.scoreHigh + " pts" : "--"}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Estimated Payback (engine-projected savings applied to investment)</div>
                {dual.pkgCost > 0 && dual.combLow > 0
                  ? buildEngineScenarios(dual.combLow, dual.combHigh).map(function(s) {
                      var mo = payoffMonths(dual.pkgCost, s.mo);
                      var yr = payoffYears(mo);
                      return (
                        <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, fontFamily: T.sans, fontSize: 14, color: "#FFFFFF" }}>
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>{s.label} — {fmt(s.annual)}/yr ({fmt(s.mo)}/mo)</span>
                          <span style={{ fontWeight: 700, color: "#27D17F" }}>{yr} yrs</span>
                        </div>
                      );
                    })
                  : <div style={{ fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Enter bills above to estimate payback</div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 5: PACKAGE PATHS
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Section 5 — Recommended Package Paths</div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, marginBottom: 20, lineHeight: 1.55 }}>Based on everything above, here are the package options best suited to this home. Select one to see it reflected throughout the presentation.</p>

          {pkgs.map(function(pkg) {
            var isSelected = selectedPackageId === pkg.id;
            var isMid      = pkg.id === "performance";
            var pkgAddons  = {};
            // Calculate dual savings for this specific package
            var pkgDual = calculateDualUtilitySavings(score, homeProfile, scoreInputs, pkg.id, pkgAddons);
            var includesAeroseal = true; // all packages include duct sealing

            // Dynamic "why it fits" based on score inputs
            var whyFit;
            if (pkg.id === "coreSeal") {
              whyFit = "Best starting point for homes where airflow and duct leakage are the primary concern. Addresses the single largest driver of efficiency loss.";
            } else if (pkg.id === "performance") {
              whyFit = "The highest-leverage option for most homes -- combines duct sealing + boot sealing + duct cleaning for a complete delivery-system restoration. Typically delivers the strongest savings-per-dollar of any single investment, which is why it is the most cost-effective starting point we offer.";
            } else {
              whyFit = "Ideal for homes where comfort control, monitoring, and full system delivery are all priorities. Includes smart thermostats, sensors, filters, and monitoring alongside the complete seal package.";
            }

            return (
              <div key={pkg.id} onClick={function() { setSelectedPackageId(pkg.id); }} style={{
                background: isSelected ? T.accentLight : T.surface,
                border: "2px solid " + (isSelected ? T.accent : isMid ? T.border : T.border),
                borderRadius: T.radius,
                padding: "22px",
                marginBottom: 14,
                cursor: "pointer",
                boxShadow: isSelected ? T.shadowGlow : T.shadow,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 10 }}>
                  <div>
                    {pkg.badge && <div style={{ marginBottom: 6 }}><Bdg variant={isMid ? "grad" : isSelected ? "accent" : "muted"}>{pkg.badge}</Bdg></div>}
                    <div style={{ fontFamily: T.sans, fontSize: 17, fontWeight: 800, color: T.textPrimary }}>{pkg.name}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 26, fontWeight: 800, color: isSelected ? T.accent : T.textPrimary }}>{fmt(pkg.price)}</div>
                    {isSelected && <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.07em" }}>Selected</div>}
                  </div>
                </div>

                {/* Why it fits */}
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, lineHeight: 1.6, marginBottom: 14, padding: "10px 12px", background: "rgba(0,0,0,0.04)", borderRadius: T.radiusSm }}>
                  <strong style={{ color: T.textPrimary }}>Why it fits: </strong>{whyFit}
                </div>

                {/* Included items */}
                <div style={{ marginBottom: 16 }}>
                  {pkg.includes.map(function(item) {
                    return <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, fontFamily: T.sans, fontSize: 13, color: T.textSec }}><span style={{ color: T.accent, flexShrink: 0, fontWeight: 700 }}>+</span>{item}</div>;
                  })}
                </div>

                {/* Projected numbers */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: pkgDual.combLow > 0 ? 14 : 0 }}>
                  {pkgDual.elecSavLow > 0 && (
                    <div style={{ background: "rgba(47,128,237,0.08)", borderRadius: T.radiusSm, padding: "10px 12px" }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, color: "#2F80ED", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Electric</div>
                      <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{fmt(pkgDual.elecSavLow)} -- {fmt(pkgDual.elecSavHigh)}/yr</div>
                    </div>
                  )}
                  {pkgDual.gasSavLow > 0 && (
                    <div style={{ background: "rgba(245,166,35,0.08)", borderRadius: T.radiusSm, padding: "10px 12px" }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, color: "#F5A623", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Gas</div>
                      <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{fmt(pkgDual.gasSavLow)} -- {fmt(pkgDual.gasSavHigh)}/yr</div>
                    </div>
                  )}
                  {pkgDual.combLow > 0 && (
                    <div style={{ background: T.positiveD, borderRadius: T.radiusSm, padding: "10px 12px" }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Combined</div>
                      <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(pkgDual.combLow)} -- {fmt(pkgDual.combHigh)}/yr</div>
                    </div>
                  )}
                </div>

                {(function() {
                  if (!(pkgDual.combLow > 0) || !(pkg.price > 0)) return null;
                  var scenarios = buildEngineScenarios(pkgDual.combLow, pkgDual.combHigh);
                  if (scenarios.length === 0) return null;
                  var expected = scenarios[1]; // midpoint
                  var mo = payoffMonths(pkg.price, expected.mo);
                  var yr = payoffYears(mo);
                  return (
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>
                      Score: +{pkgDual.scoreLow} to +{pkgDual.scoreHigh} pts &nbsp;|&nbsp; Expected payoff: ~{yr} yrs &nbsp;|&nbsp; Based on {fmt(pkgDual.combLow)}–{fmt(pkgDual.combHigh)}/yr projected savings
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* ── Sales bridge ── */}
        <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "28px 24px", marginBottom: 28 }}>
          <p style={{ fontFamily: T.sans, fontSize: 19, color: "#FFFFFF", lineHeight: 1.6, margin: "0 0 14px", fontWeight: 700 }}>
            Most homes we test are losing between $1,500 and $4,500 per year due to issues like these.
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 18px" }}>The next step is a Home Efficiency Test, where we show you exactly where the losses are happening and what can be done about them.</p>
          <button style={{ border: "none", borderRadius: T.radiusSm, padding: "16px 32px", fontFamily: T.sans, fontSize: 16, fontWeight: 700, cursor: "pointer", background: T.grad, color: T.white, boxShadow: "0 4px 16px rgba(39,209,127,0.35)", width: "100%" }}>
            Book Home Efficiency Test
          </button>
        </div>

        <Disc lines={[
          "Savings estimates are directional ranges based on homeowner inputs and typical performance gains. Actual results depend on utility rates, weather, usage, equipment condition, and installation quality.",
          CONFIG.disclaimers.general,
        ]} />
        <RepNote say="Walk through each section with the homeowner. Everything updates live." phrase="This tells us where the home is losing the most -- and what it may be costing every month." ask="Does any of this match what you have been experiencing?" />
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 4 -- Technology Intro
// ============================================================
function TechnologyIntroScreen() {
  return (
    <Wrap>
      <SecTitle children="What Duct Sealing Actually Does" sub="Most HVAC service treats the equipment. Duct sealing fixes the delivery system." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
        <div style={{ background: "#FFF5F5", border: "1px solid #EEDADA", borderRadius: T.radius, padding: "22px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Before -- Leaking System</div>
          {["Up to 20-40% of conditioned air escapes before reaching rooms","Dust and allergens pulled in from unconditioned spaces","System runs longer, consuming more energy, wearing out faster"].map(function(t) {
            return <div key={t} style={{ display: "flex", gap: 8, marginBottom: 9, fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.55 }}><span style={{ color: "#C05050", flexShrink: 0 }}>x</span>{t}</div>;
          })}
        </div>
        <div style={{ background: T.accentLight, border: "1px solid " + T.accent + "44", borderRadius: T.radius, padding: "22px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>After -- Sealed System</div>
          {["More conditioned air reaches the rooms it was paid to reach","Reduced pathways for dust and allergen intrusion","System runs fewer cycles, with less strain and wear"].map(function(t) {
            return <div key={t} style={{ display: "flex", gap: 8, marginBottom: 9, fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.55 }}><span style={{ color: T.accent, flexShrink: 0, fontWeight: 700 }}>+</span>{t}</div>;
          })}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {[
          ["1", "Test and Pressurize",   "We seal off the system and measure exactly how much air is escaping before touching anything."],
          ["2", "Seal from the Inside",  "Pressurized sealant particles flow through the ducts and bind to leak edges -- no demolition required."],
          ["3", "Verify Before/After",   "We measure again after sealing. You see the exact improvement in black and white."],
        ].map(function(s) {
          return (
            <div key={s[0]} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, color: T.white, fontFamily: T.font, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s[0]}</div>
              <div><div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{s[1]}</div><div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{s[2]}</div></div>
            </div>
          );
        })}
      </div>
      {CONFIG.videos.length > 0 && <VideoCard video={CONFIG.videos[0]} />}
      <RepNote say="The equipment on the roof or in the closet can be perfectly fine. The problem is what happens after the air leaves the unit." phrase="You're paying to condition air that never makes it to the room." ask="Have you ever had anyone look at the duct system itself, not just the unit?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 5 -- Real Example (Bill Data)
// Shows actual side-by-side comparison: March 2025 vs March 2026
// ============================================================
// ============================================================
// REAL DATA DISPLAY MODULE
// Default: insight summary + simple bar chart
// Expanded: full monthly table + raw bill detail
// ============================================================
function RealDataModule() {
  var b    = CONFIG.exampleBill;
  var sd   = useState(false);    var showDetail  = sd[0];  var setShowDetail  = sd[1];
  var stab = useState("elec");   var activeTab   = stab[0]; var setActiveTab  = stab[1];

  // ELECTRIC -- kWh monthly history (before = 2025, after = 2026)
  var monthlyHistory = [
    { month: "Mar", before: 1982, after: 1057, highlight: true },
    { month: "Feb", before: 2565, after: 1630 },
    { month: "Jan", before: 1697, after: 1531 },
    { month: "Dec", before: 1511, after: 0 },
    { month: "Nov", before: 1784, after: 0 },
    { month: "Oct", before: 2737, after: 0 },
    { month: "Sep", before: 3931, after: 0 },
    { month: "Aug", before: 3046, after: 0 },
    { month: "Jul", before: 2261, after: 0 },
    { month: "Jun", before: 2247, after: 0 },
    { month: "May", before: 1917, after: 0 },
    { month: "Apr", before: 1816, after: 0 },
  ];

  // GAS -- CCF monthly history from Atmos Energy (before = 2024/25, after = 2025/26)
  // Aligned by billing month for direct year-over-year comparison
  var gasHistory = [
    { month: "Mar", before: 226, after: 181, highlight: true },  // Mar25 vs Mar26
    { month: "Feb", before: 462, after: 269 },                   // Feb25 vs Feb26
    { month: "Jan", before: 538, after: 431 },                   // Jan25 vs Jan26
    { month: "Dec", before: 347, after: 372 },                   // Dec24 vs Dec25
    { month: "Nov", before: 209, after: 182 },                   // Nov24 vs Nov25
    { month: "Oct", before: 127, after: 99  },                   // Oct24 vs Oct25
    { month: "Sep", before: 69,  after: 85  },                   // Sep24 vs Sep25
    { month: "Aug", before: 53,  after: 31  },                   // Aug24 vs Aug25
    { month: "Jul", before: 46,  after: 40  },                   // Jul24 vs Jul25
    { month: "Jun", before: 66,  after: 35  },                   // Jun24 vs Jun25
    { month: "May", before: 0,   after: 111 },                   // no 2024 prior
    { month: "Apr", before: 170, after: 0   },                   // Apr25 no 2026 yet
  ];

  // Active dataset based on tab
  var activeHistory = activeTab === "elec" ? monthlyHistory : gasHistory;
  var activeUnit    = activeTab === "elec" ? "kWh" : "CCF";
  var activeLabel   = activeTab === "elec" ? "Electric (kWh)" : "Gas (CCF)";

  var comparable = activeHistory.filter(function(m) { return m.before > 0 && m.after > 0; });
  // Show top 3 months for bar chart (strongest reductions first)
  var chartMonths = comparable.slice().sort(function(a, b) {
    return ((a.before - a.after) / a.before) - ((b.before - b.after) / b.before);
  }).reverse().slice(0, 3);

  function pctDrop(m) { return Math.round(((m.before - m.after) / m.before) * 100); }

  // Gas insight text
  var gasInsight = "After sealing, winter gas usage dropped between 15% and 42% depending on the month. January 2025 used 538 CCF -- January 2026 used 431 CCF, a 20% reduction during the coldest billing period.";
  var elecInsight = "After sealing, winter electricity usage dropped between 20% and 47% depending on the month -- with the strongest reductions during the heaviest-use periods.";

  return (
    <div>
      {/* ── TAB SWITCHER ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ id: "elec", label: "⚡ Electric" }, { id: "gas", label: "🔥 Gas (Atmos)" }].map(function(t) {
          var sel = activeTab === t.id;
          return (
            <button key={t.id} onClick={function() { setActiveTab(t.id); }} style={{
              flex: 1, padding: "11px", borderRadius: T.radiusSm, fontFamily: T.sans,
              fontSize: 14, fontWeight: sel ? 700 : 500,
              border: "2px solid " + (sel ? T.accent : T.border),
              background: sel ? T.accentLight : T.surface,
              color: sel ? T.accent : T.textSec, cursor: "pointer",
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* ── INSIGHT SUMMARY CARD ── */}
      <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          Real Home Performance Example
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: "#FFFFFF", lineHeight: 1.65, margin: "0 0 16px", fontWeight: 500 }}>
          {activeTab === "elec"
            ? <span>After sealing, winter electricity usage dropped between <strong style={{ color: "#27D17F" }}>20% and 47%</strong> depending on the month -- with the strongest reductions during the heaviest-use periods.</span>
            : <span>After sealing, winter gas usage dropped between <strong style={{ color: "#27D17F" }}>15% and 42%</strong> depending on the month. The heating season showed consistent year-over-year reductions in CCF consumption.</span>
          }
        </p>
        {activeTab === "elec" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Bill savings",    val: fmtD(b.dollarSavings) + "/mo",          sub: "same month, one year apart" },
              { label: "Usage reduction", val: b.reductionPercent + "%",                sub: "fewer kWh that month" },
              { label: "Daily cost",      val: fmtD(b.avgDailyCostLastYear) + " to " + fmtD(b.avgDailyCostCurrent), sub: "before vs after" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ flex: "1 1 110px", background: "rgba(255,255,255,0.07)", borderRadius: T.radiusSm, padding: "12px 14px" }}>
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#27D17F" }}>{s.val}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "Jan reduction",  val: "20%",    sub: "538 to 431 CCF" },
              { label: "Feb reduction",  val: "42%",    sub: "462 to 269 CCF" },
              { label: "Mar reduction",  val: "20%",    sub: "226 to 181 CCF" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ flex: "1 1 110px", background: "rgba(255,255,255,0.07)", borderRadius: T.radiusSm, padding: "12px 14px" }}>
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#27D17F" }}>{s.val}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BAR CHART: top 3 comparable months ── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Monthly {activeUnit} Comparison -- Before vs After
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {chartMonths.map(function(m) {
            var drop = pctDrop(m);
            var beforePct = 100;
            var afterPct  = Math.round((m.after / m.before) * 100);
            return (
              <div key={m.month}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{m.month}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.accent }}>-{drop}%</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 44, fontFamily: T.sans, fontSize: 11, color: T.textMuted, textAlign: "right", flexShrink: 0 }}>Before</div>
                    <div style={{ flex: 1, background: T.surfaceHigh, borderRadius: 4, height: 22, overflow: "hidden" }}>
                      <div style={{ width: beforePct + "%", height: "100%", background: "#E05252", borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.white }}>{m.before.toLocaleString()} {activeUnit}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 44, fontFamily: T.sans, fontSize: 11, color: T.textMuted, textAlign: "right", flexShrink: 0 }}>After</div>
                    <div style={{ flex: 1, background: T.surfaceHigh, borderRadius: 4, height: 22, overflow: "hidden" }}>
                      <div style={{ width: afterPct + "%", height: "100%", background: T.accent, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.white }}>{m.after.toLocaleString()} {activeUnit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── EXPAND BUTTON ── */}
      <button
        onClick={function() { setShowDetail(function(v) { return !v; }); }}
        style={{
          width: "100%", background: T.surface, border: "1.5px solid " + T.border,
          borderRadius: T.radiusSm, padding: "12px", fontFamily: T.sans, fontSize: 14,
          fontWeight: 600, color: T.textSec, cursor: "pointer", marginBottom: showDetail ? 14 : 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <span>{showDetail ? "Hide" : "View Actual Utility Data"}</span>
        <span style={{ fontSize: 16 }}>{showDetail ? "^" : "v"}</span>
      </button>

      {/* ── SECONDARY VIEW: full data table ── */}
      {showDetail && (
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Raw Utility Data for Transparency
          </div>

          {/* Side-by-side bill detail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              {
                label: "March 2025 -- Before", period: b.serviceFromLastYear + " to " + b.serviceToLastYear,
                total: b.priorBill, kwh: b.usageKwhLastYear, energy: b.energyChargeLastYear,
                base: b.baseFeeLastYear, tax: b.cityTaxLastYear, franchise: b.franchiseFeeLastYear,
                dailyKwh: b.avgDailyKwhLastYear, dailyCost: b.avgDailyCostLastYear, isAfter: false,
              },
              {
                label: "March 2026 -- After", period: b.serviceFrom + " to " + b.serviceTo,
                total: b.monthlyBill, kwh: b.usageKwhCurrent, energy: b.energyCharge,
                base: b.baseFee, tax: b.cityTax, franchise: b.franchiseFee,
                dailyKwh: b.avgDailyKwhCurrent, dailyCost: b.avgDailyCostCurrent, isAfter: true,
              },
            ].map(function(col) {
              return (
                <div key={col.label} style={{ background: col.isAfter ? T.accentLight : "#FFF5F5", border: "1px solid " + (col.isAfter ? T.accent + "44" : "#EEDADA"), borderRadius: T.radius, padding: "16px" }}>
                  <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: col.isAfter ? T.accent : T.red, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{col.label}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginBottom: 10 }}>{col.period}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 28, fontWeight: 800, color: col.isAfter ? T.accent : T.red, marginBottom: 12 }}>{fmtD(col.total)}</div>
                  {[
                    ["Energy (" + col.kwh.toLocaleString() + " kWh)", fmtD(col.energy)],
                    ["Base Fee",  fmtD(col.base)],
                    ["City Tax",  fmtD(col.tax)],
                    ["Franchise", fmtD(col.franchise)],
                    ["Daily kWh", col.dailyKwh],
                    ["Daily Cost",fmtD(col.dailyCost)],
                  ].map(function(r) {
                    return (
                      <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: T.sans, fontSize: 12 }}>
                        <span style={{ color: T.textMuted }}>{r[0]}</span>
                        <span style={{ fontWeight: 600, color: T.textPrimary }}>{r[1]}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Full monthly history table */}
          <Card style={{ marginBottom: 0 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              12-Month Usage History ({activeUnit})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
              {["Month", "2025 kWh", "2026 kWh", "Change"].map(function(h) {
                return <div key={h} style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 8px", borderBottom: "2px solid " + T.border }}>{h}</div>;
              })}
              {activeHistory.map(function(m) {
                var drop = m.after > 0 ? pctDrop(m) : null;
                var rowBg = m.highlight ? T.accentLight : "transparent";
                return [
                  <div key={m.month + "m"} style={{ background: rowBg, fontFamily: T.sans, fontSize: 13, fontWeight: m.highlight ? 700 : 400, color: T.textPrimary, padding: "8px 8px", borderBottom: "1px solid " + T.border }}>{m.month}</div>,
                  <div key={m.month + "b"} style={{ background: rowBg, fontFamily: T.sans, fontSize: 13, color: T.textSec, padding: "8px 8px", borderBottom: "1px solid " + T.border }}>{m.before > 0 ? m.before.toLocaleString() : "--"}</div>,
                  <div key={m.month + "a"} style={{ background: rowBg, fontFamily: T.sans, fontSize: 13, color: m.after > 0 ? T.accent : T.textMuted, fontWeight: m.after > 0 ? 600 : 400, padding: "8px 8px", borderBottom: "1px solid " + T.border }}>{m.after > 0 ? m.after.toLocaleString() : "--"}</div>,
                  <div key={m.month + "d"} style={{ background: rowBg, fontFamily: T.sans, fontSize: 13, color: drop !== null ? T.accent : T.textMuted, fontWeight: drop !== null ? 700 : 400, padding: "8px 8px", borderBottom: "1px solid " + T.border }}>{drop !== null ? "-" + drop + "%" : "--"}</div>,
                ];
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function RealExampleScreen() {
  var b = CONFIG.exampleBill;
  return (
    <Wrap>
      <SecTitle
        children="Real Home Performance Data"
        sub="Actual utility data from a real homeowner -- before and after efficiency improvements."
      />
      <RealDataModule />
      <Disc lines={["These are real bills from one homeowner. Results do not represent guaranteed outcomes. Actual savings vary by home, usage, weather, and system."]} />
      <RepNote say="Lead with the insight, not the data table. Let them ask to see more." phrase="Same home. Same month. Same utility. $134 less." ask="Does that kind of difference matter to your household?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 6 -- Home Snapshot (pain points only -- no duplicate data entry)
// ============================================================
function HomeSnapshotScreen({ homeProfile, setHomeProfile }) {
  var painOptions = [
    { id: "unevenTemp",     label: "Uneven temperatures" },
    { id: "highBills",      label: "High energy bills" },
    { id: "dustAllergies",  label: "Dust / allergies" },
    { id: "runsConstantly", label: "System runs constantly" },
  ];
  function togglePain(id) {
    var cur = homeProfile.painPoints || [];
    setHomeProfile(function(p) {
      return Object.assign({}, p, { painPoints: cur.indexOf(id) > -1 ? cur.filter(function(x) { return x !== id; }) : cur.concat([id]) });
    });
  }
  function insight() {
    var pts = homeProfile.painPoints || [];
    if (pts.indexOf("dustAllergies")  > -1) return "Dust issues often point to leaky return ducts pulling in attic or crawlspace air.";
    if (pts.indexOf("unevenTemp")     > -1) return "Uneven temps usually mean airflow imbalances -- rooms starved or oversupplied.";
    if (pts.indexOf("highBills")      > -1) return "High bills often mean the system works harder than it should to compensate for air loss.";
    if (pts.indexOf("runsConstantly") > -1) return "Non-stop runtime often means the system is fighting leakage it cannot overcome.";
    return "Select a frustration above to see what it usually means.";
  }

  var elec     = parseFloat(homeProfile.electricBill) || 0;
  var gas      = parseFloat(homeProfile.gasBill)      || 0;
  var combined = elec + gas;

  return (
    <Wrap>
      <SecTitle children="About This Home" sub="A quick summary of what we know -- then let's hear what's been bothering them." />

      {/* Read-only home summary strip */}
      <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "16px 20px", marginBottom: 24, boxShadow: T.shadow }}>
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Home at a Glance</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Square Feet",    val: homeProfile.squareFeet ? homeProfile.squareFeet.toLocaleString() : "--" },
            { label: "Year Built",     val: homeProfile.yearBuilt  || "--" },
            { label: "HVAC Systems",   val: homeProfile.systemCount || "--" },
            { label: "Electric / mo",  val: elec  > 0 ? fmt(elec)  : "--" },
            { label: "Gas / mo",       val: gas   > 0 ? fmt(gas)   : "--" },
            { label: "Combined / mo",  val: combined > 0 ? fmt(combined) : "--" },
          ].map(function(s) {
            return (
              <div key={s.label}>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{s.val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pain points */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 12 }}>What's been frustrating about this home?</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {painOptions.map(function(opt) {
            var sel = (homeProfile.painPoints || []).indexOf(opt.id) > -1;
            return (
              <button key={opt.id} onClick={function() { togglePain(opt.id); }} style={{
                padding: "14px 16px", borderRadius: T.radiusSm, textAlign: "left",
                border: "2px solid " + (sel ? T.accent : T.border),
                background: sel ? T.accentLight : T.surface,
                color: sel ? T.accent : T.textSec,
                fontFamily: T.sans, fontSize: 14, fontWeight: sel ? 700 : 400, cursor: "pointer",
              }}>
                {sel ? "✓  " : ""}{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic insight */}
      {(homeProfile.painPoints || []).length > 0 && (
        <Card style={{ background: T.accentLight, border: "1px solid " + T.accent + "33", marginBottom: 0 }}>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.accent, margin: 0, lineHeight: 1.7 }}>
            <strong>What this usually means: </strong>{insight()}
          </p>
        </Card>
      )}

      <RepNote say="This is where you personalize it. Their frustrations are the bridge to the solution." phrase="What bothers you most about how the house feels day to day?" ask="Is it more a comfort issue or more about the bills?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 7 -- Problem
// ============================================================
function ProblemScreen() {
  return (
    <Wrap>
      <SecTitle children="Where the Air Is Going" sub="Most homes lose 20-40% of conditioned air before it reaches the rooms." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
        {[
          ["Air Escaping the Ducts",  "Leaks throughout the duct network let conditioned air escape into unconditioned spaces before it reaches the rooms."],
          ["Hot and Cold Spots",      "Pressure imbalances leave some rooms oversupplied and others starved -- no matter what the thermostat says."],
          ["Overworked Equipment",    "The system keeps running to compensate, adding wear and driving up runtime and costs."],
          ["Whole-Home Inefficiency", "Most HVAC service addresses the unit -- not the leaking delivery system behind the walls."],
        ].map(function(b) {
          return <Card key={b[0]}><div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{b[0]}</div><div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{b[1]}</div></Card>;
        })}
      </div>
      <div style={{ background: T.dark, borderRadius: T.radius, padding: "24px 28px" }}>
        <div style={{ fontFamily: T.sans, fontSize: 18, color: T.white, lineHeight: 1.4 }}>Regular HVAC maintenance keeps the equipment running -- it does not fix where the air is actually going.</div>
      </div>
      <RepNote say="Use 20-30% as a range. Keep it conversational." phrase="Imagine paying to heat or cool air that never reaches the room." ask="Has anyone ever looked at the duct system itself, not just the unit?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 8 -- Impact
// ============================================================
function ImpactScreen({ homeProfile }) {
  var pts = homeProfile.painPoints || [];
  return (
    <Wrap>
      <SecTitle children="What That Means in Real Life" sub="Air loss affects how the home feels every day, not just the bill." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[
          ["Dust and Allergens",    "Leaky return ducts pull in attic dust and allergens, then distribute them throughout the home.",          "dustAllergies"],
          ["Uncomfortable Rooms",  "When air does not arrive where it should, rooms feel off no matter what you set the thermostat to.",       "unevenTemp"],
          ["Non-Stop Runtime",     "A leaking system never fully satisfies demand, so the equipment cycles longer and harder than it should.", "runsConstantly"],
          ["Higher Monthly Bills", "Running harder and longer to compensate for lost air directly increases energy consumption.",               "highBills"],
        ].map(function(item) {
          var match = pts.indexOf(item[2]) > -1;
          return (
            <Card key={item[0]} style={match ? { border: "2px solid " + T.accent } : {}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7, gap: 8 }}>
                <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.dark, lineHeight: 1.25 }}>{item[0]}</div>
                {match && <Bdg variant="accent">Your home</Bdg>}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{item[1]}</div>
            </Card>
          );
        })}
      </div>
      <RepNote say="Connect their specific pain points to the leakage story." phrase="All of these usually trace back to one root cause." ask="Which of these feels most like this home right now?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 9 -- Solution
// ============================================================
// ============================================================
// AEROSEAL EDUCATION MODULE
// Conditionally rendered whenever Aeroseal duct sealing is
// part of the selected package or recommendation.
// All copy is governed by the approved fact base -- no banned phrases.
// ============================================================

// All 3 EG Comfort packages include Aeroseal duct sealing
function packageIncludesAeroseal(packageId) {
  return packageId === "coreSeal" || packageId === "performance" || packageId === "ultimate";
}

function AerosealModule({ packageId, context }) {
  // context: "solution" | "package" | "faq"
  var s1 = useState(false); var expanded   = s1[0]; var setExpanded   = s1[1];
  var s2 = useState(false); var showTech   = s2[0]; var setShowTech   = s2[1];
  var s3 = useState(null);  var openFaq    = s3[0]; var setOpenFaq    = s3[1];

  if (!packageIncludesAeroseal(packageId)) return null;

  var faqs = [
    {
      id: "what",
      q: "What is used to seal the ducts, and is it safe?",
      a: "Aeroseal uses a water-based, non-toxic, low-VOC sealant that moves through the duct system as a dry mist and seals leaks from the inside. Aeroseal describes it as non-toxic and notes it has been used in homes as well as settings such as hospitals, schools, and surgery centers.",
    },
    {
      id: "smell",
      q: "Does it smell?",
      a: "There may be a very mild temporary odor during application, often compared to white glue. It typically fades within a few hours after the process is complete.",
    },
    {
      id: "coat",
      q: "Does it coat the whole duct system?",
      a: "No. The particles are intended to stay airborne until they reach leak points, where they collect and build a seal. It is designed to seal the leaks themselves rather than coat the entire duct interior.",
    },
    {
      id: "kids",
      q: "Is it safe for kids and pets?",
      a: "Aeroseal describes the sealant as non-toxic and low-VOC. The company notes it has been used in schools, hospitals, and surgery centers. There may be a mild temporary odor during application. If there are specific sensitivities in the household, it is always a good idea to discuss those with the installation team before the appointment.",
    },
  ];

  function FaqItem({ item }) {
    var isOpen = openFaq === item.id;
    return (
      <div style={{ borderBottom: "1px solid " + T.border }}>
        <button
          onClick={function() { setOpenFaq(isOpen ? null : item.id); }}
          style={{ width: "100%", background: "none", border: "none", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.textPrimary, textAlign: "left", gap: 12 }}
        >
          <span>{item.q}</span>
          <span style={{ color: T.accent, fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && (
          <div style={{ paddingBottom: 14, fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.7 }}>
            {item.a}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28, border: "1px solid " + T.accent + "44", borderRadius: T.radius, overflow: "hidden" }}>

      {/* Header -- always visible */}
      <button
        onClick={function() { setExpanded(function(v) { return !v; }); }}
        style={{ width: "100%", background: T.accentLight, border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C8 2 3 5 3 9.5C3 12 5.2 14 8 14C10.8 14 13 12 13 9.5C13 5 8 2 8 2Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M8 8V11M8 6H8.01" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.accent }}>About the Aeroseal Process</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>What it is, how it works, safety information</div>
          </div>
        </div>
        <span style={{ color: T.accent, fontSize: 20, fontWeight: 300, flexShrink: 0 }}>{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "20px 22px", background: T.surface }}>

          {/* Primary explanation */}
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSec, lineHeight: 1.75, margin: "0 0 18px" }}>
            Aeroseal seals duct leaks from the inside using a <strong>water-based, non-toxic, low-VOC sealant</strong>. The material is introduced into the duct system as a dry mist while the ducts are pressurized. As the particles move through the ductwork, they stay airborne until they reach leak points, where they collect and seal the gaps.
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSec, lineHeight: 1.75, margin: "0 0 22px" }}>
            This is designed to seal the leaks themselves rather than coat the entire duct system.
          </p>

          {/* FAQ accordion */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Common Questions</div>
            {faqs.map(function(item) { return <FaqItem key={item.id} item={item} />; })}
          </div>

          {/* Expanded technical version toggle */}
          {!showTech && (
            <button
              onClick={function() { setShowTech(true); }}
              style={{ background: "none", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "9px 16px", fontFamily: T.sans, fontSize: 13, color: T.textSec, cursor: "pointer", marginBottom: 18 }}
            >
              Show technical details
            </button>
          )}

          {showTech && (
            <div style={{ background: T.surfaceHigh, borderRadius: T.radiusSm, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Technical Detail</div>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.75, margin: "0 0 10px" }}>
                When Aeroseal is applied, the duct system is pressurized and the sealant is introduced as a fine atomized mist. The particles travel through the ductwork and collect at leakage points, where they build on the edges of the opening and seal the leak from the inside.
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.75, margin: 0 }}>
                Aeroseal describes the sealant as water-based, non-toxic, non-flammable, and low VOC. The company notes that a very mild temporary odor may be present during the application process and typically dissipates within a few hours.
              </p>
            </div>
          )}

          {/* External resource links */}
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Aeroseal Resources</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://aeroseal.com/faq/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accentLight, color: T.accent, fontFamily: T.sans, fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: T.radiusSm, textDecoration: "none", border: "1px solid " + T.accent + "33" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#1A9E6B" strokeWidth="1.2"/><path d="M6.5 4V7M6.5 9H6.51" stroke="#1A9E6B" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Learn More About Aeroseal
            </a>
            <a href="https://aeroseal.com/industries/residential-retrofit/homeowners/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, color: T.textSec, fontFamily: T.sans, fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: T.radiusSm, textDecoration: "none", border: "1px solid " + T.border }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5L6.5 2L11.5 6.5V11.5H8.5V8.5H4.5V11.5H1.5V6.5Z" stroke="#4A4A4A" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              Aeroseal for Homeowners
            </a>
            {showTech && (
              <a href="https://aeroseal.com/resource-library/data-sheets/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, color: T.textSec, fontFamily: T.sans, fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: T.radiusSm, textDecoration: "none", border: "1px solid " + T.border }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2H8L11 5V11H3V2Z" stroke="#4A4A4A" strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 2V5H11" stroke="#4A4A4A" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                Technical Product Information
              </a>
            )}
          </div>

          {/* Compliance note */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid " + T.border, fontFamily: T.sans, fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
            Aeroseal technology is a separate company from EG Comfort. Safety descriptions above are sourced from Aeroseal published materials. Actual installation conditions vary. Discuss any specific sensitivities with your installation team prior to service.
          </div>
        </div>
      )}
    </div>
  );
}

function SolutionScreen() {
  return (
    <Wrap>
      <SecTitle children="EG Comfort Core Seal" sub="We seal the system from the inside -- no demolition, no guesswork." />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
        {[
          ["1","Diagnose",           "We measure actual airflow and locate leakage points throughout the duct network."],
          ["2","Aeroseal Sealing",   "Pressurized sealant particles find and seal leaks from inside -- no wall openings needed."],
          ["3","Airflow Balance",    "We balance the system so each room receives the right amount of conditioned air."],
          ["4","Verify Performance", "Before-and-after measurements show exactly how much leakage was reduced."],
        ].map(function(s) {
          return (
            <div key={s[0]} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 18px", background: T.surface, borderRadius: T.radius, border: "1px solid " + T.border, boxShadow: T.shadow }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, fontWeight: 700, color: T.accent, fontSize: 16 }}>{s[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 5 }}>{s[1]}</div>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, lineHeight: 1.65 }}>{s[2]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Card style={{ background: T.positiveD, border: "1px solid " + T.accent + "33", marginBottom: 0 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontWeight: 700 }}>Technology Note</div>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, margin: 0, lineHeight: 1.65 }}>EG Comfort uses Aeroseal technology, invented in 1997. EG Comfort is a licensed installer applying this technology independently. Aeroseal's published track record belongs to Aeroseal. EG Comfort is a separate company. Actual results vary.</p>
      </Card>
      <AerosealModule packageId="coreSeal" context="solution" />
      <RepNote say="Explain that we pressurize the system and let the sealant find the leaks from the inside." phrase="We seal it from the inside -- no tearing open walls or ceilings." ask="Does that process make sense?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 10 -- Packages
// ============================================================
function PackagesScreen({ selectedPackageId, setSelectedPackageId }) {
  var pkgs = Object.values(CONFIG.packages);
  return (
    <Wrap>
      <SecTitle children="Choose the Right Package" sub="Select the option that fits this home. Add-ons are on the next screen." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
        {pkgs.map(function(pkg) {
          var sel = selectedPackageId === pkg.id;
          var isMid = pkg.id === "performance";
          return (
            <div key={pkg.id} onClick={function() { setSelectedPackageId(pkg.id); }} style={{ background: isMid ? "#1E2832" : T.surface, border: "2px solid " + (sel ? T.positive : isMid ? T.accentMid : T.surfaceBorder), borderRadius: T.radius, padding: isMid ? "32px 24px" : "26px 22px", cursor: "pointer", transition: "all 0.18s", boxShadow: isMid ? "0 8px 32px rgba(39,209,127,0.12), 0 2px 12px rgba(0,0,0,0.4)" : sel ? T.shadowGlow : T.shadow, transform: isMid ? "scale(1.03)" : "scale(1)" }}>
              {pkg.badge && <div style={{ marginBottom: 14 }}><Bdg variant={isMid ? "gold" : "muted"}>{pkg.badge}</Bdg></div>}
              <div style={{ fontFamily: T.sans, fontSize: 11, color: isMid ? "rgba(255,255,255,0.55)" : T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{pkg.name}</div>
              <div style={{ fontFamily: T.font, fontSize: 32, fontWeight: 700, color: isMid ? T.white : sel ? T.positive : T.textPrimary, marginBottom: 18 }}>{fmt(pkg.price)}</div>
              <div style={{ borderTop: "1px solid " + T.surfaceBorder, paddingTop: 14 }}>
                {pkg.includes.map(function(item) {
                  return <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 9 }}><span style={{ color: isMid ? T.accentMid : T.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span><span style={{ fontFamily: T.sans, fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>{item}</span></div>;
                })}
              </div>
              {sel && <div style={{ marginTop: 16, background: T.positiveD, borderRadius: T.radiusSm, padding: "9px", textAlign: "center", fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.positive }}>Selected</div>}
            </div>
          );
        })}
      </div>
      <AerosealModule packageId={selectedPackageId} context="package" />
      <RepNote say="Present all three tiers. For a 2-system home, $3,000 is a natural anchor." phrase="Most homeowners with two systems land in the Performance package." ask="Does one of these feel like the right fit?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 11 -- Add-Ons (Guided Configuration + Pricing Engine)
// ============================================================
function AddonsScreen({ selectedPackageId, addons, setAddons, homeProfile, addonConfigs, setAddonConfigs, scoreInputs }) {
  var visible = visibleAddons(homeProfile.hasPool);
  var sys  = homeProfile.systemCount || 1;
  var sqft = homeProfile.squareFeet || 2000;
  var homeSize = getHomeSize(sqft);

  // Live score + savings projection that updates as add-ons are toggled
  var si              = scoreInputs || {};
  var currentScore    = calculateEfficiencyScore(si);
  var emptyAddons     = { ductCleaning: false, bootSealing: false, emporiaMonitor: false, thermostatPackage: false, filterUpgrade: false, poolPump: false, hvacReplacement: false };
  var pkgOnly         = calculateDualUtilitySavings(currentScore, homeProfile, si, selectedPackageId, emptyAddons);
  var withSelections  = calculateDualUtilitySavings(currentScore, homeProfile, si, selectedPackageId, addons);
  var addonCount      = Object.keys(addons).filter(function(k) { return addons[k] && !addonIncluded(selectedPackageId, k); }).length;

  function toggle(id) { setAddons(function(p) { return Object.assign({}, p, { [id]: !p[id] }); }); }
  function setCfg(key, val) { setAddonConfigs(function(p) { return Object.assign({}, p, { [key]: val }); }); }

  function selBtn(label, active, onClick) {
    return (
      <button key={label} onClick={onClick} style={{
        padding: "9px 16px", borderRadius: T.radiusSm, fontFamily: T.sans, fontSize: 14,
        fontWeight: active ? 700 : 400,
        border: "1.5px solid " + (active ? T.accent : T.border),
        background: active ? T.accentLight : T.surface,
        color: active ? T.accent : T.textSec, cursor: "pointer",
      }}>{label}</button>
    );
  }

  function ConfigRow({ label, children }) {
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{children}</div>
      </div>
    );
  }

  // Score band & color for the live indicator (uses projected score with current selections)
  var liveProjected = withSelections.projScoreLow > 0 ? Math.round((withSelections.projScoreLow + withSelections.projScoreHigh) / 2) : currentScore;
  var liveBand      = getEfficiencyBand(liveProjected);
  var pkgOnlyMid    = pkgOnly.projScoreLow > 0 ? Math.round((pkgOnly.projScoreLow + pkgOnly.projScoreHigh) / 2) : currentScore;
  var addonBoost    = liveProjected - pkgOnlyMid;

  return (
    <Wrap>
      <SecTitle children="System Configuration" sub="Configure each add-on for this home. Price updates automatically." />

      {/* ── LIVE SCORE + SAVINGS PROJECTION ── updates as add-ons are toggled ── */}
      <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "20px 22px", marginBottom: 22, boxShadow: T.shadowMd }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Score & Savings</div>
          {addonCount > 0 && <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: "#27D17F", background: "rgba(39,209,127,0.15)", padding: "3px 10px", borderRadius: 99 }}>{addonCount} add-on{addonCount > 1 ? "s" : ""} selected</div>}
        </div>

        {/* Score progression -- current → projected */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Current</div>
            <div style={{ fontFamily: T.sans, fontSize: 28, fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>{currentScore}</div>
          </div>
          <div style={{ flex: 2, position: "relative", height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: currentScore + "%", width: Math.max(0, liveProjected - currentScore) + "%", height: "100%", background: "linear-gradient(90deg, " + liveBand.color + "55, " + liveBand.color + ")", borderRadius: 99, transition: "all 0.4s ease" }} />
            <div style={{ position: "absolute", left: 0, width: currentScore + "%", height: "100%", background: "rgba(255,255,255,0.2)", borderRadius: 99 }} />
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Projected</div>
            <div style={{ fontFamily: T.sans, fontSize: 28, fontWeight: 800, color: liveBand.color, lineHeight: 1, transition: "color 0.3s" }}>{liveProjected}</div>
          </div>
        </div>

        {/* Savings + improvement breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Score Improvement</div>
            <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>+{withSelections.scoreLow} to +{withSelections.scoreHigh} pts</div>
            {addonBoost > 0 && <div style={{ fontFamily: T.sans, fontSize: 11, color: "#27D17F", marginTop: 2 }}>+{addonBoost} from add-ons</div>}
          </div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Annual Savings</div>
            <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#27D17F" }}>{withSelections.combLow > 0 ? fmt(withSelections.combLow) + " – " + fmt(withSelections.combHigh) : "Enter bills"}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Monthly Savings</div>
            <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#27D17F" }}>{withSelections.monthlyLow > 0 ? fmt(withSelections.monthlyLow) + " – " + fmt(withSelections.monthlyHigh) : "--"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {visible.map(function(addon) {
          var inc    = addonIncluded(selectedPackageId, addon.id);
          var active = addons[addon.id] && !inc;
          var price  = calculateAddonPrice(addon.id, homeProfile, addonConfigs);
          var a      = CONFIG.addons[addon.id];

          return (
            <div key={addon.id} style={{
              background: inc ? "#F5F5F3" : T.white,
              border: "2px solid " + (active ? T.accent : (inc ? T.border : T.border)),
              borderRadius: T.radius, padding: "18px",
              opacity: inc ? 0.72 : 1,
              boxShadow: active ? T.shadowMd : T.shadow,
              transition: "all 0.18s",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: inc ? 0 : 10 }}>
                <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: inc ? T.muted : T.dark }}>{addon.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {inc
                    ? <Bdg variant="muted">Included</Bdg>
                    : <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: active ? T.accent : T.mid }}>{fmt(price)}</div>
                  }
                  {!inc && (
                    <div onClick={function() { toggle(addon.id); }} style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: "2px solid " + (active ? T.accent : T.border),
                      background: active ? T.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: T.white, fontSize: 14, cursor: "pointer", flexShrink: 0,
                    }}>{active ? "+" : ""}</div>
                  )}
                </div>
              </div>

              {/* Configurator rows -- only show when active */}
              {active && addon.id === "ductCleaning" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, marginBottom: 4 }}>
                    Home size detected: <strong style={{ color: T.dark }}>{homeSize}</strong> ({sqft.toLocaleString()} sq ft) -- {fmt(a.basePrice)} base x {a.sizeMultipliers[homeSize]}
                  </div>
                </div>
              )}

              {active && addon.id === "bootSealing" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
                    {fmt(a.pricePerSystem)} x {sys} system{sys > 1 ? "s" : ""}
                  </div>
                </div>
              )}

              {active && addon.id === "emporiaMonitor" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <ConfigRow label="Electrical Panels">
                    {[1, 2, 3].map(function(n) {
                      return selBtn(n + " panel" + (n > 1 ? "s" : ""), (addonConfigs.panelCount || 1) === n, function() { setCfg("panelCount", n); });
                    })}
                  </ConfigRow>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                    {fmt(a.basePricePerPanel + a.installPerPanel)} per panel (hardware + install)
                  </div>
                </div>
              )}

              {active && addon.id === "thermostatPackage" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <ConfigRow label="Thermostat Type">
                    {selBtn("Basic -- $350", (addonConfigs.thermostatType || a.defaultType) === "basic", function() { setCfg("thermostatType", "basic"); })}
                    {selBtn("Advanced -- $550", (addonConfigs.thermostatType || a.defaultType) === "advanced", function() { setCfg("thermostatType", "advanced"); })}
                    {selBtn("Premium -- $850", (addonConfigs.thermostatType || a.defaultType) === "premium", function() { setCfg("thermostatType", "premium"); })}
                  </ConfigRow>
                  <ConfigRow label="Installation">
                    {selBtn("Standard -- $150", (addonConfigs.thermostatInstall || a.defaultInstall) === "standard", function() { setCfg("thermostatInstall", "standard"); })}
                    {selBtn("Complex -- $300", (addonConfigs.thermostatInstall || a.defaultInstall) === "complex", function() { setCfg("thermostatInstall", "complex"); })}
                  </ConfigRow>
                  <ConfigRow label="Room Sensors ($85 each)">
                    {[0, 1, 2, 3, 4, 5].map(function(n) {
                      return selBtn(n === 0 ? "None" : n + "", (addonConfigs.sensorCount != null ? addonConfigs.sensorCount : a.defaultSensors) === n, function() { setCfg("sensorCount", n); });
                    })}
                  </ConfigRow>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 8 }}>
                    {sys} system{sys > 1 ? "s" : ""} x (thermostat + install) + sensors. Min {fmt(a.minPrice)}.
                  </div>
                </div>
              )}

              {active && addon.id === "filterUpgrade" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <ConfigRow label="Install Complexity">
                    {selBtn("Standard", (addonConfigs.filterComplexity || a.defaultComplexity) === "standard", function() { setCfg("filterComplexity", "standard"); })}
                    {selBtn("Difficult +$150", (addonConfigs.filterComplexity || a.defaultComplexity) === "difficult", function() { setCfg("filterComplexity", "difficult"); })}
                    {selBtn("Premium Cabinet +$200", (addonConfigs.filterComplexity || a.defaultComplexity) === "premium", function() { setCfg("filterComplexity", "premium"); })}
                  </ConfigRow>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                    {fmt(a.pricePerSystem + (a.complexityAdj[addonConfigs.filterComplexity || a.defaultComplexity] || 0))} x {sys} system{sys > 1 ? "s" : ""}
                  </div>
                </div>
              )}

              {active && addon.id === "poolPump" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <ConfigRow label="Pump Type">
                    {selBtn("Entry -- $1,800", (addonConfigs.pumpType || a.defaultType) === "entry", function() { setCfg("pumpType", "entry"); })}
                    {selBtn("Mid -- $2,200", (addonConfigs.pumpType || a.defaultType) === "mid", function() { setCfg("pumpType", "mid"); })}
                    {selBtn("Premium -- $2,600", (addonConfigs.pumpType || a.defaultType) === "premium", function() { setCfg("pumpType", "premium"); })}
                  </ConfigRow>
                  <ConfigRow label="Installation">
                    {selBtn("Standard -- $600", (addonConfigs.pumpInstall || a.defaultInstall) === "standard", function() { setCfg("pumpInstall", "standard"); })}
                    {selBtn("Complex -- $1,000", (addonConfigs.pumpInstall || a.defaultInstall) === "complex", function() { setCfg("pumpInstall", "complex"); })}
                  </ConfigRow>
                  <ConfigRow label="Pool Size">
                    {selBtn("Small <12k gal", (addonConfigs.poolSize || a.defaultPoolSize) === "small", function() { setCfg("poolSize", "small"); })}
                    {selBtn("Medium 12-20k", (addonConfigs.poolSize || a.defaultPoolSize) === "medium", function() { setCfg("poolSize", "medium"); })}
                    {selBtn("Large 20k+", (addonConfigs.poolSize || a.defaultPoolSize) === "large", function() { setCfg("poolSize", "large"); })}
                  </ConfigRow>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                    (pump + install) x pool size multiplier. Min {fmt(a.minPrice)}.
                  </div>
                </div>
              )}

              {active && addon.id === "hvacReplacement" && (
                <div style={{ borderTop: "1px solid " + T.border, paddingTop: 10, marginTop: 4 }}>
                  <ConfigRow label="System Type">
                    {selBtn("AC Only", (addonConfigs.hvacType || a.defaultType) === "ac", function() { setCfg("hvacType", "ac"); })}
                    {selBtn("Furnace Only", (addonConfigs.hvacType || a.defaultType) === "furnace", function() { setCfg("hvacType", "furnace"); })}
                    {selBtn("Heat Pump", (addonConfigs.hvacType || a.defaultType) === "heatPump", function() { setCfg("hvacType", "heatPump"); })}
                    {selBtn("Full System (AC + Furnace)", (addonConfigs.hvacType || a.defaultType) === "fullSystem", function() { setCfg("hvacType", "fullSystem"); })}
                  </ConfigRow>
                  <ConfigRow label="Efficiency Tier">
                    {selBtn("Standard SEER 14-15", (addonConfigs.hvacTier || a.defaultTier) === "standard", function() { setCfg("hvacTier", "standard"); })}
                    {selBtn("High SEER 16-18", (addonConfigs.hvacTier || a.defaultTier) === "high", function() { setCfg("hvacTier", "high"); })}
                    {selBtn("Premium SEER 19-22", (addonConfigs.hvacTier || a.defaultTier) === "premium", function() { setCfg("hvacTier", "premium"); })}
                  </ConfigRow>
                  <ConfigRow label="Number of Systems to Replace">
                    {[1, 2, 3, 4].map(function(n) {
                      var current = addonConfigs.hvacCount != null ? addonConfigs.hvacCount : sys;
                      return selBtn(n + " system" + (n > 1 ? "s" : ""), current === n, function() { setCfg("hvacCount", n); });
                    })}
                  </ConfigRow>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                    Highest-impact upgrade available. Modern equipment uses 30-50% less energy than systems 10+ years old. May qualify for utility rebates and federal tax credits. Range: {fmt(a.minPrice)} - {fmt(a.maxPrice)}.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <RepNote say="Walk through each add-on. Expand the config options when the homeowner shows interest." phrase="The price is built from the actual specs for this home -- nothing padded in." ask="Does anything here stand out as a priority for this property?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 12 -- Financing (Decision Screen)
// ============================================================
function FinancingScreen({ subtotal, selectedTermId, setSelectedTermId, homeProfile, scoreInputs, selectedPackageId, addons }) {
  var opt    = CONFIG.financeOptions.find(function(o) { return o.id === selectedTermId; }) || CONFIG.financeOptions[0];
  var result = calculatePayment(subtotal, opt.months, opt.apr);
  var isCash = opt.months === 0;
  var bill   = getCombinedBill(homeProfile);
  // Engine-projected savings from current package + add-on selections
  var si    = scoreInputs || {};
  var score = calculateEfficiencyScore(si);
  var proj  = calculateSavingsProjection(score, homeProfile, si, selectedPackageId, addons || {});
  var svs   = buildEngineScenarios(proj.savingsLow, proj.savingsHigh);

  return (
    <Wrap>
      <SecTitle children="Your Payment Options" sub="Choose how you want to handle the investment. Total cost changes by term." />

      {/* Term selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CONFIG.financeOptions.map(function(o) {
          var sel = selectedTermId === o.id;
          return (
            <button key={o.id} onClick={function() { setSelectedTermId(o.id); }} style={{ padding: "10px 18px", borderRadius: T.radiusSm, fontFamily: T.sans, fontSize: 13, fontWeight: sel ? 700 : 400, border: "2px solid " + (sel ? T.accent : T.border), background: sel ? T.accentLight : T.white, color: sel ? T.accent : T.mid, cursor: "pointer", transition: "all 0.15s" }}>
              {o.label}
              {o.badge && !sel ? "" : ""}
            </button>
          );
        })}
      </div>

      {/* Payment detail -- flex-wrap so 4 cards stack on mobile */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        {[
          { label: "Subtotal",       val: fmt(subtotal),              hi: false },
          { label: "Finance Charge", val: result.financeCharge > 0 ? fmt(result.financeCharge) : "None", hi: false },
          { label: "Total Cost",     val: fmt(result.totalPaid),      hi: true },
          { label: isCash ? "Pay in Full" : "Est. Monthly", val: isCash ? fmt(subtotal) : fmtD(result.monthly) + "/mo", hi: true },
        ].map(function(s) {
          return (
            <div key={s.label} style={{ flex: "1 1 120px", background: s.hi ? (isCash ? "#1E2832" : T.accent) : T.surface, border: "1px solid " + (s.hi ? "transparent" : T.border), borderRadius: T.radius, padding: "16px 12px", textAlign: "center", boxShadow: T.shadow }}>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: s.hi ? "rgba(255,255,255,0.55)" : T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: s.hi ? T.white : T.dark }}>{s.val}</div>
            </div>
          );
        })}
      </div>

      {/* Term note + badge */}
      <div style={{ background: T.accentLight, border: "1px solid " + T.accent + "44", borderRadius: T.radiusSm, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.accent }}>{opt.note}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {opt.badge && <Bdg variant="accent">{opt.badge}</Bdg>}
          {opt.apr > 0 && <Bdg variant="muted">APR {fmtPct(opt.apr)} (illustrative)</Bdg>}
          {isCash && <Bdg variant="gold">No finance charge</Bdg>}
        </div>
      </div>

      {/* Payoff -- engine-projected savings from selected upgrades */}
      <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        Savings Payoff Based on Your Selections
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, marginBottom: 14 }}>
        {svs.length > 0
          ? <span>Engine projects <strong style={{ color: T.dark }}>{fmt(proj.savingsLow)} – {fmt(proj.savingsHigh)}/yr</strong> in savings from the package + add-ons currently selected (calibrated to real EG Comfort customer outcomes). Below: how those savings pay off the {fmt(result.totalPaid)} total cost.</span>
          : <span>Add a package and any add-ons to see projected savings and payoff timeline here.</span>
        }
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        {svs.map(function(s) {
          var mo = payoffMonths(result.totalPaid, s.mo);
          var yr = payoffYears(mo);
          return (
            <div key={s.label} style={{ flex: "1 1 140px", background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "16px 14px", boxShadow: T.shadow, textAlign: "center" }}>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.accent, lineHeight: 1.1 }}>{fmt(s.annual)}<span style={{ fontSize: 11, fontWeight: 400 }}>/yr</span></div>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, marginBottom: 8 }}>{fmt(s.mo)}/mo • {s.note}</div>
              <div style={{ borderTop: "1px solid " + T.border, paddingTop: 8 }} />
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec, marginTop: 6 }}>
                {mo !== null ? <span>{mo} mo<br /><strong style={{ color: T.dark }}>{yr} yrs to offset</strong></span> : "N/A"}
              </div>
            </div>
          );
        })}
      </div>

      <Disc lines={[CONFIG.disclaimers.general, CONFIG.disclaimers.savings, CONFIG.disclaimers.finance, "Illustrative payoff timeline if savings were applied toward the investment."]} />
      <RepNote say="Lead with choice and control. Let them compare total cost vs monthly payment." phrase="Cash or short terms cost the least overall. Longer terms give you a lower monthly." ask="What matters more right now -- keeping monthly low or minimizing total cost?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 13 -- Proof
// ============================================================
function ProofScreen() {
  return (
    <Wrap>
      <SecTitle children="Why Trust the Technology" sub="The process EG Comfort uses is powered by Aeroseal -- a platform with a published track record." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          ["1997",     "Technology Invented",  "Aeroseal technology first developed -- per Aeroseal"],
          ["300K+",    "Homes Sealed",         "Per Aeroseal published figures"],
          ["8-15%",    "Avg. Utility Savings", "Aeroseal reported average range"],
          ["Licensed", "EG Comfort Status",    "Certified Aeroseal installer"],
        ].map(function(f) {
          return (
            <Card key={f[1]} style={{ textAlign: "center", padding: "24px 18px" }}>
              <div style={{ fontFamily: T.font, fontSize: 32, fontWeight: 700, color: T.accent, marginBottom: 5 }}>{f[0]}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{f[1]}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{f[2]}</div>
            </Card>
          );
        })}
      </div>
      <div style={{ background: T.surfaceHigh, border: "1px solid #E8D9A0", borderRadius: T.radius, padding: "18px 22px" }}>
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.warn, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Compliance Note</div>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec, margin: 0, lineHeight: 1.65 }}>{CONFIG.disclaimers.aeroseal} EG Comfort is a licensed installer. Actual results vary by home.</p>
      </div>
      <RepNote say="Use Aeroseal's track record for the technology, not as EG Comfort's history." phrase="The process we use is powered by Aeroseal -- they invented it in 1997." ask="Does knowing the underlying technology has that track record give you more confidence?" />
    </Wrap>
  );
}

// ============================================================
// SCREEN 14 -- Close
// ============================================================
function CloseScreen({ selectedPackageId, addons, homeProfile, subtotal, selectedTermId, addonConfigs, orderItems, scoreInputs }) {
  var pkg    = CONFIG.packages[selectedPackageId];
  var sys    = homeProfile.systemCount || 1;
  var opt    = CONFIG.financeOptions.find(function(o) { return o.id === selectedTermId; }) || CONFIG.financeOptions[0];
  var result = calculatePayment(subtotal, opt.months, opt.apr);
  var isCash = opt.months === 0;
  var bill   = getCombinedBill(homeProfile);
  var activeAddons = visibleAddons(homeProfile.hasPool).filter(function(a) { return addons[a.id] && !addonIncluded(selectedPackageId, a.id); });
  var hasOrderItems = orderItems && orderItems.length > 0;
  // Recalculate savings projection using same engine as diagnostic screen
  var si    = scoreInputs || {};
  var score = calculateEfficiencyScore(si);
  var proj  = calculateSavingsProjection(score, homeProfile, si, selectedPackageId, addons);
  // Engine-driven payoff scenarios (uses actual projected savings from
  // selected package + add-ons, not generic % of bill)
  var sv = buildEngineScenarios(proj.savingsLow, proj.savingsHigh);
  var billDisplay = getCombinedBill(homeProfile);
  var hasProj = proj.upgradeDetails.length > 0;

  // Order push state -- tracks the call to /api/order
  var sStatus = useState({ phase: "idle", message: "", estimateUrl: null });
  var pushStatus    = sStatus[0];
  var setPushStatus = sStatus[1];

  // Build line items for HCP order from either order builder OR package + add-ons
  function buildLineItems() {
    if (hasOrderItems) {
      return orderItems.map(function(it) {
        return {
          label:     it.customLabel || it.label,
          unitPrice: it.unitPrice,
          qty:       it.qty,
          note:      it.note || "",
        };
      });
    }
    var items = [];
    if (pkg) {
      items.push({
        label:     pkg.name,
        unitPrice: pkg.price,
        qty:       1,
        note:      "Includes: " + pkg.includes.join("; "),
      });
    }
    activeAddons.forEach(function(a) {
      items.push({
        label:     a.label,
        unitPrice: calculateAddonPrice(a.id, homeProfile, addonConfigs),
        qty:       1,
        note:      "",
      });
    });
    return items;
  }

  function buildOrderNotes() {
    var lines = [];
    lines.push("Efficiency Score: " + score + "/100 (" + getEfficiencyBand(score).label + ")");
    if (proj.savingsLow > 0) {
      lines.push("Projected Annual Savings: " + fmt(proj.savingsLow) + " - " + fmt(proj.savingsHigh));
      lines.push("Projected Score After: " + proj.projScoreLow + "-" + proj.projScoreHigh + "/100");
    }
    lines.push("Payment Option: " + opt.label + (opt.apr > 0 ? " @ " + fmtPct(opt.apr) + " APR" : ""));
    lines.push("Subtotal: " + fmt(subtotal) + " | Total: " + fmt(result.totalPaid));
    if (!isCash) lines.push("Estimated Monthly: " + fmtD(result.monthly));
    if ((homeProfile.painPoints || []).length > 0) {
      lines.push("Pain Points: " + homeProfile.painPoints.join(", "));
    }
    return lines.join("\n");
  }

  function handleMoveForward() {
    var firstName = (homeProfile.customerFirstName || "").trim();
    var lastName  = (homeProfile.customerLastName  || "").trim();
    if (!firstName && !lastName) {
      setPushStatus({ phase: "error", message: "Please enter customer first/last name on the property screen before sending to Housecall Pro.", estimateUrl: null });
      return;
    }
    setPushStatus({ phase: "sending", message: "Creating estimate in Housecall Pro...", estimateUrl: null });

    housecallProService.createOrder({
      customer: {
        customerId: homeProfile.hcpCustomerId || null,
        firstName:  firstName,
        lastName:   lastName,
        email:      homeProfile.customerEmail,
        phone:      homeProfile.customerPhone,
        address:    homeProfile.address,
        city:       homeProfile.city,
        state:      homeProfile.state,
        zip:        homeProfile.zip,
      },
      lineItems: buildLineItems(),
      notes:     buildOrderNotes(),
      totals: {
        subtotal:      subtotal,
        financeCharge: result.financeCharge,
        totalPaid:     result.totalPaid,
        monthly:       result.monthly,
        term:          opt.label,
      },
    }).then(function(resp) {
      setPushStatus({
        phase:   "success",
        message: "Estimate created in Housecall Pro" + (resp.estimateId ? " (id: " + resp.estimateId + ")" : ""),
        estimateUrl: resp.estimateUrl || null,
      });
    }).catch(function(err) {
      setPushStatus({
        phase:   "error",
        message: err.message || "Failed to create order",
        estimateUrl: null,
      });
    });
  }

  return (
    <Wrap>
      <SecTitle children="Your EG Comfort Summary" sub="Everything selected, totaled, and ready to move on." />

      {/* ORDER ITEMS view -- shown when order builder was used */}
      {hasOrderItems && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Order Items</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {orderItems.map(function(item) {
              return (
                <div key={item.key} style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{item.customLabel || item.label}</div>
                    {item.qty > 1 && <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>Qty: {item.qty} x {fmt(item.unitPrice)}</div>}
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.accent }}>{fmt(item.unitPrice * item.qty)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PACKAGE view -- shown when no order builder items */}
      {!hasOrderItems && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
          <Card>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Package</div>
            <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.dark, marginBottom: 3 }}>{pkg ? pkg.name : ""}</div>
            <div style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.accent, marginBottom: 14 }}>{fmt(pkg ? pkg.price : 0)}</div>
            <div style={{ paddingTop: 14, borderTop: "1px solid " + T.border }}>
              {pkg && pkg.includes.map(function(item) {
                return <div key={item} style={{ display: "flex", gap: 7, marginBottom: 7, fontFamily: T.sans, fontSize: 12, color: T.mid }}><span style={{ color: T.accent, flexShrink: 0 }}>+</span>{item}</div>;
              })}
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activeAddons.length > 0 && (
              <Card>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Add-Ons</div>
                {activeAddons.map(function(a) {
                  return <div key={a.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontFamily: T.sans, fontSize: 13 }}><span style={{ color: T.mid }}>{a.label}</span><span style={{ fontWeight: 700, color: T.dark }}>{fmt(calculateAddonPrice(a.id, homeProfile, addonConfigs))}</span></div>;
                })}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── EFFICIENCY SAVINGS PROJECTION ── same numbers as diagnostic ── */}
      {hasProj && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Home Efficiency Projection
          </div>

          {/* Score + improvement */}
          <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "20px 22px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Current Score</div>
                <div style={{ fontFamily: T.sans, fontSize: 28, fontWeight: 800, color: "#FFFFFF" }}>{score}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>/100</span></div>
              </div>
              <div style={{ textAlign: "center", padding: "0 16px" }}>
                <div style={{ fontFamily: T.sans, fontSize: 22, fontWeight: 700, color: "#27D17F" }}>+{proj.projScoreLow - score} to +{proj.projScoreHigh - score}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>score improvement</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Projected Score</div>
                <div style={{ fontFamily: T.sans, fontSize: 28, fontWeight: 800, color: "#27D17F" }}>{proj.projScoreLow}–{proj.projScoreHigh}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>/100</span></div>
              </div>
            </div>

            {/* Savings figures */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Est. Annual Savings</div>
                <div style={{ fontFamily: T.sans, fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>{fmt(proj.savingsLow)} – {fmt(proj.savingsHigh)}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>per year</div>
              </div>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Est. Monthly Savings</div>
                <div style={{ fontFamily: T.sans, fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>{fmt(proj.monthlyLow)} – {fmt(proj.monthlyHigh)}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>per month</div>
              </div>
            </div>

            {/* Payback -- engine-projected savings from selected upgrades applied to total cost */}
            {result.totalPaid > 0 && sv.length > 0 && (
              <div style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Estimated Payoff (engine-projected savings from your selections, applied to total cost of {fmt(result.totalPaid)})</div>
                {sv.map(function(s) {
                  var mo = payoffMonths(result.totalPaid, s.mo);
                  var yr = payoffYears(mo);
                  return (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, fontFamily: T.sans, fontSize: 14, color: "#FFFFFF" }}>
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{s.label} — {fmt(s.annual)}/yr ({fmt(s.mo)}/mo)</span>
                      <span style={{ fontWeight: 700, color: "#27D17F" }}>{yr} yrs</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Per-upgrade breakdown */}
          {proj.upgradeDetails.length > 0 && (
            <Card style={{ marginBottom: 0 }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Savings Breakdown by Upgrade</div>
              {proj.upgradeDetails.map(function(u) {
                return (
                  <div key={u.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 9, marginBottom: 9, borderBottom: "1px solid " + T.border }}>
                    <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textSec }}>{u.label}{u.multiplier < 1 ? " *" : ""}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(u.savingsLow)} – {fmt(u.savingsHigh)}/yr</div>
                  </div>
                );
              })}
              {proj.upgradeDetails.some(function(u) { return u.multiplier < 1; }) && (
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted }}>
                  * Diminishing returns applied on overlapping upgrades to avoid overstating savings.
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Payment summary -- always shown */}
      <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "18px", boxShadow: T.shadow, marginBottom: 14 }}>
        {[
          { label: "Subtotal",       val: fmt(subtotal) },
          { label: "Payment Option", val: opt.label + (opt.apr > 0 ? " @ " + fmtPct(opt.apr) + " APR" : "") },
          { label: "Finance Charge", val: result.financeCharge > 0 ? fmt(result.financeCharge) : "None" },
          { label: "Total Price",    val: fmt(result.totalPaid), bold: true },
          { label: isCash ? "Pay in Full" : "Est. Monthly", val: isCash ? fmt(result.totalPaid) : fmtD(result.monthly) + "/mo", bold: true, green: true },
        ].map(function(r) {
          return <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontFamily: T.sans, fontSize: 14 }}><span style={{ color: T.muted }}>{r.label}</span><span style={{ fontWeight: r.bold ? 700 : 400, color: r.green ? T.accent : T.dark }}>{r.val}</span></div>;
        })}
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <button
          onClick={handleMoveForward}
          disabled={pushStatus.phase === "sending"}
          style={{ flex: 1, padding: "17px", background: pushStatus.phase === "sending" ? T.surfaceHigh : T.grad, border: "none", borderRadius: T.radiusSm, fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: pushStatus.phase === "sending" ? T.textMuted : T.white, cursor: pushStatus.phase === "sending" ? "wait" : "pointer", boxShadow: pushStatus.phase === "sending" ? "none" : "0 5px 18px rgba(39,209,127,0.28)" }}
        >
          {pushStatus.phase === "sending" ? "Sending to Housecall Pro..." : "Move Forward (Send to Housecall Pro)"}
        </button>
        <button style={{ flex: 1, padding: "17px", background: T.surface, border: "1px solid " + T.surfaceBorder, borderRadius: T.radiusSm, fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.positive, cursor: "pointer" }}>Schedule Install</button>
      </div>

      {/* Push status feedback */}
      {pushStatus.phase === "success" && (
        <div style={{ background: T.positiveD, border: "1px solid " + T.positive + "55", borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.positive, marginBottom: 4 }}>✓ Sent to Housecall Pro</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec }}>{pushStatus.message}</div>
          {pushStatus.estimateUrl && <a href={pushStatus.estimateUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6, fontFamily: T.sans, fontSize: 13, color: T.positive, fontWeight: 600 }}>Open estimate in Housecall Pro →</a>}
        </div>
      )}
      {pushStatus.phase === "error" && (
        <div style={{ background: T.dangerD, border: "1px solid " + T.danger + "55", borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Could not send to Housecall Pro</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.textSec }}>{pushStatus.message}</div>
        </div>
      )}
      <Disc lines={[CONFIG.disclaimers.general, CONFIG.disclaimers.savings, CONFIG.disclaimers.finance]} />
      <RepNote say="Keep the close simple. Ask for the decision directly." phrase="Is there anything you need to feel good about moving forward?" ask="Is it more the investment, or more about timing?" />
    </Wrap>
  );
}

// ============================================================
// ORDER BUILDER SCREEN
// Free-form order: rep can add anything in any order, any qty.
// Customers can buy whatever they want from us.
// ============================================================
function OrderBuilderScreen({ orderItems, setOrderItems, selectedTermId }) {
  var s1 = useState("Packages"); var activeCategory = s1[0]; var setActiveCategory = s1[1];
  var s2 = useState(null);       var editKey        = s2[0]; var setEditKey        = s2[1];

  var total = orderTotal(orderItems);
  var opt   = CONFIG.financeOptions.find(function(o) { return o.id === selectedTermId; }) || CONFIG.financeOptions[0];
  var payment = calculatePayment(total, opt.months, opt.apr);

  function addItem(entry) {
    setOrderItems(function(prev) { return prev.concat([newOrderItem(entry)]); });
  }

  function removeItem(key) {
    setOrderItems(function(prev) { return prev.filter(function(i) { return i.key !== key; }); });
  }

  function updateQty(key, delta) {
    setOrderItems(function(prev) {
      return prev.map(function(i) {
        if (i.key !== key) return i;
        return Object.assign({}, i, { qty: Math.max(1, i.qty + delta) });
      });
    });
  }

  function updatePrice(key, val) {
    setOrderItems(function(prev) {
      return prev.map(function(i) {
        if (i.key !== key) return i;
        return Object.assign({}, i, { unitPrice: parseFloat(val) || 0 });
      });
    });
  }

  function updateLabel(key, val) {
    setOrderItems(function(prev) {
      return prev.map(function(i) {
        if (i.key !== key) return i;
        return Object.assign({}, i, { customLabel: val });
      });
    });
  }

  var catalogForCategory = ORDER_CATALOG.filter(function(e) { return e.category === activeCategory; });

  return (
    <Wrap>
      <SecTitle children="Build the Order" sub="Add whatever the customer wants -- any combination, any order, any quantity." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* LEFT: catalog */}
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Add to Order</div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {ORDER_CATEGORIES.map(function(cat) {
              var sel = activeCategory === cat;
              return (
                <button key={cat} onClick={function() { setActiveCategory(cat); }} style={{
                  padding: "7px 14px", borderRadius: 99, fontFamily: T.sans, fontSize: 13, fontWeight: sel ? 700 : 500,
                  border: "1.5px solid " + (sel ? T.accent : T.border),
                  background: sel ? T.accentLight : T.surface,
                  color: sel ? T.accent : T.textSec, cursor: "pointer",
                }}>{cat}</button>
              );
            })}
          </div>

          {/* Catalog items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {catalogForCategory.map(function(entry) {
              return (
                <div key={entry.id} style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 2 }}>{entry.label}</div>
                    {entry.note && <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted }}>{entry.note}</div>}
                    <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.accent, marginTop: 4 }}>
                      {entry.unitPrice > 0 ? fmt(entry.unitPrice) : "Custom price"}
                    </div>
                  </div>
                  <button onClick={function() { addItem(entry); }} style={{
                    width: 34, height: 34, borderRadius: "50%", border: "none",
                    background: T.grad, color: T.white,
                    fontFamily: T.sans, fontSize: 20, fontWeight: 300,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, boxShadow: "0 2px 8px rgba(43,179,163,0.3)",
                  }}>+</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: current order */}
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Current Order {orderItems.length > 0 ? "(" + orderItems.length + " items)" : ""}
          </div>

          {orderItems.length === 0 && (
            <div style={{ background: T.surfaceHigh, borderRadius: T.radius, padding: "28px", textAlign: "center" }}>
              <div style={{ fontFamily: T.sans, fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>
                No items yet. Add from the catalog on the left.
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {orderItems.map(function(item) {
              var isCustom = item.id === "svc_custom";
              var isEdit   = editKey === item.key;
              return (
                <div key={item.key} style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: T.radius, padding: "14px 16px", boxShadow: T.shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      {/* Label -- editable for custom items */}
                      {isCustom && isEdit ? (
                        <input
                          value={item.customLabel || item.label}
                          onChange={function(e) { updateLabel(item.key, e.target.value); }}
                          placeholder="Description"
                          style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid " + T.accent, borderRadius: T.radiusSm, padding: "6px 10px", fontFamily: T.sans, fontSize: 14, color: T.textPrimary, background: T.surface, outline: "none", marginBottom: 6 }}
                        />
                      ) : (
                        <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 2 }}>
                          {item.customLabel || item.label}
                        </div>
                      )}

                      {/* Price -- editable when in edit mode */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                        {isEdit ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted }}>$</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={function(e) { updatePrice(item.key, e.target.value); }}
                              style={{ width: 90, border: "1.5px solid " + T.accent, borderRadius: T.radiusSm, padding: "6px 8px", fontFamily: T.sans, fontSize: 14, color: T.textPrimary, background: T.surface, outline: "none" }}
                            />
                            <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted }}>each</span>
                          </div>
                        ) : (
                          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(item.unitPrice)}</span>
                        )}

                        {/* Qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
                          <button onClick={function() { updateQty(item.key, -1); }} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid " + T.border, background: T.surface, cursor: "pointer", fontFamily: T.sans, fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.textPrimary, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                          <button onClick={function() { updateQty(item.key, +1); }} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid " + T.border, background: T.surface, cursor: "pointer", fontFamily: T.sans, fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>

                        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, marginLeft: 4 }}>= {fmt(item.unitPrice * item.qty)}</span>
                      </div>

                      {item.note && !isEdit && (
                        <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textMuted, marginTop: 4 }}>{item.note}</div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={function() { setEditKey(isEdit ? null : item.key); }} style={{ padding: "5px 10px", borderRadius: T.radiusSm, border: "1px solid " + T.border, background: isEdit ? T.accentLight : T.surface, color: isEdit ? T.accent : T.textMuted, fontFamily: T.sans, fontSize: 12, cursor: "pointer" }}>
                        {isEdit ? "Done" : "Edit"}
                      </button>
                      <button onClick={function() { removeItem(item.key); }} style={{ padding: "5px 10px", borderRadius: T.radiusSm, border: "1px solid " + T.border, background: T.surface, color: T.danger, fontFamily: T.sans, fontSize: 12, cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order total */}
          {orderItems.length > 0 && (
            <div style={{ background: "#1C2B22", borderRadius: T.radius, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Order Total</span>
                <span style={{ fontFamily: T.sans, fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>{fmt(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{opt.label}</span>
                <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 700, color: "#27D17F" }}>
                  {opt.months === 0 ? fmt(total) + " cash" : fmtD(payment.monthly) + "/mo"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <RepNote
        say="Build the order with the customer -- they can add anything. Adjust quantities for multi-system homes."
        phrase="You can add as many systems or upgrades as you want -- we build the order together."
        ask="Is there anything else you want to include while we are here?"
      />
    </Wrap>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  var s1 = useState({
    squareFeet: 3700, yearBuilt: 2003, monthlyBill: 180.13,
    electricBill: "", gasBill: "",
    systemCount: 2, hasPool: true,
    address: "", city: "", state: "TX", zip: "",
    customerFirstName: "", customerLastName: "",
    customerEmail: "", customerPhone: "",
    hcpCustomerId: null,
    painPoints: [],
  });
  var homeProfile = s1[0]; var setHomeProfile = s1[1];

  // Default score inputs -- start neutral
  var s2 = useState({
    comfort: "some", bills: "slightly", airflow: "weak", runtime: "long",
    upgrades: "none", dust: "some", unusedRooms: "none",
    hasThermostat: false, sensors: "none", hasMonitoring: false,
    hvacAge: "5to10", systemType: "mixed", thermostatType: "manual", floors: "1",
  });
  var scoreInputs = s2[0]; var setScoreInputs = s2[1];

  var s3 = useState("performance");
  var selectedPackageId = s3[0]; var setSelectedPackageId = s3[1];

  var s4 = useState({ ductCleaning: false, bootSealing: false, emporiaMonitor: false, thermostatPackage: false, filterUpgrade: false, poolPump: false, hvacReplacement: false });
  var addons = s4[0]; var setAddons = s4[1];

  // addonConfigs: per-addon configuration inputs used by the pricing engine
  var s4b = useState({
    panelCount: 1,
    thermostatType: "advanced", thermostatInstall: "standard", sensorCount: 3,
    filterComplexity: "standard",
    pumpType: "mid", pumpInstall: "standard", poolSize: "medium",
    hvacType: "fullSystem", hvacTier: "high", hvacCount: null,  // null = use systemCount
  });
  var addonConfigs = s4b[0]; var setAddonConfigs = s4b[1];

  var s5 = useState("cash");
  var selectedTermId = s5[0]; var setSelectedTermId = s5[1];

  var s6 = useState(0);
  var currentScreen = s6[0]; var setCurrentScreen = s6[1];

  // Free-form order items -- rep builds this with the customer
  var s7 = useState([]);
  var orderItems = s7[0]; var setOrderItems = s7[1];

  var sub   = orderItems.length > 0
    ? orderTotal(orderItems)
    : subtotalPrice(selectedPackageId, addons, homeProfile.systemCount || 1);
  var opt   = CONFIG.financeOptions.find(function(o) { return o.id === selectedTermId; }) || CONFIG.financeOptions[0];

  var screens = [
    { label: "Welcome",    c: <CoverScreen onNext={function() { setCurrentScreen(1); }} /> },
    { label: "Property",   c: <PropertyPrefillScreen homeProfile={homeProfile} setHomeProfile={setHomeProfile} /> },
    { label: "Diagnostic", c: <EfficiencyScoreScreen scoreInputs={scoreInputs} setScoreInputs={setScoreInputs} homeProfile={homeProfile} setHomeProfile={setHomeProfile} selectedPackageId={selectedPackageId} setSelectedPackageId={setSelectedPackageId} addons={addons} /> },
    { label: "Technology", c: <TechnologyIntroScreen /> },
    { label: "Example",    c: <RealExampleScreen /> },
    { label: "Your Home",  c: <HomeSnapshotScreen homeProfile={homeProfile} setHomeProfile={setHomeProfile} /> },
    { label: "Problem",    c: <ProblemScreen /> },
    { label: "Impact",     c: <ImpactScreen homeProfile={homeProfile} /> },
    { label: "Solution",   c: <SolutionScreen /> },
    { label: "Packages",   c: <PackagesScreen selectedPackageId={selectedPackageId} setSelectedPackageId={setSelectedPackageId} /> },
    { label: "Add-Ons",    c: <AddonsScreen selectedPackageId={selectedPackageId} addons={addons} setAddons={setAddons} homeProfile={homeProfile} addonConfigs={addonConfigs} setAddonConfigs={setAddonConfigs} scoreInputs={scoreInputs} /> },
    { label: "Order",      c: <OrderBuilderScreen orderItems={orderItems} setOrderItems={setOrderItems} selectedTermId={selectedTermId} /> },
    { label: "Financing",  c: <FinancingScreen subtotal={sub} selectedTermId={selectedTermId} setSelectedTermId={setSelectedTermId} homeProfile={homeProfile} scoreInputs={scoreInputs} selectedPackageId={selectedPackageId} addons={addons} /> },
    { label: "Proof",      c: <ProofScreen /> },
    { label: "Summary",    c: <CloseScreen selectedPackageId={selectedPackageId} addons={addons} homeProfile={homeProfile} subtotal={sub} selectedTermId={selectedTermId} addonConfigs={addonConfigs} orderItems={orderItems} scoreInputs={scoreInputs} /> },
  ];

  var showFooter = currentScreen !== 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: T.bg, fontFamily: T.sans, WebkitFontSmoothing: "antialiased", color: T.textPrimary }}>
      <Header currentScreen={currentScreen} totalScreens={screens.length} />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {screens[currentScreen].c}
      </div>
      {showFooter && (
        <NavFooter
          current={currentScreen}
          total={screens.length}
          onPrev={function() { setCurrentScreen(function(s) { return Math.max(0, s - 1); }); }}
          onNext={function() { setCurrentScreen(function(s) { return Math.min(screens.length - 1, s + 1); }); }}
        />
      )}
    </div>
  );
}
