# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fact Electricity** is a React + Vite single-page application for simulating electricity consumption and billing using Madagascar JIRAMA tariffs. It features three main tools:
- **Calculator (CalcPage)**: Estimate monthly kWh and cost by setting daily usage hours per device
- **Inverse Calculator (InversePage)**: Input a budget to get suggested usage hours per device
- **Dashboard (DashboardPage)**: Monthly history tracking with Chart.js visualization

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Architecture

### Tech Stack
- **React 18** (functional components, hooks)
- **Vite 5** (build tool, dev server)
- **Tailwind CSS 4** (utility-first styling)
- **Chart.js + react-chartjs-2** (dashboard charts)
- **jsPDF + jspdf-autotable** (PDF export)
- **Lucide React** (icons)

### Project Structure
```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Router: home view ↔ app view with 3 tabs
├── styles/global.css        # CSS custom properties (design tokens), reset, animations
├── utils/
│   ├── electricity.js       # Tariff constants, APPS catalogue, calcBill, calcInverse, helpers
│   └── exportPDF.js         # PDF generation with jsPDF
├── hooks/
│   ├── useAppState.js       # Global state (times[], customs[], monthlyData[])
│   ├── useChart.js          # Chart.js instance management
│   └── useParticles.js      # Canvas particle animation for homepage
├── components/
│   ├── Navbar.jsx           # Tab bar + logo + home button
│   ├── CircularGauge.jsx    # Animated canvas gauge (usage %)
│   ├── DeviceCard.jsx       # Clickable device card
│   ├── FloatPanel.jsx       # Inline panel for setting hours (minutes/hours chips)
│   ├── BillModal.jsx        # Result modal with PDF export
│   ├── HamburgerMenu.jsx    # Mobile navigation
│   └── Login.jsx            # Login screen
├── pages/
│   ├── HomePage.jsx         # Landing with particle background
│   ├── CalcPage.jsx         # Main simulator (device list + float panel + gauge)
│   ├── InversePage.jsx      # Budget → suggested hours (priority-weighted)
│   └── DashboardPage.jsx    # Monthly history + Chart.js line/bar charts
└── path/route.md            # Architecture documentation
```

### State Management
- **useAppState.js** is the single source of truth:
  - `times[]` — hours/day for each predefined device (APPS)
  - `customs[]` — user-added devices {name, watts, icon, h}
  - `monthlyData[]` — history entries {month, year, cost, kwh, _auto?}
- All mutations are via callbacks (`setDeviceTime`, `setCustomTime`, `addCustomDevice`, `resetAll`, `applySuggestions`, `addMonthEntry`, `removeMonthEntry`, `autoSaveCalc`)

### Electricity Calculation (utils/electricity.js)
- **Tiered JIRAMA tariffs**:
  - Tranche 1: 0–130 kWh @ 350 Ar/kWh
  - Tranche 2: 131–300 kWh @ 580 Ar/kWh
  - Tranche 3: >300 kWh @ 760 Ar/kWh
- **calcBill(kwh)** — returns `{cost, t, label, rate, color}`
- **calcInverse(budgetAr)** — priority-weighted allocation with redistribution to match budget exactly
- **totalKwh(times, customs)** — aggregates monthly kWh from all devices

### Key Data Constants
- `APPS` — 8 predefined devices with watts, icon, priority (for inverse calc)
- `DEVICE_TYPICAL_HOURS` — typical daily usage per device (caps inverse allocation)
- `CHIPS_M` / `CHIPS_H` — quick-set time chips (minutes/hours) for FloatPanel

### Styling Approach
- **CSS custom properties** in `global.css` for all colors, spacing, radii, fonts
- **CSS Modules** per component (e.g., `CalcPage.module.css`, `Navbar.module.css`)
- **Design tokens**: `--y` (yellow #F5C518), `--bg` (#050508), `--card` (#0f0f1a), tier colors `--t1`/`--t2`/`--t3`

### Routing / View Logic
- `App.jsx` manages two-level navigation:
  1. `view`: `'home'` | `'app'` (HomePage vs tabbed app)
  2. `tab`: `'calc'` | `'inverse'` | `'dash'` (shown when `view === 'app'`)
- No React Router — simple conditional rendering

### PDF Export
- `exportPDF(times, customs, monthlyData)` in `utils/exportPDF.js`
- Generates A4 PDF with: summary box, device table, tranche breakdown, monthly history
- Uses dynamic `import('jspdf')` for code-splitting

## Development Notes

- **No tests** currently configured
- **No linting/formatting** configured (no ESLint, Prettier)
- **No TypeScript** — plain JavaScript/JSX
- **Fonts**: Syne (display) + JetBrains Mono (monospace) — loaded via CSS `@import` in global.css
- **Entry HTML**: Vite uses `index.html` at project root (not in src/)