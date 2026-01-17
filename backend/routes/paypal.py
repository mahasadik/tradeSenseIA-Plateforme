from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, UserChallenge, Plan
from services.paypal import create_payment, execute_payment, get_payment_details

paypal_bp = Blueprint("paypal", __name__, url_prefix="/api/paypal")

@paypal_bp.post("/create-order")
@jwt_required()
def create_order():
    """Crée un paiement PayPal pour un plan"""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    plan_id = data.get("plan_id")
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "plan not found"}), 404
    
    # URLs de retour (à adapter selon votre domaine)
    return_url = data.get("return_url", "http://localhost:5173/checkout/success")
    cancel_url = data.get("cancel_url", "http://localhost:5173/checkout/cancel")
    
    try:
        payment_data = create_payment(
            amount_mad=plan.price_dh,
            plan_name=plan.name,
            return_url=return_url,
            cancel_url=cancel_url
        )
        
        return jsonify({
            "payment_id": payment_data["payment_id"],
            "approval_url": payment_data["approval_url"],
            "status": "created"
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"PayPal error: {str(e)}"}), 500

@paypal_bp.post("/capture-order")
@jwt_required()
def capture_order():
    """Capture un paiement PayPal après approbation"""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    payment_id = data.get("payment_id")
    payer_id = data.get("payer_id")
    plan_id = data.get("plan_id")
    
    if not payment_id or not payer_id or not plan_id:
        return jsonify({"error": "payment_id, payer_id and plan_id are required"}), 400
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "plan not found"}), 404
    
    try:
        # Exécuter le paiement PayPal
        result = execute_payment(payment_id, payer_id)
        
        if result["status"] == "completed":
            # Créer le challenge pour l'utilisateur
            ch = UserChallenge(
                user_id=user_id,
                plan_id=plan.id,
                starting_balance=plan.starting_balance,
                equity=plan.starting_balance,
                day_start_equity=plan.starting_balance
            )
            db.session.add(ch)
            db.session.commit()
            
            return jsonify({
                "message": "payment_success",
                "payment_id": payment_id,
                "challenge_id": ch.id,
                "status": "completed"
            }), 200
        else:
            return jsonify({"error": "payment not completed"}), 400
            
    except Exception as e:
        return jsonify({"error": f"PayPal capture error: {str(e)}"}), 500

@paypal_bp.get("/payment/<payment_id>")
@jwt_required()
def get_payment(payment_id):
    """Récupère les détails d'un paiement"""
    try:
        details = get_payment_details(payment_id)
        return jsonify(details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
