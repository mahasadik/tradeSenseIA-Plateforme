from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Setting

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

def is_superadmin(user_id):
    """Vérifie si l'utilisateur est un superadmin"""
    user = User.query.get(user_id)
    return user and user.role == "superadmin"

@settings_bp.get("")
@jwt_required()
def get_settings():
    """Récupère tous les settings (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    settings = Setting.query.all()
    return jsonify([{
        "id": s.id,
        "key": s.key,
        "value": s.value if not s.key.endswith("SECRET") else "***hidden***"
    } for s in settings])

@settings_bp.get("/<key>")
@jwt_required()
def get_setting(key):
    """Récupère un setting spécifique (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    setting = Setting.query.filter_by(key=key).first()
    if not setting:
        return jsonify({"error": "setting not found"}), 404
    
    return jsonify({
        "key": setting.key,
        "value": setting.value if not setting.key.endswith("SECRET") else "***hidden***"
    })

@settings_bp.post("")
@jwt_required()
def create_or_update_setting():
    """Crée ou met à jour un setting (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    data = request.get_json() or {}
    key = data.get("key")
    value = data.get("value")
    
    if not key or value is None:
        return jsonify({"error": "key and value are required"}), 400
    
    setting = Setting.query.filter_by(key=key).first()
    
    if setting:
        setting.value = value
    else:
        setting = Setting(key=key, value=value)
        db.session.add(setting)
    
    db.session.commit()
    
    return jsonify({
        "message": "setting updated successfully",
        "key": setting.key,
        "value": value if not key.endswith("SECRET") else "***hidden***"
    }), 200

@settings_bp.put("/<key>")
@jwt_required()
def update_setting(key):
    """Met à jour un setting existant (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    data = request.get_json() or {}
    value = data.get("value")
    
    if value is None:
        return jsonify({"error": "value is required"}), 400
    
    setting = Setting.query.filter_by(key=key).first()
    
    if not setting:
        return jsonify({"error": "setting not found"}), 404
    
    setting.value = value
    db.session.commit()
    
    return jsonify({
        "message": "setting updated successfully",
        "key": setting.key,
        "value": value if not key.endswith("SECRET") else "***hidden***"
    }), 200

@settings_bp.delete("/<key>")
@jwt_required()
def delete_setting(key):
    """Supprime un setting (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    setting = Setting.query.filter_by(key=key).first()
    
    if not setting:
        return jsonify({"error": "setting not found"}), 404
    
    db.session.delete(setting)
    db.session.commit()
    
    return jsonify({"message": "setting deleted successfully"}), 200

@settings_bp.post("/paypal/configure")
@jwt_required()
def configure_paypal():
    """Configure les credentials PayPal (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    data = request.get_json() or {}
    client_id = data.get("client_id")
    client_secret = data.get("client_secret")
    mode = data.get("mode", "sandbox")
    
    if not client_id or not client_secret:
        return jsonify({"error": "client_id and client_secret are required"}), 400
    
    if mode not in ["sandbox", "live"]:
        return jsonify({"error": "mode must be 'sandbox' or 'live'"}), 400
    
    # Mettre à jour ou créer les settings
    for key, value in [
        ("PAYPAL_CLIENT_ID", client_id),
        ("PAYPAL_CLIENT_SECRET", client_secret),
        ("PAYPAL_MODE", mode)
    ]:
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.session.add(setting)
    
    db.session.commit()
    
    return jsonify({
        "message": "PayPal configuration updated successfully",
        "mode": mode
    }), 200

@settings_bp.get("/paypal/status")
@jwt_required()
def paypal_status():
    """Vérifie si PayPal est configuré (SUPERADMIN uniquement)"""
    user_id = int(get_jwt_identity())
    
    if not is_superadmin(user_id):
        return jsonify({"error": "Unauthorized - SUPERADMIN access required"}), 403
    
    client_id = Setting.query.filter_by(key="PAYPAL_CLIENT_ID").first()
    client_secret = Setting.query.filter_by(key="PAYPAL_CLIENT_SECRET").first()
    mode = Setting.query.filter_by(key="PAYPAL_MODE").first()
    
    configured = bool(client_id and client_secret and client_id.value and client_secret.value)
    
    return jsonify({
        "configured": configured,
        "mode": mode.value if mode else "sandbox",
        "has_client_id": bool(client_id and client_id.value),
        "has_client_secret": bool(client_secret and client_secret.value)
    }), 200
