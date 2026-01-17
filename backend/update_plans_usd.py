from app import create_app
from models import db, Plan, UserChallenge

app = create_app()
with app.app_context():
    # Mettre à jour les plans pour qu'ils soient en USD
    plans = Plan.query.all()
    for plan in plans:
        if plan.name == "Starter":
            plan.starting_balance = 500.0
        elif plan.name == "Pro":
            plan.starting_balance = 1000.0
        elif plan.name == "Elite":
            plan.starting_balance = 2000.0
        print(f"Plan {plan.name}: {plan.starting_balance} USD (affiché comme {plan.starting_balance * 10} MAD)")
    
    # Mettre à jour les challenges existants
    challenges = UserChallenge.query.all()
    for ch in challenges:
        # Convertir les montants MAD actuels en USD (diviser par 10)
        ch.starting_balance = ch.starting_balance / 10.0
        ch.equity = ch.equity / 10.0
        ch.day_start_equity = ch.day_start_equity / 10.0
        print(f"Challenge {ch.id}: equity={ch.equity} USD, starting={ch.starting_balance} USD")
    
    db.session.commit()
    print("\n✅ Tous les montants convertis de MAD vers USD dans la base de données")
    print("Ils seront affichés en MAD (×10) dans l'interface")
