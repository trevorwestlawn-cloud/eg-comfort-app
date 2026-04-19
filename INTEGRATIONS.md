# Housecall Pro Integration Setup

The app ships with two serverless functions that talk to Housecall Pro
(HCP):

- `GET  /api/property?address=...` — searches HCP for an existing
  customer at the address and returns property attributes (sqft, year
  built, system count, has pool) from their HCP custom fields. Used by
  the **Import Data** button on the first screen.
- `POST /api/order` — creates an HCP estimate from the order built in
  the app (selected package + add-ons, or order builder line items).
  Used by the **Move Forward** button on the summary screen.

When HCP credentials are not set, the property lookup falls back to
deterministic mock data and the order push returns a clear "not
configured" error. Everything else in the app continues to work.

---

## What you need from Housecall Pro

You need an **API key** (Bearer token) from your HCP developer account.

1. Sign in to your HCP account.
2. Go to https://app.housecallpro.com/settings/api or contact HCP
   support to enable API access for your account (some plans require
   the Marketplace developer program — see
   https://docs.housecallpro.com/).
3. Generate an API token with at least these scopes:
   - `customers.read`
   - `customers.write`
   - `estimates.write`
4. Copy the token. You'll paste it into Vercel in a moment.

### Property attribute custom fields

HCP does not natively store square footage, year built, or pool
presence. To support the Import Data button, you'll need to add custom
fields to your HCP customer profiles.

In HCP, create these customer-level custom fields (under
Settings → Custom Fields):

| Field name in HCP | Type   | Default field key |
| ---               | ---    | ---               |
| Square Feet       | Number | `square_feet`         |
| Year Built        | Number | `year_built`          |
| HVAC System Count | Number | `hvac_system_count`   |
| Has Pool          | Yes/No | `has_pool`            |

If you use different field keys, set the matching env vars:

```
HCP_FIELD_SQFT=your_sqft_field_key
HCP_FIELD_YEAR_BUILT=your_year_built_field_key
HCP_FIELD_SYSTEMS=your_systems_field_key
HCP_FIELD_HAS_POOL=your_pool_field_key
```

For brand-new customers not yet in HCP, the property lookup will
return 404 and the rep enters the data manually -- which then becomes
part of the estimate they push back into HCP.

---

## Configure Vercel

1. Open your project: https://vercel.com/dashboard → `eg-comfort-app`
2. Settings → Environment Variables
3. Add the variables from `.env.example` -- minimum:
   - `HCP_API_KEY` = your HCP API token
   - (Leave `HCP_API_BASE` and the field keys at their defaults unless
     you have a reason to change them)
4. Save. Set the environment to **Production**, **Preview**, and
   **Development** so the integration works in all three.
5. Trigger a redeploy:
   ```
   cd ~/Documents/eg-comfort-app
   vercel --prod
   ```

That's it. The Import Data button and Move Forward button will now
talk to HCP.

---

## Local development

```
cp .env.example .env
# fill in HCP_API_KEY in .env
npm install -g vercel       # if not already installed
vercel dev                  # runs the React app + serverless functions together
```

`npm start` (Create React App's dev server) does **not** serve the
`/api/*` routes -- those only work under `vercel dev` or a deployed
Vercel project.

---

## Future: separate property data source

If you want the Import Data button to also work for customers who are
not yet in HCP, the cleanest add-on is a property data API like:

- **ATTOM Data API** — comprehensive US property records ($)
- **EstatedAPI / Estated** — property attributes by address ($)
- **Zillow** — limited public API; mostly for Premier Agents

To wire one of these in, add a fallback path inside `api/property.js`:
when the HCP search returns no customer, query the property API
instead before returning 404.
