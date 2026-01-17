from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, UserChallenge, Plan, Trade
from services.prices import get_yahoo_price
from services.challenge_engine import evaluate_challenge

trades_bp = Blueprint("trades", __name__, url_prefix="/api")

@trades_bp.post("/checkout/mock")
@jwt_required()
def checkout_mock():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    plan_id = data.get("plan_id")
    method = data.get("method", "CMI")
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "plan not found"}), 404

    ch = UserChallenge(
        user_id=user_id,
        plan_id=plan.id,
        starting_balance=plan.starting_balance,
        equity=plan.starting_balance,
        day_start_equity=plan.starting_balance
    )
    db.session.add(ch)
    db.session.commit()
    return jsonify({"message": "payment_success", "method": method, "challenge_id": ch.id}), 201

@trades_bp.post("/challenge/upgrade")
@jwt_required()
def upgrade_challenge():
    """Upgrader un challenge vers un plan supérieur"""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    challenge_id = data.get("challenge_id")
    new_plan_id = data.get("new_plan_id")
    
    # Vérifier que le challenge existe et appartient à l'utilisateur
    ch = UserChallenge.query.get(challenge_id)
    if not ch or ch.user_id != user_id:
        return jsonify({"error": "challenge not found"}), 404
    
    # Vérifier que le challenge est actif
    if ch.status != "active":
        return jsonify({"error": "only active challenges can be upgraded"}), 400
    
    # Vérifier le nouveau plan
    new_plan = Plan.query.get(new_plan_id)
    if not new_plan:
        return jsonify({"error": "plan not found"}), 404
    
    # Vérifier que c'est bien un upgrade (plan supérieur)
    current_plan = Plan.query.get(ch.plan_id)
    if new_plan.price_dh <= current_plan.price_dh:
        return jsonify({"error": "new plan must be superior to current plan"}), 400
    
    # Calculer la différence d'equity
    current_profit = ch.equity - ch.starting_balance
    
    # Upgrade du challenge
    ch.plan_id = new_plan.id
    ch.starting_balance = new_plan.starting_balance
    ch.equity = new_plan.starting_balance + current_profit  # Conserver le profit
    ch.day_start_equity = ch.equity
    
    db.session.commit()
    
    return jsonify({
        "message": "challenge upgraded successfully",
        "challenge_id": ch.id,
        "new_plan": new_plan.name,
        "new_starting_balance": new_plan.starting_balance,
        "new_equity": ch.equity
    }), 200

@trades_bp.post("/trades/open")
@jwt_required()
def open_trade():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    challenge_id = data.get("challenge_id")
    symbol = data.get("symbol")
    side = data.get("side")
    qty = float(data.get("qty", 0))
    market = data.get("market", "YAHOO")

    print(f"[DEBUG] Opening trade: user={user_id}, challenge={challenge_id}, symbol={symbol}, side={side}, qty={qty}")

    ch = UserChallenge.query.get(challenge_id)
    if not ch or ch.user_id != user_id:
        print(f"[ERROR] Challenge not found or unauthorized")
        return jsonify({"error": "challenge not found"}), 404
    if ch.status != "active":
        print(f"[ERROR] Challenge status is {ch.status}")
        return jsonify({"error": f"challenge is {ch.status}"}), 400
    if qty <= 0:
        print(f"[ERROR] Invalid quantity: {qty}")
        return jsonify({"error": "qty must be > 0"}), 400

    if market == "YAHOO":
        price = get_yahoo_price(symbol)
        print(f"[DEBUG] Got price from Yahoo: {price}")
    else:
        return jsonify({"error": "BVC not implemented in this skeleton"}), 400

    # Calculer le coût total de la position
    total_cost = price * qty
    
    print(f"[DEBUG] Total cost: {total_cost}, Current equity: {ch.equity}")
    
    # Vérifier si le solde est suffisant pour l'achat
    if side.upper() == "BUY" and total_cost > ch.equity:
        print(f"[ERROR] Insufficient balance. Required: {total_cost:.2f}, Available: {ch.equity:.2f}")
        return jsonify({"error": f"Solde insuffisant. Requis: {total_cost:.2f}, Disponible: {ch.equity:.2f}"}), 400
    
    # Réduire l'equity pour bloquer les fonds (pour BUY et SELL)
    ch.equity -= total_cost
    
    print(f"[DEBUG] Equity after blocking: {ch.equity}")
    
    t = Trade(
        challenge_id=ch.id,
        symbol=symbol,
        market=market,
        side=side,
        qty=qty,
        entry_price=price,
        status="OPEN",
    )
    db.session.add(t)
    db.session.commit()
    
    print(f"[SUCCESS] Trade created: id={t.id}, entry_price={price}")
    return jsonify({"trade_id": t.id, "entry_price": price, "remaining_equity": ch.equity}), 201

