"""
Bengaluru House Data Preprocessing Pipeline
============================================
Handles:
  - total_sqft range parsing
  - size/BHK extraction
  - missing value imputation
  - outlier removal (price_per_sqft)
  - location frequency bucketing
  - categorical encoding
"""

import pandas as pd
import numpy as np
import re
import pickle
import os


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_sqft(value: str) -> float:
    """Convert 'total_sqft' values like '1200', '1200-1500', '1200.0 Sq. Meter' to float (sqft)."""
    if pd.isna(value):
        return np.nan
    value = str(value).strip()

    # Range: "1200-1500" → take average
    if '-' in value:
        parts = value.split('-')
        try:
            return (float(parts[0]) + float(parts[1])) / 2
        except ValueError:
            return np.nan

    # Remove common unit strings, leaving the number
    value_clean = re.sub(r'[^\d.]', '', value.split()[0])
    try:
        num = float(value_clean)
    except ValueError:
        return np.nan

    # Convert Sq. Meter → sqft (1 sq. m ≈ 10.764)
    if 'sq. meter' in value.lower() or 'sq meter' in value.lower():
        num *= 10.764
    # Convert Sq. Yards → sqft (1 sq. yard = 9 sqft)
    elif 'sq. yard' in value.lower() or 'sq yard' in value.lower():
        num *= 9
    # Perch → sqft (1 perch ≈ 272.25)
    elif 'perch' in value.lower():
        num *= 272.25

    return num


def parse_bhk(size_str: str) -> int:
    """Extract BHK count from strings like '2 BHK', '4 Bedroom', '1 RK'."""
    if pd.isna(size_str):
        return np.nan
    m = re.search(r'(\d+)', str(size_str))
    return int(m.group(1)) if m else np.nan


# ---------------------------------------------------------------------------
# Main preprocessing function
# ---------------------------------------------------------------------------

def preprocess_bengaluru(df: pd.DataFrame, fit: bool = True, encoder: dict = None):
    """
    Preprocess the Bengaluru house dataset.

    Parameters
    ----------
    df      : Raw DataFrame
    fit     : If True, compute and return location stats; if False, use provided encoder
    encoder : Dict with location stats (used during inference)

    Returns
    -------
    X       : Feature DataFrame
    y       : Target Series (price in Lakhs) — None during inference
    encoder : Dict of encoding artifacts
    """
    df = df.copy()

    # ── 1. Parse numeric columns ────────────────────────────────────────────
    df['total_sqft'] = df['total_sqft'].apply(parse_sqft)
    df['bhk'] = df['size'].apply(parse_bhk)
    df['bath'] = pd.to_numeric(df['bath'], errors='coerce')
    df['balcony'] = pd.to_numeric(df['balcony'], errors='coerce')

    # ── 2. Drop rows with missing critical fields ───────────────────────────
    df.dropna(subset=['total_sqft', 'bhk', 'price'], inplace=True)

    # ── 3. Impute bath / balcony with median ────────────────────────────────
    df['bath'] = df['bath'].fillna(df['bath'].median())
    df['balcony'] = df['balcony'].fillna(df['balcony'].median())

    # ── 4. Drop irrelevant columns ──────────────────────────────────────────
    df.drop(columns=['society', 'size', 'availability'], errors='ignore', inplace=True)

    # ── 5. Feature Engineering ──────────────────────────────────────────────
    df['price_per_sqft'] = (df['price'] * 1e5) / df['total_sqft']  # per sqft in ₹

    # area_type encoding
    area_map = {
        'Super built-up  Area': 3,
        'Built-up  Area': 2,
        'Plot  Area': 1,
        'Carpet  Area': 2,
    }
    df['area_type_enc'] = df['area_type'].map(area_map).fillna(2).astype(int)
    df.drop(columns=['area_type'], inplace=True)

    # ── 6. Outlier Removal (price_per_sqft) ────────────────────────────────
    if fit:
        q_low = df['price_per_sqft'].quantile(0.01)
        q_high = df['price_per_sqft'].quantile(0.99)
        df = df[(df['price_per_sqft'] >= q_low) & (df['price_per_sqft'] <= q_high)]

        # Also remove rows where bath > bhk + 2 (unrealistic)
        df = df[df['bath'] <= df['bhk'] + 2]

        # Remove sqft outliers
        df = df[(df['total_sqft'] >= 100) & (df['total_sqft'] <= 30000)]

    # ── 7. Location encoding ────────────────────────────────────────────────
    df['location'] = df['location'].astype(str).str.strip()

    if fit:
        loc_counts = df['location'].value_counts()
        # Locations with < 10 listings → bucket as 'other'
        rare_locs = loc_counts[loc_counts < 10].index
        df['location'] = df['location'].apply(lambda x: 'other' if x in rare_locs else x)

        # Location mean price (target encoding proxy)
        loc_mean_price = df.groupby('location')['price'].mean().to_dict()
        loc_popularity = df['location'].value_counts().to_dict()
        valid_locations = list(df['location'].unique())

        encoder = {
            'rare_locs': list(rare_locs),
            'loc_mean_price': loc_mean_price,
            'loc_popularity': loc_popularity,
            'valid_locations': valid_locations,
            'city': 'bengaluru',
        }
    else:
        rare_locs = encoder.get('rare_locs', [])
        df['location'] = df['location'].apply(
            lambda x: 'other' if x not in encoder['valid_locations'] else x
        )

    df['location_mean_price'] = df['location'].map(encoder['loc_mean_price']).fillna(
        df['price'].mean() if fit else encoder.get('global_mean', 50)
    )
    df['location_popularity'] = df['location'].map(encoder['loc_popularity']).fillna(1)
    df['luxury_score'] = (df['price_per_sqft'] / df['price_per_sqft'].max() * 100).round(1) \
        if fit else (df['price_per_sqft'] / encoder.get('max_ppsf', 1) * 100).round(1)

    if fit:
        encoder['global_mean'] = df['price'].mean()
        encoder['max_ppsf'] = df['price_per_sqft'].max()

    # ── 8. Final feature selection ──────────────────────────────────────────
    feature_cols = [
        'total_sqft', 'bhk', 'bath', 'balcony',
        'area_type_enc', 'location_mean_price', 'location_popularity',
        'price_per_sqft', 'luxury_score',
    ]

    y = df['price'] if 'price' in df.columns else None
    df.drop(columns=['location'], errors='ignore', inplace=True)
    df.drop(columns=['price'], errors='ignore', inplace=True)

    X = df[feature_cols]
    return X, y, encoder


