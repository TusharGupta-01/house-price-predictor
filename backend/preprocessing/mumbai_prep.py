"""
Mumbai House Data Preprocessing Pipeline
=========================================
Handles:
  - Price parsing: "₹3.49 Cr" → float (Lakhs)
  - Area parsing: "1,019 sqft" → float
  - BHK parsing: "2 BHK" → int
  - Bathroom parsing: "(2 Baths)" → int
  - Location extraction from full description string
  - Outlier removal
  - Feature engineering
"""

import pandas as pd
import numpy as np
import re
import pickle


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_mumbai_price(price_str: str) -> float:
    """
    Convert Mumbai price strings to Lakhs (₹).
    Examples:
        '₹3.49 Cr'  → 349.0 Lakhs
        '₹85 L'     → 85.0 Lakhs
        '₹1.5 Cr'   → 150.0 Lakhs
    """
    if pd.isna(price_str):
        return np.nan
    s = str(price_str).replace('₹', '').replace(',', '').strip()
    try:
        if 'Cr' in s or 'cr' in s:
            num = float(re.sub(r'[^\d.]', '', s.replace('Cr', '').replace('cr', '')))
            return round(num * 100, 2)   # 1 Cr = 100 Lakh
        elif 'L' in s or 'Lac' in s or 'lakh' in s.lower():
            num = float(re.sub(r'[^\d.]', '', s))
            return round(num, 2)
        else:
            num = float(re.sub(r'[^\d.]', '', s))
            # Assume raw number is in Lakhs
            return round(num, 2)
    except Exception:
        return np.nan


def parse_mumbai_area(area_str: str) -> float:
    """Parse area strings like '1,019 sqft' → 1019.0"""
    if pd.isna(area_str):
        return np.nan
    cleaned = re.sub(r'[^\d.]', '', str(area_str).replace(',', ''))
    try:
        return float(cleaned)
    except ValueError:
        return np.nan


def parse_mumbai_bhk(bhk_str: str) -> int:
    """Parse '2 BHK', '1 RK', '3 BHK + 3T' → int"""
    if pd.isna(bhk_str):
        return np.nan
    m = re.search(r'(\d+)', str(bhk_str))
    return int(m.group(1)) if m else np.nan


def parse_mumbai_bath(bath_str: str) -> int:
    """Parse '(2 Baths)', '(1 Bath)' → int"""
    if pd.isna(bath_str):
        return np.nan
    m = re.search(r'(\d+)', str(bath_str))
    return int(m.group(1)) if m else np.nan