@trades_bp.post("/trades/close")
@jwt_required()
def close_trade():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    trade_id = data.get("trade_id")

    t = Trade.query.get(trade_id)
    if not t:
        return jsonify({"error": "trade not found"}), 404

    ch = UserChallenge.query.get(t.challenge_id)
    if ch.user_id != user_id:
        return jsonify({"error": "forbidden"}), 403
    if t.status != "OPEN":
        return jsonify({"error": "trade already closed"}), 400

    if t.market == "YAHOO":
        exit_price = get_yahoo_price(t.symbol)
    else:
        return jsonify({"error": "BVC not implemented"}), 400

    if t.side == "BUY":
        pnl = (exit_price - t.entry_price) * t.qty
        # Pour BUY: on restitue la valeur actuelle des actions
        exit_value = exit_price * t.qty
    else:  # SELL (short)
        pnl = (t.entry_price - exit_price) * t.qty
        # Pour SELL: on a bloqué la marge d'entrée, on restitue marge + P&L
        exit_value = (t.entry_price * t.qty) + pnl
    
    t.exit_price = exit_price
    t.pnl = pnl
    t.status = "CLOSED"
    t.closed_at = datetime.utcnow()

    # Restituer les fonds bloqués + le P&L
    ch.equity = float(ch.equity) + exit_value
    db.session.commit()

    # vérifie les règles après MAJ equity
    ch = evaluate_challenge(ch.id)

    return jsonify({
        "trade_id": t.id,
        "exit_price": exit_price,
        "pnl": pnl,
        "equity": ch.equity,
        "challenge_status": ch.status
    })

@trades_bp.get("/challenges")
@jwt_required()
def get_user_challenges():
    try:
        user_id = int(get_jwt_identity())
        print(f"[DEBUG] User ID from JWT: {user_id}")
    except Exception as e:
        print(f"[ERROR] JWT identity error: {e}")
        return jsonify({"error": "Invalid token"}), 401
    
    challenges = UserChallenge.query.filter_by(user_id=user_id).all()
    print(f"[DEBUG] Found {len(challenges)} challenges for user {user_id}")
    result = []
    for ch in challenges:
        plan = Plan.query.get(ch.plan_id)
        result.append({
            "id": ch.id,
            "plan_id": ch.plan_id,
            "plan_name": plan.name if plan else "Unknown",
            "status": ch.status,
            "starting_balance": ch.starting_balance,
            "equity": ch.equity,
            "day_start_equity": ch.day_start_equity,
            "created_at": ch.created_at.isoformat() if ch.created_at else None,
        })
    return jsonify(result)

@trades_bp.get("/trades")
@jwt_required()
def get_user_trades():
    user_id = int(get_jwt_identity())
    challenge_id = request.args.get("challenge_id")
    
    if challenge_id:
        ch = UserChallenge.query.get(challenge_id)
        if not ch or ch.user_id != user_id:
            return jsonify({"error": "challenge not found"}), 404
        trades = Trade.query.filter_by(challenge_id=challenge_id).all()
    else:
        # Get all trades for all user's challenges
        challenge_ids = [ch.id for ch in UserChallenge.query.filter_by(user_id=user_id).all()]
        trades = Trade.query.filter(Trade.challenge_id.in_(challenge_ids)).all() if challenge_ids else []
    
    result = []
    for t in trades:
        result.append({
            "id": t.id,
            "challenge_id": t.challenge_id,
            "symbol": t.symbol,
            "market": t.market,
            "side": t.side,
            "qty": t.qty,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "pnl": t.pnl,
            "status": t.status,
            "opened_at": t.opened_at.isoformat() if t.opened_at else None,
            "closed_at": t.closed_at.isoformat() if t.closed_at else None,
        })
    return jsonify(result)
