from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    
    if not email or not password:
        return jsonify({"error": "email/password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    u = User(
        email=email, 
        password_hash=generate_password_hash(password),
        first_name=first_name if first_name else None,
        last_name=last_name if last_name else None
    )
    db.session.add(u)
    db.session.commit()
    return jsonify({"message": "registered"}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    u = User.query.filter_by(email=email).first()
    if not u or not check_password_hash(u.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_access_token(identity=str(u.id), additional_claims={"role": u.role})
    return jsonify({
        "access_token": token, 
        "user": {
            "id": u.id, 
            "email": u.email, 
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role
        }
    })

@auth_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "user not found"}), 404
    return jsonify({
        "id": u.id,
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "phone": u.phone if hasattr(u, 'phone') else None,
        "currency": u.currency if hasattr(u, 'currency') else "USD",
        "role": u.role,
        "created_at": u.created_at.isoformat() if u.created_at else None
    })

@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "user not found"}), 404
    
    data = request.get_json() or {}
    
    # Update allowed fields
    if "first_name" in data:
        u.first_name = data["first_name"]
    if "last_name" in data:
        u.last_name = data["last_name"]
    if "phone" in data and hasattr(u, 'phone'):
        u.phone = data["phone"]
    if "currency" in data and hasattr(u, 'currency'):
        u.currency = data["currency"]
    
    db.session.commit()
    return jsonify({"message": "profile updated"})

@auth_bp.put("/password")
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "user not found"}), 404
    
    data = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    
    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password required"}), 400
    
    if not check_password_hash(u.password_hash, current_password):
        return jsonify({"error": "incorrect current password"}), 401
    
    u.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "password updated"})
