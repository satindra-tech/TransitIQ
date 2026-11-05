# TransitIQ – AI-Powered Smart Public Transport Operations System

> **CUMTA × Easwari Startup Peravai Mobility Hackathon 2026**  
> **Problem Statement 4 – Smart Public Transport Operations**

TransitIQ is an end-to-end AI-powered public transport operations management platform designed to predict transportation bottlenecks and overcrowding before they occur on Chennai Metropolitan Transport Corporation (MTC) transit corridors.

---

## 1. Project Overview & Chennai Problem Context
In Chennai, public transit infrastructure faces critical operational challenges:
- **Severe Bus Overcrowding:** Overloaded buses during morning (08:00 - 10:00) and evening (17:00 - 20:00) peak rush hours.
- **Demand–Supply Imbalances:** Bus routes operating at 130%–160% capacity while adjacent routes remain under-utilized.
- **Corridor Bottlenecks & Dwell Delays:** Heavy dwell times at critical stages along OMR IT Expressway, GST Road, and Anna Salai.
- **Static Timetables:** Traditional fixed dispatch intervals fail to adapt to live ridership swings.

TransitIQ ingests real Chennai transit datasets, forecasts passenger demand using Machine Learning (Random Forest Regression), calculates real-time Load Ratios, detects ridership surges and delays, and recommends actionable operational interventions.

---

## 2. Integrated Dataset Ingestion
TransitIQ directly ingests and processes official hackathon datasets provided in `Theme 4`:
1. **Electronic Ticketing Machine (ETM) Logs (`Ticket-Data-*.csv.bz2`):**
   - 600,000+ benchmark tickets processed across weekday peak, mid-week, Saturday, and Sunday schedules.
   - Extracts route numbers, departure times, ticket amounts, passenger counts, fleet IDs, trip numbers, and depots.
2. **Chennai Bus Stops Registry (`Tambaram, Avadi, GCC Bus Stops List 1.xlsx`):**
   - 2,717 verified bus stops with exact GPS Latitude and Longitude coordinates across Greater Chennai Corporation (GCC), Tambaram, and Avadi zones.
3. **MTC Route Alignments (`Public Transport/MTC/routes_merged.shp`):**
   - 680 route polylines mapped to Leaflet WGS84 coordinates.

---

## 3. Main System Modules

### Module 1: Transit Data Management
- Ingests, normalizes, and aggregates raw ticket logs into hourly operational records:
  - Route ID, corridor, origin, destination, depot, service type (Ordinary / Deluxe / AC).
  - Active scheduled trips, passenger demand, revenue, average distance (km).
  - Corridors tracked: **OMR IT Expressway**, **GST Road Corridor**, **Anna Salai Arterial**, **Poonamallee High Road**, **Inner Ring Road (100ft)**, and **North Chennai Coastal**.

### Module 2: Passenger Demand Prediction (Core AI)
- **Machine Learning Algorithm:** `Random Forest Regressor` (Ensemble of 120 Decision Trees).
- **Features Analyzed:** Route ID, Hour of Day (0–23), Day of Week (0–6), Weekend Flag, Peak Hour Flag, Corridor Traffic Congestion Index, Scheduled Bus Count, Service Type, and Historical Rolling Demand Baseline.
- **Model Performance:**
  - $R^2$ Score: **74.25%**
  - Mean Absolute Error (MAE): **19.48 passengers**
  - Root Mean Squared Error (RMSE): **28.49 passengers**

### Module 3: Overcrowding Detection
- Calculates **Load Ratio**:
  $$\text{Load Ratio} = \frac{\text{Predicted Passenger Demand}}{\text{Total Scheduled Capacity}}$$
- Classifies routes into 4 operational risk levels:
  - **Normal** ($\text{Load} < 75\%$): Green
  - **Moderate** ($75\% \le \text{Load} < 100\%$): Yellow
  - **Overcrowded** ($100\% \le \text{Load} < 130\%$): Orange
  - **Severely Overcrowded** ($\text{Load} \ge 130\%$): Red / High Alert
- Identifies exact curbside unboarded passenger queues left behind at bus stops.

