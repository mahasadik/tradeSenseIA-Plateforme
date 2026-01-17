from app import create_app
from models import db, UserChallenge

app = create_app()

with app.app_context():
    # Trouver le challenge de l'admin
    challenge = UserChallenge.query.filter_by(user_id=3).first()
    
    if challenge:
        print(f"\n=== Challenge trouvé ===")
        print(f"ID: {challenge.id}")
        print(f"Status actuel: {challenge.status}")
        print(f"Equity: {challenge.equity}")
        print(f"Starting balance: {challenge.starting_balance}")
        
        # Réactiver le challenge
        challenge.status = "active"
        challenge.equity = challenge.starting_balance  # Réinitialiser le solde
        challenge.day_start_equity = challenge.starting_balance
        
        db.session.commit()
        
        print(f"\n✅ Challenge réactivé!")
        print(f"Nouveau status: {challenge.status}")
        print(f"Nouveau equity: {challenge.equity}")
    else:
        print("Challenge non trouvé pour l'admin")
