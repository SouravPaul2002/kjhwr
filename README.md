# UK Wind Forecast Analytics Dashboard

A full-stack analytics dashboard for evaluating UK wind generation forecasts against actual generation. Built to support day-ahead electricity procurement decisions by measuring forecast accuracy using historical data from the Elexon BMRS API.

🔗 **Live Dashboard**: [https://frontend-inky-theta-75.vercel.app](https://frontend-inky-theta-75.vercel.app)  
🚀 **Live Backend API**: [https://kjhwr-backend-ib3o.onrender.com](https://kjhwr-backend-ib3o.onrender.com)  
📖 **API Docs (Swagger)**: [https://kjhwr-backend-ib3o.onrender.com/docs](https://kjhwr-backend-ib3o.onrender.com/docs)

## Overview

Wind generation is variable, so inaccurate forecasts can create challenges for electricity procurement and balancing decisions. This project compares published wind generation forecasts with actual generation for January 2026 and calculates key forecast error metrics.

The dashboard allows users to select a date range and forecast publication cutoff, inspect forecast-versus-actual generation, analyze forecast errors, and review matched hourly records.

## Features

- **Forecast vs. actual comparison:** Visualizes predicted and actual wind generation.
- **Forecast accuracy metrics:** Calculates Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and forecast bias.
- **Configurable forecast cutoff:** Selects forecasts published before a specified cutoff hour.
- **Historical analysis:** Supports analysis of the period from January 1 to January 31, 2026.
- **Forecast error visualization:** Displays the difference between forecast and actual generation.
- **Hourly records table:** Provides access to matched forecast and actual generation records.
- **API-based architecture:** Separates data retrieval and analytics from the frontend.
- **Containerization:** Designed to run the frontend and backend using Docker Compose.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- HTTPX
- Pydantic
- Uvicorn

### Data Source
- Elexon Balancing Mechanism Reporting Service (BMRS)

### Deployment and Development
- Docker
- Docker Compose
- Git and GitHub

## Architecture

```text
Elexon BMRS API
      |
      v
FastAPI Backend
      |
      +-- Fetch actual generation
      |
      +-- Fetch published forecasts
      |
      +-- Apply publication cutoff
      |
      +-- Align hourly forecast and actual data
      |
      +-- Calculate accuracy metrics
      |
      v
React Frontend
      |
      +-- KPI cards
      +-- Forecast vs. actual chart
      +-- Forecast error chart
      +-- Hourly records table
      +-- Date and cutoff filters
```

## Data Sources

The application uses the following Elexon BMRS API datasets.

### 1. Actual Wind Generation — FUELHH

Endpoint:

`https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream`

The application retrieves actual generation records and filters them to the `WIND` fuel type.

The source provides half-hourly actual generation data. The backend aggregates these records into hourly values for comparison with forecasts.

### 2. Wind Generation Forecasts — WINDFOR

Endpoint:

`https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`

The application retrieves forecast records using publication-time query parameters:

- `publishDateTimeFrom`
- `publishDateTimeTo`

The forecast data includes publication time, delivery time, and forecast generation.

**Important distinction:** Publication time indicates when a forecast was issued, while delivery time indicates when the forecasted generation applies.

## Analysis Methodology

### 1. Actual generation aggregation

Actual wind generation is available at half-hourly resolution. The backend combines the two half-hourly records belonging to an hour to calculate hourly average generation.

An hourly actual value is retained only when exactly two half-hourly records are available for that hour.

### 2. Forecast publication cutoff

Forecasts are filtered according to their publication timestamps. For each delivery hour, the backend selects the latest eligible forecast published at or before the configured cutoff.

This prevents forecasts published after the selected cutoff from being used in the analysis.

**Cutoff assumption:** The assignment does not specify an official procurement cutoff time. The selected UTC cutoff hour is therefore a configurable analytical assumption, not a confirmed operational procurement deadline.

### 3. Forecast and actual alignment

Forecast and actual records are aligned using their delivery timestamps. Accuracy metrics are calculated from the records that can be successfully matched.

### 4. Forecast error

For each matched record:

`Forecast Error = Forecast Generation - Actual Generation`

A positive error indicates overforecasting, while a negative error indicates underforecasting.

### 5. Accuracy metrics

**Mean Absolute Error (MAE)**

Measures the average absolute difference between forecast and actual generation.

\[
MAE=\frac{1}{n}\sum_{i=1}^{n}|F_i-A_i|
\]

**Root Mean Squared Error (RMSE)**

Penalizes larger forecast errors more heavily.

\[
RMSE=\sqrt{\frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)^2}
\]

**Forecast Bias**

Measures the average signed forecast error.

\[
Bias=\frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)
\]

Where:

- \(F_i\) = forecast generation for record \(i\)
- \(A_i\) = actual generation for record \(i\)
- \(n\) = number of matched records

Lower MAE and RMSE indicate better forecast accuracy. Positive bias indicates systematic overforecasting; negative bias indicates systematic underforecasting.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── schemas/
│   │   │   ├── actuals.py
│   │   │   ├── analysis.py
│   │   │   └── forecast.py
│   │   ├── services/
│   │   │   ├── actuals.py
│   │   │   ├── analysis.py
│   │   │   ├── forecast.py
│   │   │   └── metrics.py
│   │   ├── tests/
│   │   │   ├── test_alignment.py
│   │   │   ├── test_forecast_api.py
│   │   │   └── test_metrics.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisFilters.jsx
│   │   │   ├── ForecastActualChart.jsx
│   │   │   ├── ForecastErrorChart.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HourlyRecordsTable.jsx
│   │   │   ├── KpiCard.jsx
│   │   │   └── MethodologySection.jsx
│   │   ├── services/
│   │   │   └── analysisApi.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools:

- Python 3.10 or later
- Node.js and npm
- Git
- Docker and Docker Compose, if running the containerized version

### 1. Clone the repository

```bash
git clone https://github.com/SouravPaul2002/kjhwr.git
cd kjhwr
```

### 2. Run the backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows — Command Prompt**

```bash
venv\Scripts\activate
```

**Windows — PowerShell**

```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/macOS**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

- API base: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory using `.env.example` as a reference.

For local development, configure:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Build and lint the frontend

From the `frontend` directory:

```bash
npm run build
npm run lint
```

The production build is generated in the `frontend/dist` directory.

## API Reference

The backend exposes the following application endpoints.

| Endpoint | Description |
|---|---|
| `GET /health` | Checks backend health |
| `GET /api/forecasts` | Retrieves wind forecast data |
| `GET /api/actuals` | Retrieves actual wind generation data |
| `GET /api/analysis` | Compares forecasts with actual generation and returns analysis results |

### Analysis endpoint

Example request:

```http
GET /api/analysis?date_from=2026-01-01&date_to=2026-01-31&cutoff_hour_utc=12
```

Parameters:

| Parameter | Description |
|---|---|
| `date_from` | First analysis date |
| `date_to` | Last analysis date |
| `cutoff_hour_utc` | Forecast publication cutoff hour in UTC, from 0 to 23 |

The analysis endpoint is restricted to January 2026.

The response includes the requested date range, cutoff rule, accuracy metrics, matched record count, and an explanatory message where applicable.

## Docker

The project is intended to support running the frontend and backend together with Docker Compose.

Once the backend and frontend Dockerfiles and the root `docker-compose.yml` are configured, start the services from the repository root:

```bash
docker compose up --build
```

Stop the services with:

```bash
docker compose down
```

The frontend must use an API URL reachable from the user's browser. A Docker-internal hostname such as `http://backend:8000` is generally not reachable directly from the browser. Configure the frontend API URL appropriately for the selected local or deployed environment.

## Configuration

The frontend uses the following environment variable:

| Variable | Description | Local default | Production (Render) |
|---|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://127.0.0.1:8000` | `https://kjhwr-backend-ib3o.onrender.com` |

Vite embeds `VITE_` variables into the frontend during the build. In production builds, the frontend automatically defaults to `https://kjhwr-backend-ib3o.onrender.com` unless overridden.

Do not commit credentials, API secrets, or private environment files to the repository.

## Limitations and Assumptions

- The analysis period is limited to January 2026.
- The configured publication cutoff is an analytical assumption because the assignment does not define an official procurement cutoff.
- Forecast accuracy is calculated only for matched forecast and actual hourly records.
- Hourly actual generation is retained only when both expected half-hourly records are present.
- Historical forecast accuracy does not guarantee future forecast performance.
- The metrics evaluate forecast accuracy; they do not directly calculate financial savings, balancing costs, or procurement profitability.
- The project uses Elexon BMRS data and depends on the availability and response format of the external API.
- The dashboard is an analytical prototype and should not be treated as a production trading or procurement system without further validation.

## Testing

The repository contains test-related scripts under `backend/app/tests/`.

Run any available checks from the appropriate project directory. Live integration checks depend on access to the Elexon API.

Before deployment, verify:

- Backend endpoints return valid responses.
- Forecast and actual timestamps are aligned correctly.
- The cutoff excludes forecasts published after the selected time.
- MAE, RMSE, and bias match independently calculated results for known test data.
- The frontend builds successfully.
- The frontend can reach the deployed backend.
- Docker Compose starts both services successfully, if using Docker.

## Deployment

### Live Backend (Render)
- **Backend API Base**: `https://kjhwr-backend-ib3o.onrender.com`
- **Health Check**: [https://kjhwr-backend-ib3o.onrender.com/health](https://kjhwr-backend-ib3o.onrender.com/health)
- **API Documentation**: [https://kjhwr-backend-ib3o.onrender.com/docs](https://kjhwr-backend-ib3o.onrender.com/docs)
- **Analysis Endpoint**: [https://kjhwr-backend-ib3o.onrender.com/api/analysis?date_from=2026-01-01&date_to=2026-01-31&cutoff_hour_utc=12](https://kjhwr-backend-ib3o.onrender.com/api/analysis?date_from=2026-01-01&date_to=2026-01-31&cutoff_hour_utc=12)

### Frontend Deployment (e.g. Vercel, Netlify, Render)
1. Set the root directory to `frontend/`.
2. Configure environment variable:
   - `VITE_API_BASE_URL`: `https://kjhwr-backend-ib3o.onrender.com`
3. Build command: `npm run build`
4. Publish / Output directory: `dist`
5. The FastAPI backend has CORS enabled to accept requests from any deployed frontend origin.

### Live Deployment Links
- 🌐 **Live Dashboard (Vercel)**: [https://frontend-inky-theta-75.vercel.app](https://frontend-inky-theta-75.vercel.app)
- ⚙️ **Live Backend API (Render)**: [https://kjhwr-backend-ib3o.onrender.com](https://kjhwr-backend-ib3o.onrender.com)
- 📑 **Interactive API Docs (Swagger)**: [https://kjhwr-backend-ib3o.onrender.com/docs](https://kjhwr-backend-ib3o.onrender.com/docs)
- 🩺 **Health Check**: [https://kjhwr-backend-ib3o.onrender.com/health](https://kjhwr-backend-ib3o.onrender.com/health)

## AI Tool Usage

- **Antigravity**: Used as the AI development tool to assist with implementation guidance, code review, debugging, documentation, and writing the Docker configuration and commands.

The application code, data-processing logic, and final behavior were reviewed and validated by me.

## Author

**Sourav Paul**

GitHub: [SouravPaul2002](https://github.com/SouravPaul2002)

Project repository: [UK Wind Forecast Analytics Dashboard](https://github.com/SouravPaul2002/kjhwr)

---

Built as a data analytics project to explore historical UK wind generation forecasts, forecast accuracy, and decision support for day-ahead electricity procurement.