def save_encoder(encoder: dict, path: str):
    with open(path, 'wb') as f:
        pickle.dump(encoder, f)
    print(f"Encoder saved to {path}")


def load_encoder(path: str) -> dict:
    with open(path, 'rb') as f:
        return pickle.load(f)


# ---------------------------------------------------------------------------
# Inference helper — used by Flask predictor
# ---------------------------------------------------------------------------

def prepare_inference_bengaluru(user_input: dict, encoder: dict) -> pd.DataFrame:
    """
    Convert a user-input dict (from the API) into a model-ready DataFrame row.

    Expected keys in user_input:
        total_sqft, bhk, bath, balcony, location, area_type
    """
    area_map = {
        'Super built-up  Area': 3, 'Built-up  Area': 2,
        'Plot  Area': 1, 'Carpet  Area': 2,
    }
    location = str(user_input.get('location', 'other')).strip()
    if location not in encoder['valid_locations']:
        location = 'other'

    total_sqft = float(user_input.get('total_sqft', 1000))
    bhk = int(user_input.get('bhk', 2))
    bath = float(user_input.get('bath', 2))
    balcony = float(user_input.get('balcony', 1))
    area_type_raw = user_input.get('area_type', 'Built-up  Area')
    area_type_enc = area_map.get(area_type_raw, 2)

    # Estimate price_per_sqft from location mean
    loc_mean = encoder['loc_mean_price'].get(location, encoder.get('global_mean', 50))
    # Rough price_per_sqft estimate (will be recalculated by model after prediction)
    estimated_ppsf = (loc_mean * 1e5) / total_sqft
    luxury_score = min(100, (estimated_ppsf / encoder.get('max_ppsf', 1)) * 100)
    loc_popularity = encoder['loc_popularity'].get(location, 1)

    row = {
        'total_sqft': total_sqft,
        'bhk': bhk,
        'bath': bath,
        'balcony': balcony,
        'area_type_enc': area_type_enc,
        'location_mean_price': loc_mean,
        'location_popularity': loc_popularity,
        'price_per_sqft': estimated_ppsf,
        'luxury_score': round(luxury_score, 1),
    }
    return pd.DataFrame([row])
