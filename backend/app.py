"""
Flask Application — House Price Prediction API
================================================
Entry point for the backend server.
"""

import os
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure backend directory is in path for module resolution
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Register blueprints ────────────────────────────────────────────────────
from routes.predict import predict_bp
from routes.analytics import analytics_bp
from routes.compare import compare_bp

app.register_blueprint(predict_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(compare_bp, url_prefix='/api')


# ── Health check ───────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'House Price Prediction API is running'}, 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    print(f"Starting server on port {port}...")
    app.run(debug=debug, host='0.0.0.0', port=port)
