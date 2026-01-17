from flask import Blueprint, request, jsonify
from services.prices import get_yahoo_price, get_yahoo_history

prices_bp = Blueprint("prices", __name__, url_prefix="/api/prices")

@prices_bp.get("/yahoo")
def yahoo_price():
    ticker = request.args.get("ticker", "").strip()
    if not ticker:
        return jsonify({"error": "ticker is required"}), 400
    try:
        price = get_yahoo_price(ticker)
        return jsonify({"ticker": ticker, "price": price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@prices_bp.get("/yahoo/history")
def yahoo_history():
    ticker = request.args.get("ticker", "").strip()
    interval = request.args.get("interval", "1m")  # 1m,5m,15m,1h
    period = request.args.get("period", "1d")      # 1d,5d,1mo
    limit = int(request.args.get("limit", "300"))  # nb points max

    if not ticker:
        return jsonify({"error": "ticker is required"}), 400

    try:
        points = get_yahoo_history(ticker, period=period, interval=interval, limit=limit)
        return jsonify({"ticker": ticker, "points": points})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
