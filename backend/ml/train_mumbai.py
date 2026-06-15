"""
Mumbai Model Training Script
==============================
Trains Linear Regression, Random Forest, and XGBoost on Mumbai data.
Saves the best model and encoder to saved_models/.
"""

import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
import pickle
import json
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from preprocessing.mumbai_prep import preprocess_mumbai, save_encoder

DATASET_PATH = os.path.join(os.path.dirname(__file__), '../../datasets/mumbai_listings_corrected-selected-columns.csv')
MODELS_DIR = os.path.join(os.path.dirname(__file__), '../saved_models')
os.makedirs(MODELS_DIR, exist_ok=True)


def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    print(f"\n{'='*50}")
    print(f"  {model_name}")
    print(f"{'='*50}")
    print(f"  MAE  : {mae:.4f} Lakhs")
    print(f"  RMSE : {rmse:.4f} Lakhs")
    print(f"  R²   : {r2:.4f}")
    return {'model': model_name, 'MAE': round(mae, 4), 'RMSE': round(rmse, 4), 'R2': round(r2, 4)}


def train():
    print("Loading Mumbai dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"  Raw shape: {df.shape}")

    print("\nPreprocessing...")
    X, y, encoder = preprocess_mumbai(df, fit=True)
    print(f"  Processed shape: X={X.shape}, y={y.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  Train: {X_train.shape[0]} rows | Test: {X_test.shape[0]} rows")

    results = []
    trained_models = {}

    # ── 1. Linear Regression ─────────────────────────────────────────────
    print("\nTraining Linear Regression...")
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    results.append(evaluate_model(lr, X_test, y_test, 'Linear Regression'))
    trained_models['Linear Regression'] = lr

    # ── 2. Decision Tree ─────────────────────────────────────────────────
    print("\nTraining Decision Tree...")
    dt = DecisionTreeRegressor(max_depth=10, random_state=42)
    dt.fit(X_train, y_train)
    results.append(evaluate_model(dt, X_test, y_test, 'Decision Tree'))
    trained_models['Decision Tree'] = dt

    # ── 3. Random Forest ─────────────────────────────────────────────────
    print("\nTraining Random Forest (GridSearchCV)...")
    rf_params = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
    }
    rf_base = RandomForestRegressor(random_state=42, n_jobs=-1)
    rf_cv = GridSearchCV(rf_base, rf_params, cv=3, scoring='r2', n_jobs=-1, verbose=0)
    rf_cv.fit(X_train, y_train)
    rf_best = rf_cv.best_estimator_
    print(f"  Best RF params: {rf_cv.best_params_}")
    results.append(evaluate_model(rf_best, X_test, y_test, 'Random Forest'))
    trained_models['Random Forest'] = rf_best

    # ── 4. Gradient Boosting ──────────────────────────────────────────────
    print("\nTraining Gradient Boosting...")
    gb = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, max_depth=5, random_state=42)
    gb.fit(X_train, y_train)
    results.append(evaluate_model(gb, X_test, y_test, 'Gradient Boosting'))
    trained_models['Gradient Boosting'] = gb

    # ── 5. XGBoost ───────────────────────────────────────────────────────
    print("\nTraining XGBoost (GridSearchCV)...")
    xgb_params = {
        'n_estimators': [200, 300],
        'learning_rate': [0.05, 0.1],
        'max_depth': [5, 7],
    }
    xgb_base = XGBRegressor(random_state=42, n_jobs=-1, verbosity=0)
    xgb_cv = GridSearchCV(xgb_base, xgb_params, cv=3, scoring='r2', n_jobs=-1, verbose=0)
    xgb_cv.fit(X_train, y_train)
    xgb_best = xgb_cv.best_estimator_
    print(f"  Best XGB params: {xgb_cv.best_params_}")
    results.append(evaluate_model(xgb_best, X_test, y_test, 'XGBoost'))
    trained_models['XGBoost'] = xgb_best

    # ── Select best model ─────────────────────────────────────────────────
    best = max(results, key=lambda x: x['R2'])
    print(f"\n✅ Best model: {best['model']} (R²={best['R2']})")

    best_model = trained_models[best['model']]

    cv_scores = cross_val_score(best_model, X, y, cv=5, scoring='r2')
    print(f"  5-Fold CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ── Save artifacts ────────────────────────────────────────────────────
    model_path = os.path.join(MODELS_DIR, 'mumbai_model.pkl')
    encoder_path = os.path.join(MODELS_DIR, 'mumbai_encoder.pkl')
    metrics_path = os.path.join(MODELS_DIR, 'mumbai_metrics.json')

    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)
    save_encoder(encoder, encoder_path)

    metrics = {
        'best_model': best['model'],
        'models': results,
        'cv_r2_mean': round(float(cv_scores.mean()), 4),
        'cv_r2_std': round(float(cv_scores.std()), 4),
        'feature_names': list(X.columns),
        'train_size': int(X_train.shape[0]),
        'test_size': int(X_test.shape[0]),
        'city': 'mumbai',
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✅ Saved: {model_path}")
    print(f"✅ Saved: {encoder_path}")
    print(f"✅ Saved: {metrics_path}")
    return metrics


if __name__ == '__main__':
    train()
