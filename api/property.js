// GET /api/property?address=...
//
// Searches Housecall Pro for an existing customer at the given address
// and returns property attributes (sqft, year built, system count, has
// pool) from their HCP custom fields when present.
//
// When HCP_API_KEY is not set, returns deterministic mock data so local
// development and previews keep working.

const hcp = require("./_lib/hcpClient");

const MOCK = {
  squareFeet:  3700,
  yearBuilt:   2003,
  systemCount: 2,
  hasPool:     true,
  source:      "mock (HCP_API_KEY not set)",
  confidence:  "low",
};

// Maps a HCP customer record to the homeProfile shape the app expects.
// Custom field names are configurable via env vars so you can match
// whatever convention you use in HCP.
function mapCustomerToProperty(customer) {
  const fields = customer.custom_fields || {};
  const get = (key) => fields[key] != null ? fields[key] : null;

  const sqftKey  = process.env.HCP_FIELD_SQFT       || "square_feet";
  const yearKey  = process.env.HCP_FIELD_YEAR_BUILT || "year_built";
  const sysKey   = process.env.HCP_FIELD_SYSTEMS    || "hvac_system_count";
  const poolKey  = process.env.HCP_FIELD_HAS_POOL   || "has_pool";

  const sqft = get(sqftKey);
  const year = get(yearKey);
  const sys  = get(sysKey);
  const pool = get(poolKey);

  return {
    squareFeet:   sqft ? parseInt(sqft, 10) : null,
    yearBuilt:    year ? parseInt(year, 10) : null,
    systemCount:  sys  ? parseInt(sys, 10)  : 1,
    hasPool:      pool === true || pool === "true" || pool === "yes",
    customerId:   customer.id,
    customerName: [customer.first_name, customer.last_name].filter(Boolean).join(" "),
    email:        customer.email || "",
    phone:        customer.mobile_number || customer.home_number || "",
    source:       "housecall_pro",
    confidence:   sqft && year ? "high" : "medium",
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const address = (req.query && req.query.address) || "";
  if (!address.trim()) {
    res.status(400).json({ error: "Missing address query parameter" });
    return;
  }

  if (!hcp.isConfigured()) {
    res.status(200).json(Object.assign({}, MOCK));
    return;
  }

  try {
    const customer = await hcp.searchCustomerByAddress(address);
    if (!customer) {
      res.status(404).json({
        error:      "No customer found at that address in Housecall Pro",
        source:     "housecall_pro",
        confidence: "none",
      });
      return;
    }
    res.status(200).json(mapCustomerToProperty(customer));
  } catch (e) {
    res.status(e.status || 500).json({
      error:   "Housecall Pro lookup failed",
      message: e.message,
      detail:  e.body || null,
    });
  }
};
