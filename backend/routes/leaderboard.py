from flask import Blueprint, jsonify
from models import UserChallenge, User

leader_bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")

@leader_bp.get("")
def leaderboard():
    # MVP: top 10 sur tous les challenges avec infos utilisateur
    rows = (UserChallenge.query
            .join(User, User.id == UserChallenge.user_id)
            .all())

    data = []
    for ch in rows:
        user = User.query.get(ch.user_id)
        pct = (ch.equity - ch.starting_balance) / ch.starting_balance * 100.0
        
        # Construire le nom d'affichage
        if user.first_name or user.last_name:
            display_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        else:
            display_name = f"User #{user.id}"
        
        data.append({
            "user_id": ch.user_id,
            "user_name": display_name,
            "user_email": user.email,
            "challenge_id": ch.id,
            "status": ch.status,
            "equity": ch.equity,
            "pct": pct
        })

    data.sort(key=lambda x: x["pct"], reverse=True)
    return jsonify(data[:10])
