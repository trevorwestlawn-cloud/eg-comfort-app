# EG Comfort App Development Log

## Project Overview
A complete React-based energy efficiency assessment and sales tool for Energy Guys Comfort HVAC services.

## Architecture

### Core Modules

#### 1. Configuration (`src/config/config.js`)
- Brand identity and messaging
- Service packages (Core Seal, Performance, Ultimate)
- Optional add-ons pricing
- Financing options (cash through 60-month terms)
- Disclaimers and legal text

#### 2. Utilities

**homeEra.js** - Home age classification
- Categorizes homes into 6 eras (Pre-1980 through 2022-present)
- Provides context-specific messaging
- Calculates era-based scoring penalties
- Applies era-weighted recommendations

**scoring.js** - Efficiency calculations
- 100-point efficiency score
- Multi-factor assessment (comfort, bills, airflow, runtime, etc.)
- Efficiency bands (High/Moderate/Low/Major Loss)
- Waste estimation (annual/monthly)
- Issue and recommendation identification

**savings.js** - ROI and financial projections
- Upgrade impact catalog with savings ranges
- Diminishing returns calculations for overlapping upgrades
- Annual/monthly savings projections
- Score improvement projections
- Payback period calculations
- Finance payment calculations with APR

### Components

**Header.js** - Navigation and branding
**Footer.js** - Disclaimers and footer content
**HomeProfileForm.js** - Multi-section questionnaire
**ScoringDashboard.js** - Results visualization
**PackageSelector.js** - Service package selection
**SavingsProjection.js** - Final quote and financing

## Data Flow

1. User completes Home Profile Form
   - Property details (sqft, year built, systems)
   - Energy bills
   - Comfort/performance symptoms
   - Current systems

2. System calculates Efficiency Score
   - Base score of 100
   - Deductions based on each input
   - Era-based adjustments
   - Displays in ScoringDashboard

3. User browses and selects Package
   - Three tiers available
   - Customizable add-ons
   - Real-time pricing

4. System calculates Savings Projection
   - Based on selected package/addons
   - Shows annual/monthly savings range
   - Displays ROI and payback period
   - Multiple financing scenarios

5. User reviews Quote
   - Package summary
   - Financing options
   - Total cost comparison
   - CTA to request consultation

## Scoring Algorithm

Base: 100 points

Deductions:
- Comfort issues: -10 to -20
- High bills: -10 to -20
- Poor airflow: -10 to -20
- Long runtime: -10 to -20
- No upgrades: -15
- Dust/air quality: -5 to -10
- Unused rooms: -5 to -10
- No thermostat: -8
- Limited sensors: -5 to -10
- No monitoring: -8
- Old HVAC: -5 to -10
- Home era penalty: 0-8 points

Result: 0-100 score mapped to efficiency band

## Pricing Engine

### Dynamic Adjustments
- **Duct Cleaning**: Size multipliers (small=1.0x, medium=1.15x, large=1.3x)
- **Boot Sealing**: Per-system pricing
- **Smart Thermostat**: Type + install complexity + sensors
- **Filter Upgrade**: Per-system with complexity adjustments
- **Pool Pump**: Type + install + pool size multipliers

### Base Prices
- Core Seal: $3,000
- Performance: $4,198
- Ultimate: $6,995
- Add-ons: $250-$3,000 range

## Savings Calculations

### Annual Waste Estimate
- HVAC share of total bill: 35-55%
- Efficiency band waste ratio: 5-50%
- Minimum floor: $1.80/sqft/year

### Savings Projection
- Per-upgrade savings: 1-20% of HVAC spend
- Diminishing returns: 2+ upgrades in same category (40-65% of previous)
- Cap: Cannot save more than estimated waste

### ROI
- Payback period: Investment ÷ Annual Savings
- Score improvement: +0-15 points per upgrade
- Range: All figures shown as ranges, never single precise numbers

## Styling

- Modern, clean design with professional color scheme
- Blue primary (#0066cc), green accent (#27D17F)
- Light backgrounds (#f5f7fa), white cards
- Mobile-responsive (768px breakpoint)
- Accessibility-focused with proper contrast

## State Management

React hooks with centralized App.js state:
- Step tracking (profile → scoring → packages → savings)
- Home profile data
- Score inputs
- Package/addon selections
- Financing option
- Navigation between steps

## Extensibility

Ready to integrate with:
- Backend APIs for quote saving
- Email/PDF generation
- CRM systems
- Payment processing
- Property data services
- Energy utility APIs
- Real-time rate integration

## Testing Scenarios

1. **New homeowner** - No upgrades, average comfort
2. **Performance seeker** - Recent construction, optimization focus
3. **Problem solver** - Multiple comfort issues, older home
4. **Budget conscious** - Base package only, cash payment
5. **Financing interested** - Ultimate package, extended terms

## Performance Considerations

- Lightweight component structure
- Efficient re-renders with proper state management
- No external API calls (ready for future integration)
- Static configuration loading
- Pure functions for calculations
- Minimal dependencies

---

**Built with:** React 18.2
**Status:** Fully functional MVP
**Date:** April 2026
