# 🏠 House Price Prediction System

An AI-powered full-stack web application for predicting residential property prices in **Bengaluru** and **Mumbai**, built with a Flask ML backend and a React + Tailwind CSS frontend.

---

## 🚀 Features

- **Dual-city ML models** — separate trained models for Bengaluru and Mumbai
- **Multiple algorithms** — Linear Regression, Decision Tree, Random Forest, Gradient Boosting, XGBoost; best model auto-selected by R²
- **Real-time prediction** — instant price estimates with ±10% confidence band
- **Investment Score** — composite score based on location popularity and price-per-sqft
- **AI Insights** — locality demand, pricing zone analysis, and market commentary
- **Interactive map** — Leaflet.js property location pinning (no API key needed)
- **Analytics Dashboard** — top localities, BHK distribution, price range charts
- **Model Performance** — R², MAE, RMSE comparison across all trained models
- **Property Comparison** — compare two properties side-by-side with AI scoring

---

## 🗂 Project Structure

```
Project M/
├── backend/
│   ├── app.py                    # Flask entry point
│   ├── routes/
│   │   ├── predict.py            # /predict + /locations/<city>
│   │   ├── analytics.py          # /analytics/<city>
│   │   └── compare.py            # /compare
│   ├── ml/
│   │   ├── train_bengaluru.py    # Training script (Bengaluru)
│   │   ├── train_mumbai.py       # Training script (Mumbai)
│   │   └── predictor.py          # Inference class (singleton)
│   ├── preprocessing/
│   │   ├── bengaluru_prep.py     # Feature engineering for Bengaluru
│   │   └── mumbai_prep.py        # Feature engineering for Mumbai
│   ├── saved_models/             # .pkl models + encoders + metrics
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Hero + features + CTA
│   │   │   ├── PredictPage.jsx   # Prediction form + result
│   │   │   ├── DashboardPage.jsx # Analytics + model metrics
│   │   │   └── ComparePage.jsx   # Side-by-side comparison
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ResultCard.jsx    # Prediction result display
│   │   │   ├── AIInsights.jsx    # AI commentary cards
│   │   │   ├── MapSection.jsx    # Leaflet interactive map
│   │   │   ├── AnalyticsChart.jsx# Recharts chart components
│   │   │   ├── ModelPerformance.jsx
│   │   │   └── Footer.jsx
│   │   ├── hooks/
│   │   │   └── usePrediction.js  # Prediction state management
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   └── index.css             # Design tokens + utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── datasets/
│   ├── Bengaluru_House_Data.csv
│   └── mumbai_listings_corrected-selected-columns.csv
│
├── notebooks/
│   ├── EDA.ipynb
│   └── Model_Training.ipynb
│
└── documentation/
    └── Project_Report.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# → Server starts on http://localhost:5001
```

> **Note:** Models are pre-trained and saved in `saved_models/`. You do **not** need to re-train unless you want to experiment. To re-train:

```bash
python ml/train_bengaluru.py
python ml/train_mumbai.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → App opens on http://localhost:3000
```

Vite proxies all `/api/*` requests to `http://localhost:5001` automatically.

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/predict` | POST | Predict price for a property |
| `/api/locations/<city>` | GET | Valid locality names for a city |
| `/api/analytics/<city>` | GET | Market analytics (charts data) |
| `/api/analytics/compare-cities` | GET | Side-by-side city summary |
| `/api/compare` | POST | Compare two properties |
| `/api/model-performance` | GET | Model metrics (R², MAE, RMSE) |

### POST `/api/predict` — Request Body

```json
{
  "city": "bengaluru",
  "total_sqft": 1200,
  "bhk": 2,
  "bath": 2,
  "balcony": 1,
  "location": "Whitefield",
  "area_type": "Super built-up  Area"
}
```

---

## 🤖 ML Pipeline

### Bengaluru
- Dataset: 13,320 rows × 9 columns
- Preprocessing: parse `size` → BHK, parse sqft ranges, location frequency encoding
- Best Model: **Random Forest** — R² 99.7%, MAE ₹1.11L

### Mumbai
- Dataset: 2,748 rows × 10 columns
- Preprocessing: parse price strings (₹X Cr), extract locality from listing text
- Best Model: **Random Forest** — R² ~97%

### Feature Engineering
- `price_per_sqft`, `bhk_bath_ratio`, `location_mean_price` (target encoding)
- `luxury_score` (composite), `area_type_encoded`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Framer Motion |
| Charts | Recharts |
| Map | Leaflet.js + React-Leaflet |
| HTTP | Axios |
| Backend | Python, Flask, Flask-CORS |
| ML | scikit-learn, XGBoost, pandas, NumPy |
| Models | Pickle (.pkl) |

---

## 📸 Pages

| Page | Route |
|---|---|
| Landing | `/` |
| AI Predictor | `/predict` |
| Analytics Dashboard | `/dashboard` |
| Property Comparison | `/compare` |

---

## 👤 Author

**Tushar** — MNNIT Allahabad  
B.Tech Final Year Project · 2025–26
