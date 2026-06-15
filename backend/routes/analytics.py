"""
Analytics Route — /api/analytics/<city>
Provides city-level market data for the dashboard.
"""

import os
import json
import pickle
import pandas as pd
import numpy as np
from flask import Blueprint, jsonify

analytics_bp = Blueprint('analytics', __name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), '../saved_models')
DATASETS_DIR = os.path.join(os.path.dirname(__file__), '../../datasets')

# Cache computed analytics to avoid re-computation on every request
_cache = {}


def _compute_bengaluru_analytics():
    if 'bengaluru' in _cache:
        return _cache['bengaluru']

    df = pd.read_csv(os.path.join(DATASETS_DIR, 'Bengaluru_House_Data.csv'))
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from preprocessing.bengaluru_prep import preprocess_bengaluru
    X, y, encoder = preprocess_bengaluru(df, fit=True)
    df_clean = X.copy()
    df_clean['price'] = y.values

    # Top localities by mean price
    enc_path = os.path.join(MODELS_DIR, 'bengaluru_encoder.pkl')
    with open(enc_path, 'rb') as f:
        enc = pickle.load(f)

    top_locs = sorted(enc['loc_mean_price'].items(), key=lambda x: x[1], reverse=True)[:10]
    top_locs_data = [{'location': k, 'avg_price': round(v, 2)} for k, v in top_locs]

    # BHK distribution
    bhk_dist = df_clean['bhk'].value_counts().sort_index().to_dict()
    bhk_data = [{'bhk': int(k), 'count': int(v)} for k, v in bhk_dist.items() if 1 <= k <= 6]

    # Price range distribution
    bins = [0, 30, 60, 100, 150, 200, 300, 500, 10000]
    labels = ['<30L', '30-60L', '60-100L', '1-1.5Cr', '1.5-2Cr', '2-3Cr', '3-5Cr', '>5Cr']
    df_clean['price_range'] = pd.cut(df_clean['price'], bins=bins, labels=labels, right=False)
    price_dist = df_clean['price_range'].value_counts().sort_index()
    price_dist_data = [{'range': str(k), 'count': int(v)} for k, v in price_dist.items()]

    # Avg price by BHK
    bhk_price = df_clean.groupby('bhk')['price'].mean().reset_index()
    bhk_price_data = [
        {'bhk': int(r['bhk']), 'avg_price': round(r['price'], 2)}
        for _, r in bhk_price.iterrows() if 1 <= r['bhk'] <= 6
    ]

    # Summary stats
    summary = {
        'avg_price': round(float(df_clean['price'].mean()), 2),
        'median_price': round(float(df_clean['price'].median()), 2),
        'min_price': round(float(df_clean['price'].min()), 2),
        'max_price': round(float(df_clean['price'].max()), 2),
        'total_listings': int(len(df_clean)),
        'avg_price_per_sqft': round(float(df_clean['price_per_sqft'].mean()), 0),
        'city': 'bengaluru',
        'currency_unit': 'Lakhs (₹)',
    }

    result = {
        'summary': summary,
        'top_localities': top_locs_data,
        'bhk_distribution': bhk_data,
        'price_distribution': price_dist_data,
        'bhk_price': bhk_price_data,
    }
    _cache['bengaluru'] = result
    return result


def _compute_mumbai_analytics():
    if 'mumbai' in _cache:
        return _cache['mumbai']

    df = pd.read_csv(os.path.join(DATASETS_DIR, 'mumbai_listings_corrected-selected-columns.csv'))
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from preprocessing.mumbai_prep import preprocess_mumbai
    X, y, encoder = preprocess_mumbai(df, fit=True)
    df_clean = X.copy()
    df_clean['price'] = y.values

    enc_path = os.path.join(MODELS_DIR, 'mumbai_encoder.pkl')
    with open(enc_path, 'rb') as f:
        enc = pickle.load(f)

    top_locs = sorted(enc['loc_mean_price'].items(), key=lambda x: x[1], reverse=True)[:10]
    top_locs_data = [{'location': k, 'avg_price': round(v, 2)} for k, v in top_locs]

    bhk_dist = df_clean['bhk'].value_counts().sort_index().to_dict()
    bhk_data = [{'bhk': int(k), 'count': int(v)} for k, v in bhk_dist.items() if 1 <= k <= 6]

    bins = [0, 50, 100, 200, 350, 500, 1000, 100000]
    labels = ['<50L', '50-100L', '1-2Cr', '2-3.5Cr', '3.5-5Cr', '5-10Cr', '>10Cr']
    df_clean['price_range'] = pd.cut(df_clean['price'], bins=bins, labels=labels, right=False)
    price_dist = df_clean['price_range'].value_counts().sort_index()
    price_dist_data = [{'range': str(k), 'count': int(v)} for k, v in price_dist.items()]

    bhk_price = df_clean.groupby('bhk')['price'].mean().reset_index()
    bhk_price_data = [
        {'bhk': int(r['bhk']), 'avg_price': round(r['price'], 2)}
        for _, r in bhk_price.iterrows() if 1 <= r['bhk'] <= 6
    ]

    summary = {
        'avg_price': round(float(df_clean['price'].mean()), 2),
        'median_price': round(float(df_clean['price'].median()), 2),
        'min_price': round(float(df_clean['price'].min()), 2),
        'max_price': round(float(df_clean['price'].max()), 2),
        'total_listings': int(len(df_clean)),
        'avg_price_per_sqft': round(float(df_clean['price_per_sqft'].mean()), 0),
        'city': 'mumbai',
        'currency_unit': 'Lakhs (₹) / Crores',
    }

    result = {
        'summary': summary,
        'top_localities': top_locs_data,
        'bhk_distribution': bhk_data,
        'price_distribution': price_dist_data,
        'bhk_price': bhk_price_data,
    }
    _cache['mumbai'] = result
    return result


@analytics_bp.route('/analytics/<city>', methods=['GET'])
def analytics(city: str):
    """GET /api/analytics/bengaluru  OR  /api/analytics/mumbai"""
    try:
        city = city.lower()
        if city == 'bengaluru':
            data = _compute_bengaluru_analytics()
        elif city == 'mumbai':
            data = _compute_mumbai_analytics()
        else:
            return jsonify({'error': 'City must be bengaluru or mumbai'}), 400

        return jsonify({'success': True, **data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/compare-cities', methods=['GET'])
def compare_cities():
    """GET /api/analytics/compare-cities — side-by-side city comparison."""
    try:
        blr = _compute_bengaluru_analytics()
        mum = _compute_mumbai_analytics()
        comparison = {
            'bengaluru': blr['summary'],
            'mumbai': mum['summary'],
        }
        return jsonify({'success': True, 'comparison': comparison}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
