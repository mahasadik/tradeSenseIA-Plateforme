"""
Script pour visualiser le contenu de la base de données
"""
from app import create_app
from models import db, User, Plan, UserChallenge, Trade

def view_database():
    app = create_app()
    with app.app_context():
        print("\n" + "="*60)
        print("📊 CONTENU DE LA BASE DE DONNÉES")
        print("="*60)
        
        # Users
        users = User.query.all()
        print(f"\n👤 USERS ({len(users)}):")
        print("-" * 60)
        for u in users:
            print(f"ID: {u.id} | Email: {u.email}")
            print(f"   Nom: {u.first_name or 'N/A'} {u.last_name or 'N/A'}")
            print(f"   Rôle: {u.role} | Créé: {u.created_at}")
            print()
        
        # Plans
        plans = Plan.query.all()
        print(f"\n💰 PLANS ({len(plans)}):")
        print("-" * 60)
        for p in plans:
            print(f"ID: {p.id} | {p.name} - {p.price_dh} DH")
            print(f"   Balance départ: {p.starting_balance}")
            print()
        
        # Challenges
        challenges = UserChallenge.query.all()
        print(f"\n🎯 CHALLENGES ({len(challenges)}):")
        print("-" * 60)
        for ch in challenges:
            user = User.query.get(ch.user_id)
            plan = Plan.query.get(ch.plan_id)
            print(f"ID: {ch.id} | User: {user.email if user else 'N/A'}")
            print(f"   Plan: {plan.name if plan else 'N/A'}")
            print(f"   Status: {ch.status} | Equity: {ch.equity}")
            print(f"   Créé: {ch.created_at}")
            print()
        
        # Trades
        trades = Trade.query.all()
        print(f"\n📈 TRADES ({len(trades)}):")
        print("-" * 60)
        for t in trades:
            print(f"ID: {t.id} | Challenge: {t.challenge_id}")
            print(f"   {t.symbol} - {t.side} x{t.qty}")
            print(f"   Entry: {t.entry_price} | Exit: {t.exit_price or 'N/A'}")
            print(f"   PnL: {t.pnl or 'N/A'} | Status: {t.status}")
            print(f"   Ouvert: {t.opened_at}")
            print()
        
        print("="*60 + "\n")

if __name__ == "__main__":
    view_database()
