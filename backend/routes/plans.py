from flask import Blueprint, jsonify
from models import Plan

plans_bp = Blueprint("plans", __name__, url_prefix="/api/plans")

@plans_bp.get("")
def list_plans():
    plans = Plan.query.all()
    return jsonify([{"id": p.id, "name": p.name, "price_dh": p.price_dh, "starting_balance": p.starting_balance} for p in plans])
