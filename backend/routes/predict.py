"""
Predict Route — /api/predict and /api/locations/<city>
"""

from flask import Blueprint, request, jsonify
from ml.predictor import predictor

predict_bp = Blueprint('predict', __name__)


@predict_bp.route('/predict', methods=['POST'])
def predict():
    """
    POST /api/predict
    Body (JSON):
    {
        "city": "bengaluru" | "mumbai",
        "total_sqft": 1200,
        "bhk": 2,
        "bath": 2,
        "balcony": 1,
        "location": "Whitefield",
        "area_type": "Super built-up  Area"
    }
    """
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        city = data.get('city', 'bengaluru').lower()
        if city not in ('bengaluru', 'mumbai'):
            return jsonify({'error': 'city must be "bengaluru" or "mumbai"'}), 400

        result = predictor.predict(city, data)
        return jsonify({'success': True, **result}), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@predict_bp.route('/locations/<city>', methods=['GET'])
def get_locations(city: str):
    """
    GET /api/locations/bengaluru
    GET /api/locations/mumbai
    Returns sorted list of valid location names.
    """
    try:
        locations = predictor.get_locations(city)
        return jsonify({'city': city, 'locations': locations, 'count': len(locations)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predict_bp.route('/model-performance', methods=['GET'])
def model_performance():
    """GET /api/model-performance — returns all model metrics for dashboard."""
    try:
        metrics = predictor.get_metrics()
        return jsonify({'success': True, 'metrics': metrics}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
