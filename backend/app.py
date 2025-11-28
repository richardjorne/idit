# backend/app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.auth_routes import auth_bp

def create_app() -> Flask:
    app = Flask(__name__)

    # Comma-separated list of allowed frontend origins.
    # Example: "http://localhost:5173,https://idit.vercel.app"
    origins_raw = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173"
    )
    frontend_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]

    CORS(
        app,
        resources={r"/api/*": {"origins": frontend_origins}},
        supports_credentials=True,
    )

    app.register_blueprint(auth_bp)

    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "Auth backend is running"})

    return app


app = create_app()

if __name__ == "__main__":
    # Local development
    app.run(debug=True)
