# backend/app.py
from flask import Flask, jsonify
from auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)

    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "Backend is running"})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
