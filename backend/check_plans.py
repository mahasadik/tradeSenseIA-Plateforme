from app import create_app
from models import Plan

app = create_app()

with app.app_context():
    plans = Plan.query.all()
    print(f"\n=== {len(plans)} plans dans la base ===\n")
    
    for plan in plans:
        print(f"ID: {plan.id}")
        print(f"Nom: {plan.name}")
        print(f"Prix: {plan.price_dh} DH")
        print(f"Solde de départ: {plan.starting_balance}")
        print("-" * 50)
