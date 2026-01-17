from app import create_app
from models import db, User, UserChallenge, Plan
import sys

app = create_app()

with app.app_context():
    # Trouver l'utilisateur admin
    admin = User.query.filter_by(email="admin@example.com").first()
    if not admin:
        print("Admin user not found!")
        sys.exit(1)
    
    # Trouver le plan Starter
    plan = Plan.query.filter_by(name="Starter").first()
    if not plan:
        print("Starter plan not found!")
        sys.exit(1)
    
    # Créer un challenge pour admin
    challenge = UserChallenge(
        user_id=admin.id,
        plan_id=plan.id,
        starting_balance=plan.starting_balance,
        equity=plan.starting_balance,
        day_start_equity=plan.starting_balance
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    print(f"\n✅ Challenge créé pour admin@example.com!")
    print(f"   Challenge ID: {challenge.id}")
    print(f"   Plan: {plan.name}")
    print(f"   Solde de départ: {challenge.starting_balance}")
    print(f"   Equity: {challenge.equity}")
    print()
