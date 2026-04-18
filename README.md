# EG Comfort App

A comprehensive React application for Energy Guys Comfort that helps homeowners assess their energy efficiency and find suitable HVAC solutions.

## Features

- **Home Profile Assessment**: Collect property details and energy bill information
- **Efficiency Scoring**: Calculate home efficiency score based on comfort, airflow, and performance inputs
- **Era-Based Weighting**: Intelligent scoring adjustments based on home age and construction era
- **Package Selection**: Browse and select from three service tiers with customizable add-ons
- **Savings Projection**: Calculate potential energy savings and ROI with different financing options
- **Financing Calculator**: View costs with multiple financing terms and monthly payments

## Project Structure

```
src/
├── components/
│   ├── Header.js           # App header with branding
│   ├── Footer.js           # App footer with disclaimers
│   ├── HomeProfileForm.js  # Home and comfort questionnaire
│   ├── ScoringDashboard.js # Efficiency score display
│   ├── PackageSelector.js  # Package and add-ons selection
│   └── SavingsProjection.js # Final quote and financing
├── config/
│   └── config.js           # App configuration (brands, packages, addons, financing)
├── utils/
│   ├── homeEra.js          # Home age classification
│   ├── scoring.js          # Efficiency scoring algorithms
│   └── savings.js          # Savings and ROI calculations
├── App.js                  # Main app component
└── index.js                # React app entry point
```

## Setup & Installation

1. **Install dependencies**:
   ```bash
   cd /Users/macbook/Documents/eg-comfort-app
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm run build
   ```

## How It Works

### 1. Home Profile Form
Users enter:
- Property details (address, square footage, year built, AC systems)
- Energy bills (electric and/or gas)
- Comfort and performance symptoms
- Current system capabilities

### 2. Efficiency Scoring
The app calculates a 0-100 score based on:
- Comfort issues (hot/cold spots)
- Energy bills vs. neighbors
- Airflow quality
- System runtime
- Existing upgrades
- Home era (with era-specific weighting)

### 3. Score Display
Shows:
- Overall efficiency score with color-coded band
- Top issues identified
- Priority improvements
- Estimated annual/monthly waste

### 4. Package Selection
Choose from:
- **Core Seal** ($3,000): Basic duct sealing and optimization
- **Performance** ($4,198): Core Seal + duct cleaning + boot sealing
- **Ultimate** ($6,995): Performance + smart thermostats + sensors + monitoring

Add optional upgrades like duct cleaning, boot sealing, smart thermostats, energy monitors, and more.

### 5. Savings Projection
Shows:
- Annual and monthly savings estimates
- Projected score improvement
- Payback period analysis
- Multiple financing options (cash, 3-60 months)
- Total cost with financing

## Configuration

All app settings are centralized in `src/config/config.js`:

- **Brand Info**: Company name, tagline, contact info
- **Packages**: Three service tiers with included benefits
- **Add-ons**: Optional upgrades with pricing
- **Financing**: 8 financing options with APR rates
- **Videos**: YouTube embeds for education
- **Disclaimers**: Legal text and disclosures

## Key Components

### Configuration Engine
- Dynamic pricing based on home size, system count, and complexity
- Era-specific weighting for home efficiency assessment

### Scoring Engine
- Multi-factor efficiency calculation
- Era-based penalties and adjustments
- Diminishing returns calculation for upgrades

### Savings Engine
- Annual/monthly savings projections
- ROI and payback period calculations
- Score improvement projections
- Financing cost calculations

## Technologies

- **React 18.2** - UI library
- **React DOM** - Browser rendering
- **React Scripts** - Build and development tools
- **CSS3** - Styling with responsive design

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Responsive breakpoint at 768px

## Customization

### Update Pricing
Edit `src/config/config.js` - modify `CONFIG.packages` and `CONFIG.addons`

### Adjust Scoring
Edit `src/utils/scoring.js` to change how scores are calculated

### Change Branding
Update `CONFIG.brand` in `src/config/config.js`

### Add Financing Options
Add entries to `CONFIG.financeOptions` in `src/config/config.js`

## Future Enhancements

- Integration with Housecall Pro API for real property data
- Actual bill image uploads and analysis
- Email quote generation
- Database integration for saving quotes
- Admin dashboard for configuration
- Multi-language support
- Advanced analytics and reporting
- 3D home visualization
- Real-time rate integration

## License

© 2026 Energy Guys Comfort. All rights reserved.

## Support

For questions or issues, contact the development team.
