# backend/auth_routes.py
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.database import SessionLocal
from backend.models import User, CreditAccount
from backend.security import hash_password, verify_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

# POST /api/register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    db = SessionLocal()
    try:
        # Check if username/email is already taken
        existing = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing:
            return jsonify({"error": "username or email already taken"}), 409

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
        )
        db.add(user)
        db.flush()  # Make user.user_id available

        # Create a corresponding CreditAccount with a default balance of 0
        account = CreditAccount(user_id=user.user_id, balance=0)
        db.add(account)

        db.commit()
        return jsonify({
            "userId": str(user.user_id),
            "username": user.username,
            "email": user.email
        }), 201
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "username or email already exists"}), 409
    except Exception as e:
        db.rollback()
        return jsonify({"error": "internal server error"}), 500
    finally:
        db.close()

# POST /api/login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username_or_email = data.get("username") or data.get("email")
    password = data.get("password", "")

    if not username_or_email or not password:
        return jsonify({"error": "username/email and password are required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email.lower())
        ).first()

        if not user:
            return jsonify({"error": "invalid credentials"}), 401

        if not verify_password(password, user.password_hash):
            return jsonify({"error": "invalid credentials"}), 401

        # Only return basic user information
        return jsonify({
            "userId": str(user.user_id),
            "username": user.username,
            "email": user.email
        }), 200
    finally:
        db.close()