def extract_locality_mumbai(location_str: str) -> str:
    """
    Extract locality from strings like:
        '2 BHK Flat in Ghatkopar West, Mumbai'
        '3 BHK Apartment in Andheri East, Mumbai'
    Returns: 'Ghatkopar West'
    """
    if pd.isna(location_str):
        return 'other'
    # Pattern: "... in <locality>, Mumbai"
    m = re.search(r'\bin\s+(.+?),\s*Mumbai', str(location_str), re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # Fallback: grab text after last 'in '
    parts = str(location_str).split('in ')
    if len(parts) > 1:
        return parts[-1].split(',')[0].strip()
    return 'other'


# ---------------------------------------------------------------------------
# Main preprocessing function
# ---------------------------------------------------------------------------

def preprocess_mumbai(df: pd.DataFrame, fit: bool = True, encoder: dict = None):
    """
    Preprocess the Mumbai house dataset.

    Parameters
    ----------
    df      : Raw DataFrame
    fit     : True during training; False during inference
    encoder : Encoding artifacts dict (for inference mode)

    Returns
    -------
    X       : Feature DataFrame
    y       : Target Series (price in Lakhs)
    encoder : Dict of encoding artifacts
    """
    df = df.copy()

    # ── 1. Parse all fields ─────────────────────────────────────────────────
    df['price_lakh'] = df['price'].apply(parse_mumbai_price)
    df['sqft'] = df['area'].apply(parse_mumbai_area)
    df['bhk'] = df['bhk'].apply(parse_mumbai_bhk)
    df['bath'] = df['bathroom'].apply(parse_mumbai_bath)
    df['locality'] = df['location'].apply(extract_locality_mumbai)

    # area_type encoding
    area_map = {
        'Built-up Area': 2,
        'Super Built-up Area': 3,
        'Carpet Area': 1,
    }
    df['area_type_enc'] = df['area_type_x'].map(area_map).fillna(2).astype(int)

    # ── 2. Drop rows with missing critical fields ───────────────────────────
    df.dropna(subset=['price_lakh', 'sqft', 'bhk'], inplace=True)

    # ── 3. Impute bath ──────────────────────────────────────────────────────
    df['bath'] = df['bath'].fillna(df['bhk'])  # BHK ≈ bath as fallback

    # ── 4. Feature Engineering ──────────────────────────────────────────────
    df['price_per_sqft'] = (df['price_lakh'] * 1e5) / df['sqft']

    # ── 5. Outlier Removal ──────────────────────────────────────────────────
    if fit:
        q_low = df['price_per_sqft'].quantile(0.01)
        q_high = df['price_per_sqft'].quantile(0.99)
        df = df[(df['price_per_sqft'] >= q_low) & (df['price_per_sqft'] <= q_high)]
        df = df[df['bath'] <= df['bhk'] + 2]
        df = df[(df['sqft'] >= 100) & (df['sqft'] <= 20000)]

    # ── 6. Location encoding ────────────────────────────────────────────────
    if fit:
        loc_counts = df['locality'].value_counts()
        rare_locs = loc_counts[loc_counts < 5].index
        df['locality'] = df['locality'].apply(lambda x: 'other' if x in rare_locs else x)

        loc_mean_price = df.groupby('locality')['price_lakh'].mean().to_dict()
        loc_popularity = df['locality'].value_counts().to_dict()
        valid_locations = list(df['locality'].unique())

        encoder = {
            'rare_locs': list(rare_locs),
            'loc_mean_price': loc_mean_price,
            'loc_popularity': loc_popularity,
            'valid_locations': valid_locations,
            'global_mean': df['price_lakh'].mean(),
            'max_ppsf': df['price_per_sqft'].max(),
            'city': 'mumbai',
        }
    else:
        df['locality'] = df['locality'].apply(
            lambda x: x if x in encoder['valid_locations'] else 'other'
        )

    df['location_mean_price'] = df['locality'].map(encoder['loc_mean_price']).fillna(
        encoder.get('global_mean', 200)
    )
    df['location_popularity'] = df['locality'].map(encoder['loc_popularity']).fillna(1)
    df['luxury_score'] = (df['price_per_sqft'] / encoder.get('max_ppsf', 1) * 100).round(1)
    df['balcony'] = 1  # Mumbai data has no balcony info; use 1 as default

    # ── 7. Final feature selection ──────────────────────────────────────────
    feature_cols = [
        'sqft', 'bhk', 'bath', 'balcony',
        'area_type_enc', 'location_mean_price', 'location_popularity',
        'price_per_sqft', 'luxury_score',
    ]
    # Rename sqft to match Bengaluru schema → total_sqft
    df.rename(columns={'sqft': 'total_sqft'}, inplace=True)
    feature_cols[0] = 'total_sqft'

    y = df['price_lakh'] if 'price_lakh' in df.columns else None
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
# Inference helper
# ---------------------------------------------------------------------------

def prepare_inference_mumbai(user_input: dict, encoder: dict) -> pd.DataFrame:
    """
    Convert API user input to a model-ready DataFrame for Mumbai.

    Expected keys: total_sqft, bhk, bath, locality, area_type
    """
    area_map = {'Built-up Area': 2, 'Super Built-up Area': 3, 'Carpet Area': 1}
    locality = str(user_input.get('location', 'other')).strip()
    if locality not in encoder['valid_locations']:
        locality = 'other'

    total_sqft = float(user_input.get('total_sqft', 600))
    bhk = int(user_input.get('bhk', 2))
    bath = float(user_input.get('bath', bhk))
    balcony = float(user_input.get('balcony', 1))
    area_type_enc = area_map.get(user_input.get('area_type', 'Built-up Area'), 2)

    loc_mean = encoder['loc_mean_price'].get(locality, encoder.get('global_mean', 200))
    estimated_ppsf = (loc_mean * 1e5) / total_sqft
    luxury_score = min(100, (estimated_ppsf / encoder.get('max_ppsf', 1)) * 100)
    loc_popularity = encoder['loc_popularity'].get(locality, 1)

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
