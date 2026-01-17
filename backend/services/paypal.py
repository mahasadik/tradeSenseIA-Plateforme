import paypalrestsdk
from models import db, Setting
from flask import current_app

def get_paypal_config():
    """Récupère la configuration PayPal depuis la base de données"""
    client_id = Setting.query.filter_by(key="PAYPAL_CLIENT_ID").first()
    client_secret = Setting.query.filter_by(key="PAYPAL_CLIENT_SECRET").first()
    mode = Setting.query.filter_by(key="PAYPAL_MODE").first()
    
    return {
        "client_id": client_id.value if client_id else "",
        "client_secret": client_secret.value if client_secret else "",
        "mode": mode.value if mode else "sandbox"  # sandbox ou live
    }

def configure_paypal():
    """Configure PayPal SDK avec les credentials de la BD"""
    config = get_paypal_config()
    
    if not config["client_id"] or not config["client_secret"]:
        raise ValueError("PayPal credentials not configured")
    
    paypalrestsdk.configure({
        "mode": config["mode"],
        "client_id": config["client_id"],
        "client_secret": config["client_secret"]
    })

def create_payment(amount_mad, plan_name, return_url, cancel_url):
    """
    Crée un paiement PayPal
    
    Args:
        amount_mad: Montant en MAD
        plan_name: Nom du plan
        return_url: URL de retour après succès
        cancel_url: URL de retour en cas d'annulation
    
    Returns:
        dict: Contenant payment_id et approval_url
    """
    configure_paypal()
    
    # Conversion MAD vers USD (approximatif: 1 MAD ≈ 0.10 USD)
    amount_usd = round(amount_mad * 0.10, 2)
    
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": f"Challenge {plan_name}",
                    "sku": f"PLAN_{plan_name.upper()}",
                    "price": str(amount_usd),
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "total": str(amount_usd),
                "currency": "USD"
            },
            "description": f"Accès au challenge de trading {plan_name}"
        }]
    })
    
    if payment.create():
        # Récupérer l'URL d'approbation
        for link in payment.links:
            if link.rel == "approval_url":
                approval_url = link.href
                return {
                    "payment_id": payment.id,
                    "approval_url": approval_url,
                    "status": "created"
                }
    else:
        raise Exception(f"PayPal error: {payment.error}")

def execute_payment(payment_id, payer_id):
    """
    Exécute un paiement PayPal après approbation
    
    Args:
        payment_id: ID du paiement PayPal
        payer_id: ID du payeur (reçu après approbation)
    
    Returns:
        dict: État du paiement
    """
    configure_paypal()
    
    payment = paypalrestsdk.Payment.find(payment_id)
    
    if payment.execute({"payer_id": payer_id}):
        return {
            "status": "completed",
            "payment_id": payment.id,
            "state": payment.state
        }
    else:
        raise Exception(f"PayPal execution error: {payment.error}")

def get_payment_details(payment_id):
    """Récupère les détails d'un paiement"""
    configure_paypal()
    
    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        return {
            "id": payment.id,
            "state": payment.state,
            "created_at": payment.create_time,
            "updated_at": payment.update_time
        }
    except Exception as e:
        raise Exception(f"Error fetching payment: {str(e)}")
