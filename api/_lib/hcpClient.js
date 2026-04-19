// Housecall Pro API client -- shared between serverless functions.
// Reads credentials from environment variables set in the Vercel
// project settings.
//
// Required env vars:
//   HCP_API_KEY  -- Bearer token from your HCP developer account
//   HCP_API_BASE -- defaults to https://api.housecallpro.com if unset

const DEFAULT_BASE = "https://api.housecallpro.com";

function getConfig() {
  return {
    apiKey: process.env.HCP_API_KEY || "",
    base:   process.env.HCP_API_BASE || DEFAULT_BASE,
  };
}

function isConfigured() {
  return Boolean(process.env.HCP_API_KEY);
}

async function hcpRequest(path, options) {
  const cfg = getConfig();
  if (!cfg.apiKey) throw new Error("HCP_API_KEY is not set");

  const url = cfg.base + path;
  const opts = options || {};
  const headers = Object.assign({
    "Authorization": "Bearer " + cfg.apiKey,
    "Accept":        "application/json",
    "Content-Type":  "application/json",
  }, opts.headers || {});

  const resp = await fetch(url, Object.assign({}, opts, { headers: headers }));
  const text = await resp.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

  if (!resp.ok) {
    const err = new Error("HCP API " + resp.status + ": " + (data.message || data.error || resp.statusText));
    err.status = resp.status;
    err.body = data;
    throw err;
  }
  return data;
}

module.exports = {
  isConfigured: isConfigured,
  hcpRequest:   hcpRequest,

  // ---- Customer search by free-text query (typically address) ----
  // Returns the first matching customer or null.
  searchCustomerByAddress: async function(address) {
    if (!address || !address.trim()) return null;
    const q = encodeURIComponent(address.trim());
    // Note: Housecall Pro's search endpoint shape may differ between
    // API versions. Adjust the path / query param name if your account
    // uses a different revision (see INTEGRATIONS.md).
    const data = await hcpRequest("/customers?q=" + q + "&page_size=5");
    const list = data.customers || data.data || [];
    return list.length > 0 ? list[0] : null;
  },

  // ---- Create customer ----
  createCustomer: async function(customer) {
    return hcpRequest("/customers", {
      method: "POST",
      body: JSON.stringify({
        first_name:    customer.firstName,
        last_name:     customer.lastName,
        email:         customer.email || undefined,
        mobile_number: customer.phone || undefined,
        addresses:     customer.address ? [{
          street:  customer.address,
          city:    customer.city || "",
          state:   customer.state || "",
          zip:     customer.zip || "",
          country: "US",
          type:    "service",
        }] : undefined,
      }),
    });
  },

  // ---- Create estimate ----
  // line_items shape: { name, unit_price (cents), quantity, description }
  createEstimate: async function(payload) {
    return hcpRequest("/estimates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
