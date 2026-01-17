"""Check challenges in database"""
from app import create_app, db
from models import User, Plan, UserChallenge

app = create_app()
with app.app_context():
    challenges = UserChallenge.query.all()
    print(f"\n=== {len(challenges)} challenges dans la base ===\n")
    for ch in challenges:
        user = User.query.get(ch.user_id)
        plan = Plan.query.get(ch.plan_id)
        print(f"Challenge ID: {ch.id}")
        print(f"User: {user.email if user else 'N/A'} (ID: {ch.user_id})")
        print(f"Plan: {plan.name if plan else 'N/A'} (ID: {ch.plan_id})")
        print(f"Status: {ch.status}")
        print(f"Starting Balance: {ch.starting_balance}")
        print(f"Equity: {ch.equity}")
        print("-" * 50)
