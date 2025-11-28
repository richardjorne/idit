# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from auth_routes import auth_bp

def create_app():
    app = Flask(__name__)

    # Allow cross-domain access for front-end
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(auth_bp)

    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "Backend is running"})

    return app

app = create_app()

if __name__ == "__main__":
    # Default port 5000
    app.run(debug=True)
