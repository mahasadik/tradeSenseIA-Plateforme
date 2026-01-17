from flask import Blueprint, request, jsonify
from services.bvc import get_bvc_price, get_bvc_symbols

bvc_bp = Blueprint("bvc", __name__, url_prefix="/api/prices")

@bvc_bp.get("/bvc")
def bvc_price():
    """Récupère le prix d'une action BVC"""
    symbol = request.args.get("symbol", "").strip()
    if not symbol:
        return jsonify({"error": "symbol is required"}), 400
    try:
        price = get_bvc_price(symbol)
        return jsonify({"symbol": symbol, "price": price, "currency": "MAD"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bvc_bp.get("/bvc/symbols")
def bvc_symbols():
    """Retourne la liste des symboles BVC disponibles"""
    try:
        symbols = get_bvc_symbols()
        return jsonify({"symbols": symbols})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
