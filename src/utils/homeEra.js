// Home era classification and weighting
export function getHomeEra(yearBuilt) {
  const y = parseInt(yearBuilt) || 0;
  if (y === 0) return { era: "unknown", label: "Unknown era", eraCode: "X" };
  if (y < 1980) return { era: "A", label: "Pre-1980", eraCode: "A" };
  if (y < 1990) return { era: "B", label: "1980s", eraCode: "B" };
  if (y < 2006) return { era: "C", label: "1990-2005", eraCode: "C" };
  if (y < 2016) return { era: "D", label: "2006-2015", eraCode: "D" };
  if (y < 2022) return { era: "E", label: "2016-2021", eraCode: "E" };
  return { era: "F", label: "2022-present", eraCode: "F" };
}

export function getEraScorePenalty(era, scoreInputs) {
  let penalty = 0;
  const si = scoreInputs;

  if (era === "A") penalty += 8;
  if (era === "B") penalty += 6;
  if (era === "C") penalty += 4;
  if (era === "D") penalty += 2;

  if (si.upgrades === "recent") penalty = Math.max(0, penalty - 4);
  return penalty;
}

export function getEraContextLine(era, yearBuilt, scoreInputs) {
  const si = scoreInputs;
  const hasComfort = si.comfort !== "fine";
  const hasAirflow = si.airflow !== "fine";
  const hasBills = si.bills !== "normal";

  switch (era) {
    case "A":
      return "Homes from this era commonly have weak air sealing, limited attic insulation, and duct systems that were built before modern leakage standards. That likely creates meaningful opportunity here.";
    case "B":
      return "Homes built in the 1980s often show moderate-to-high duct leakage and insulation levels below today's standards. The improvements below are weighted based on both the age of the home and the symptoms reported.";
    case "C":
      if (hasAirflow || hasComfort) {
        return "Homes from this era had better basics than older homes, but duct leakage and poor airflow balance are still very common. The comfort symptoms you have described make duct sealing and balancing strong candidates here.";
      }
      return "Homes built between 1990 and 2005 typically have a reasonable foundation, but duct leakage, limited control, and moderate insulation gaps still appear regularly.";
    case "D":
      if (hasComfort || hasAirflow) {
        return "This home was built in a better-performing era, so the issues you have described are more likely tied to duct routing, airflow balance, or system control than to major shell deficiencies.";
      }
      return "Homes from this era generally have a reasonable energy baseline. The focus here shifts toward optimization, duct verification, and control improvements.";
    case "E":
      if (hasComfort || hasAirflow) {
        return "A home built between 2016 and 2021 should generally perform well. When comfort issues appear, they more often point to balancing, duct routing, or control gaps rather than basic insulation deficiency.";
      }
      return "This is a newer-code-era home. Efficiency opportunities here are typically around optimization, control, and system tuning.";
    case "F":
      return "As one of the newest-construction homes, efficiency complaints here are most likely tied to commissioning, airflow balance, room sensors, or system setup.";
    default:
      return "Enter the year the home was built to apply age-based weighting to the recommendations below.";
  }
}

export function getEraWeightAdjustments(era, scoreInputs) {
  const si = scoreInputs;
  const hasComfort = si.comfort !== "fine";
  const hasAirflow = si.airflow !== "fine";
  const alreadySealed = si.alreadySealed === true;

  const adj = {
    ductSealing: 0,
    smartThermostat: 0,
    roomSensors: 0,
    energyMonitor: 0,
    filterUpgrade: 0,
    atticInsulation: 0,
  };

  switch (era) {
    case "A":
      adj.ductSealing += alreadySealed ? -1 : 3;
      adj.smartThermostat += 2;
      adj.roomSensors += 1;
      adj.filterUpgrade += 1;
      adj.atticInsulation += 3;
      break;
    case "B":
      adj.ductSealing += alreadySealed ? -1 : 2;
      adj.smartThermostat += 2;
      adj.roomSensors += 1;
      adj.atticInsulation += 2;
      break;
    case "C":
      adj.ductSealing += alreadySealed ? -1 : 2;
      adj.smartThermostat += 1;
      adj.roomSensors += hasComfort || hasAirflow ? 2 : 1;
      adj.atticInsulation += 1;
      break;
    case "D":
      adj.ductSealing += alreadySealed ? -2 : hasAirflow ? 1 : 0;
      adj.smartThermostat += 1;
      adj.roomSensors += hasComfort ? 2 : 1;
      adj.energyMonitor += 1;
      break;
    case "E":
      adj.ductSealing += alreadySealed ? -2 : hasAirflow ? 0 : -1;
      adj.smartThermostat += si.thermostatType === "smart" ? -1 : 1;
      adj.roomSensors += hasComfort ? 3 : 1;
      adj.energyMonitor += 2;
      break;
    case "F":
      adj.ductSealing += alreadySealed ? -3 : hasAirflow ? 0 : -2;
      adj.roomSensors += hasComfort ? 3 : 0;
      adj.energyMonitor += 2;
      adj.smartThermostat += si.thermostatType === "smart" ? -2 : 0;
      break;
    default:
      break;
  }
  return adj;
}
