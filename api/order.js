// POST /api/order
//
// Creates an estimate in Housecall Pro from the order built in the app.
// If the customer doesn't already exist in HCP, creates them first.
//
// Request body shape:
//   {
//     customer: {
//       customerId,                  // optional -- HCP id if known
//       firstName, lastName,
//       email, phone,
//       address, city, state, zip,
//     },
//     lineItems: [
//       { label, unitPrice, qty, note }
//     ],
//     notes: "optional free-text summary, score, savings, etc.",
//     totals: {
//       subtotal, financeCharge, totalPaid, monthly, term
//     },
//   }
//
// Response:
//   { success: true, estimateId, customerId, estimateUrl }
//
// When HCP_API_KEY is not set, returns success: false with a clear
// "not configured" message so the app can show a helpful error.

const hcp = require("./_lib/hcpClient");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!hcp.isConfigured()) {
    res.status(503).json({
      success: false,
      error:   "Housecall Pro is not configured on this deployment.",
      hint:    "Set HCP_API_KEY in Vercel project settings to enable order push.",
    });
    return;
  }

  const body = req.body || {};
  const customer  = body.customer  || {};
  const lineItems = body.lineItems || [];
  const notes     = body.notes     || "";

  if (!lineItems.length) {
    res.status(400).json({ error: "lineItems is required and must be non-empty" });
    return;
  }
  if (!customer.firstName && !customer.lastName) {
    res.status(400).json({ error: "customer.firstName or customer.lastName is required" });
    return;
  }

  try {
    // 1. Resolve customer -- find existing or create new
    let customerId = customer.customerId;

    if (!customerId) {
      // Try to find by address first to avoid duplicates
      let existing = null;
      if (customer.address) {
        try { existing = await hcp.searchCustomerByAddress(customer.address); }
        catch (e) { /* swallow -- we'll create below if not found */ }
      }
      if (existing && existing.id) {
        customerId = existing.id;
      } else {
        const created = await hcp.createCustomer(customer);
        customerId = created.id || created.customer_id;
      }
    }

    if (!customerId) {
      res.status(500).json({ error: "Could not resolve a Housecall Pro customer id" });
      return;
    }

    // 2. Build estimate payload. HCP expects unit_price in cents.
    const estimatePayload = {
      customer_id: customerId,
      line_items:  lineItems.map(function(it) {
        return {
          name:        it.label || "Line item",
          unit_price:  Math.round((it.unitPrice || 0) * 100), // dollars -> cents
          quantity:    it.qty || 1,
          description: it.note || "",
        };
      }),
      notes: notes,
    };

    const estimate = await hcp.createEstimate(estimatePayload);

    res.status(200).json({
      success:      true,
      estimateId:   estimate.id || estimate.estimate_id || null,
      customerId:   customerId,
      estimateUrl:  estimate.url || estimate.web_url || null,
    });
  } catch (e) {
    res.status(e.status || 500).json({
      success: false,
      error:   "Failed to create Housecall Pro estimate",
      message: e.message,
      detail:  e.body || null,
    });
  }
};
