"""
ML Predictor — loads saved models and encoders, runs inference.
"""

import os
import sys
import pickle
import json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from preprocessing.bengaluru_prep import prepare_inference_bengaluru
from preprocessing.mumbai_prep import prepare_inference_mumbai

MODELS_DIR = os.path.join(os.path.dirname(__file__), '../saved_models')


class HousePricePredictor:
    """
    Singleton-style predictor that loads models once on startup.
    Supports both Bengaluru and Mumbai.
    """

    def __init__(self):
        self._models = {}
        self._encoders = {}
        self._metrics = {}
        self._load_artifacts()

    def _load_artifacts(self):
        for city in ['bengaluru', 'mumbai']:
            model_path = os.path.join(MODELS_DIR, f'{city}_model.pkl')
            encoder_path = os.path.join(MODELS_DIR, f'{city}_encoder.pkl')
            metrics_path = os.path.join(MODELS_DIR, f'{city}_metrics.json')

            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    self._models[city] = pickle.load(f)
                print(f"Loaded model: {city}")
            else:
                print(f"Model not found for {city}: {model_path}")

            if os.path.exists(encoder_path):
                with open(encoder_path, 'rb') as f:
                    self._encoders[city] = pickle.load(f)

            if os.path.exists(metrics_path):
                with open(metrics_path, 'r') as f:
                    self._metrics[city] = json.load(f)

    def predict(self, city: str, user_input: dict) -> dict:
        """
        Run inference for a given city and user input.

        Returns dict with:
            predicted_price_lakh, predicted_price_display, confidence, ai_insights
        """
        city = city.lower()
        if city not in self._models:
            raise ValueError(f"Model not loaded for city: {city}. Please run training first.")

        model = self._models[city]
        encoder = self._encoders[city]

        # Prepare feature row
        if city == 'bengaluru':
            X = prepare_inference_bengaluru(user_input, encoder)
        else:
            X = prepare_inference_mumbai(user_input, encoder)

        pred_lakh = float(model.predict(X)[0])
        pred_lakh = max(5.0, pred_lakh)  # floor at ₹5L

        # Confidence band ±10%
        conf_low = round(pred_lakh * 0.90, 2)
        conf_high = round(pred_lakh * 1.10, 2)

        # Compute per-sqft for display
        sqft = float(user_input.get('total_sqft', 1000))
        price_per_sqft = round((pred_lakh * 1e5) / sqft, 0)

        # Display string
        if city == 'mumbai':
            cr = round(pred_lakh / 100, 2)
            display = f"₹{cr} Cr"
            low_disp = f"₹{round(conf_low/100,2)} Cr"
            high_disp = f"₹{round(conf_high/100,2)} Cr"
        else:
            display = f"₹{round(pred_lakh,2)} L"
            low_disp = f"₹{round(conf_low,2)} L"
            high_disp = f"₹{round(conf_high,2)} L"

        # Generate AI insights
        insights = self._generate_insights(city, user_input, encoder, pred_lakh, price_per_sqft)

        return {
            'predicted_price_lakh': round(pred_lakh, 2),
            'predicted_price_display': display,
            'confidence_low': conf_low,
            'confidence_high': conf_high,
            'confidence_low_display': low_disp,
            'confidence_high_display': high_disp,
            'price_per_sqft': price_per_sqft,
            'investment_score': self._investment_score(encoder, user_input, price_per_sqft),
            'ai_insights': insights,
            'city': city,
        }

    def get_locations(self, city: str):
        city = city.lower()
        enc = self._encoders.get(city, {})
        locs = enc.get('valid_locations', [])
        return sorted([str(l) for l in locs if str(l).lower() not in ('other', 'nan')])

    def get_metrics(self, city: str = None):
        if city:
            return self._metrics.get(city.lower(), {})
        return self._metrics

    # ── Internal helpers ────────────────────────────────────────────────────

    def _investment_score(self, encoder: dict, user_input: dict, price_per_sqft: float) -> int:
        """Score 0-100 based on location popularity and price per sqft percentile."""
        location = user_input.get('location', 'other')
        popularity = encoder.get('loc_popularity', {}).get(location, 1)
        max_pop = max(encoder.get('loc_popularity', {1: 1}).values())
        max_ppsf = encoder.get('max_ppsf', price_per_sqft or 1)

        pop_score = (popularity / max_pop) * 50
        # Lower price_per_sqft relative to max → better investment value
        value_score = (1 - min(price_per_sqft / max_ppsf, 1)) * 50
        return min(100, int(pop_score + value_score))

    def _generate_insights(self, city, user_input, encoder, price_lakh, price_per_sqft) -> list:
        insights = []
        location = user_input.get('location', 'other')
        bhk = int(user_input.get('bhk', 2))
        popularity = encoder.get('loc_popularity', {}).get(location, 0)
        max_pop = max(encoder.get('loc_popularity', {1: 1}).values()) if encoder.get('loc_popularity') else 1
        max_ppsf = encoder.get('max_ppsf', 1)

        # Location insight
        pop_pct = popularity / max_pop if max_pop else 0
        if pop_pct > 0.6:
            insights.append({'icon': '🔥', 'text': f'{location} is a highly sought-after locality with strong demand.', 'type': 'positive'})
        elif pop_pct > 0.3:
            insights.append({'icon': '📈', 'text': f'{location} is a growing area with moderate listing activity.', 'type': 'neutral'})
        else:
            insights.append({'icon': '💎', 'text': f'{location} is an emerging locality — potential early-mover advantage.', 'type': 'positive'})

        # Price per sqft insight
        ppsf_pct = price_per_sqft / max_ppsf if max_ppsf else 0
        if ppsf_pct > 0.7:
            insights.append({'icon': '🏙️', 'text': 'Premium pricing zone — luxury segment with high capital appreciation history.', 'type': 'neutral'})
        elif ppsf_pct > 0.4:
            insights.append({'icon': '⚖️', 'text': 'Mid-range pricing — balanced value for end-users and investors.', 'type': 'positive'})
        else:
            insights.append({'icon': '🎯', 'text': 'Affordable pricing relative to city average — strong rental yield potential.', 'type': 'positive'})

        # BHK insight
        if bhk >= 4:
            insights.append({'icon': '👨‍👩‍👧‍👦', 'text': 'Large family configuration — resale liquidity may vary; suited for luxury buyers.', 'type': 'neutral'})
        elif bhk == 1:
            insights.append({'icon': '🏢', 'text': '1 BHK configurations have the highest rental demand — ideal for investment.', 'type': 'positive'})

        # City-specific
        if city == 'mumbai':
            insights.append({'icon': '🌊', 'text': 'Mumbai real estate historically appreciates 8-12% annually in premium micro-markets.', 'type': 'positive'})
        else:
            insights.append({'icon': '🌿', 'text': "Bengaluru's IT corridor continues to drive residential demand in tech-adjacent localities.", 'type': 'positive'})

        return insights


# Singleton instance loaded at import time
predictor = HousePricePredictor()
