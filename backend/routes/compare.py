"""
Compare Route — /api/compare
Compares two property listings side-by-side with AI scoring.
"""

from flask import Blueprint, request, jsonify
from ml.predictor import predictor

compare_bp = Blueprint('compare', __name__)


@compare_bp.route('/compare', methods=['POST'])
def compare():
    """
    POST /api/compare
    Body: { "city": "bengaluru", "properties": [ {...prop1...}, {...prop2...} ] }
    Each property uses same schema as /api/predict.
    Returns predictions for both properties with a comparison summary.
    """
    try:
        data = request.get_json(force=True)
        city = data.get('city', 'bengaluru').lower()
        properties = data.get('properties', [])

        if len(properties) < 2:
            return jsonify({'error': 'Provide at least 2 properties to compare'}), 400
        if len(properties) > 4:
            properties = properties[:4]  # cap at 4

        results = []
        for prop in properties:
            prop['city'] = city
            result = predictor.predict(city, prop)
            result['input'] = prop
            results.append(result)

        # Comparison summary
        prices = [r['predicted_price_lakh'] for r in results]
        best_value_idx = max(
            range(len(results)),
            key=lambda i: results[i]['investment_score']
        )

        summary = {
            'cheapest_idx': int(prices.index(min(prices))),
            'most_expensive_idx': int(prices.index(max(prices))),
            'best_value_idx': int(best_value_idx),
            'price_diff_lakh': round(max(prices) - min(prices), 2),
        }

        return jsonify({'success': True, 'properties': results, 'summary': summary}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
