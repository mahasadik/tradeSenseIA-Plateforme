from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
import os

from routes.auth import auth_bp
from routes.plans import plans_bp
from routes.trades import trades_bp
from routes.leaderboard import leader_bp
from routes.prices import prices_bp
from routes.signals import signals_bp
from routes.bvc import bvc_bp
from routes.paypal import paypal_bp
from routes.settings import settings_bp
from routes.admin import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={
        r"/api/*": {
            "origins": app.config["CORS_ORIGINS"].split(","),
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"]
        },
        r"/*": {
            "origins": "*"  # Allow all for health check and root
        }
    })
    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(plans_bp)
    app.register_blueprint(trades_bp)
    app.register_blueprint(leader_bp)
    app.register_blueprint(prices_bp)
    app.register_blueprint(signals_bp)
    app.register_blueprint(bvc_bp)
    app.register_blueprint(paypal_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(admin_bp)
    
    @app.route("/")
    def root():
        return {"message": "TradeSense AI API is running", "status": "ok"}

    @app.route("/health")
    def health():
        return {"status": "ok"}
    
    @app.before_request
    def log_request_info():
        if request.path.startswith('/api/'):
            print(f"[DEBUG] {request.method} {request.path}")
            print(f"[DEBUG] Headers: {dict(request.headers)}")
            auth_header = request.headers.get('Authorization')
            if auth_header:
                print(f"[DEBUG] Authorization header present: {auth_header[:20]}...")
            else:
                print("[DEBUG] No Authorization header")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    # Allow host and port to be configured via environment variables for flexibility
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))
    app = create_app()
    print(f">>> Flask starting on http://{host}:{port}", flush=True)
    app.run(host=host, port=port, debug=False, use_reloader=False)