### Module 4: Delay and Abnormal Ridership Detection
- Detects ridership surges ($> +35\%$ above historical baseline) and abnormal drops ($< -35\%$).
- Models corridor transit delays factoring in traffic bottlenecks and passenger dwell times.
- Evaluates real-time **Schedule Adherence %**.

### Module 5: Smart Operational Recommendation Engine
- Rule-based AI decision support system generating concrete directives for depot dispatchers:
  - **Severe Overcrowding:** Immediate Standby Bus Injection from nearest depot (e.g. Vadapalani, Tambaram, Anna Nagar).
  - **Overcrowded:** Headway compression (e.g. reduce departure interval from 15 min to 7 min).
  - **Corridor Bottleneck:** Trigger Short-Loop Cut-Trip (CT) shuttles between high-density intermediate hubs.
  - **Under-Utilized Routes:** Dynamic fleet reallocation to shift buses from low-demand to high-demand sectors.

### Module 6: Interactive Operations Dashboard
- Built with **React 18**, **Tailwind CSS**, and **Recharts**.
- Real-time KPIs, network risk distribution donut chart, corridor pressure bars, and top critical routes.
- **Leaflet Transportation Route Visualization:** Interactive map of Chennai with official MTC route polylines color-coded by real-time overcrowding risk, plus 250+ bus stop pins with tooltips.

### Module 7: What-If Simulation Sandbox (Digital Twin)
- Allows depot controllers to adjust:
  - **Additional Buses Deployed:** $-2$ to $+8$ buses.
  - **Bus Fleet Type:** Standard MTC (60 cap), Deluxe (50 cap), Zero-Emission Electric (70 cap), Mini-Bus Feeder (35 cap).
  - **Demand Shock:** $-40\%$ (Holiday) to $+80\%$ (Rain/Surge).
- Generates live split-screen **Before vs After** comparison, wait time savings, and day-long 24-hour comparative curves.

### Module 8: Reports and Alerts Module
- Real-time incident triage feed with acknowledgment buttons.
- One-click **CSV Report Export** containing route-by-route audit records.
- Formatted **Printable / PDF Executive Report**.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet |
| **Backend & APIs** | Python 3.11, FastAPI, Uvicorn, Starlette, Pydantic |
| **Data Processing & AI** | Pandas, NumPy, Scikit-learn (Random Forest Regressor), Joblib, PyShp |
| **Spatial Data** | WGS84 GeoJSON, Shapefiles (`routes_merged.shp`), Excel Bus Stops |

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.11 installed (`C:\Users\pc\Python311\python.exe`)
- Node.js LTS installed

### Running TransitIQ
Double-click `start_dev.bat` or run in PowerShell:
```powershell
python run_system.py
```

Open your browser at:
- **Operations Dashboard:** `http://127.0.0.1:8000`
- **FastAPI Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`

---

## 6. Project Architecture
```
startup peravai/
├── backend/
│   ├── data_pipeline.py          # Data ingestion from Theme 4 & GeoJSON generator
│   ├── demand_model.py           # Random Forest demand prediction model
│   ├── operations_engine.py      # Overcrowding classifier, delay & recommendation engine
│   ├── simulator.py              # What-If simulation engine
│   ├── main.py                   # FastAPI REST API & static file server
│   ├── data/                     # Clean aggregated data & route geometry
│   └── models/                   # Serialized Random Forest model & metadata
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # OCC brand, time slider, day selector, alerts
│   │   │   ├── OverviewTab.jsx   # Executive dashboard KPIs, charts, corridor bars
│   │   │   ├── PredictionTab.jsx # 24h demand curves, ML metrics, feature importance
│   │   │   ├── MapTab.jsx        # Leaflet map with shapefiles & bus stops
│   │   │   ├── OvercrowdingTab.jsx # Overcrowding & delay table with search/filters
│   │   │   ├── RecommendationsTab.jsx # Smart operational recommendations cards
│   │   │   ├── SimulationTab.jsx # Interactive What-If simulation sandbox
│   │   │   └── ReportsTab.jsx    # Alert triage feed, CSV/PDF export
│   │   ├── App.jsx               # Main SPA shell with tab routing
│   │   └── main.jsx              # React DOM entry point
│   ├── dist/                     # Optimized production bundle
│   └── package.json
├── run_system.py                 # Single-command launcher
├── start_dev.bat                 # Windows double-click runner
└── README.md
```
