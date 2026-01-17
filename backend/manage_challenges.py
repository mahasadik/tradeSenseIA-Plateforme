"""
Script pour gérer les challenges d'un utilisateur
"""
from app import create_app
from models import db, User, Plan, UserChallenge

def create_new_challenge(email, plan_id):
    """Créer un nouveau challenge pour un utilisateur"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"✗ Utilisateur {email} non trouvé")
            return
        
        plan = Plan.query.get(plan_id)
        if not plan:
            print(f"✗ Plan {plan_id} non trouvé")
            return
        
        ch = UserChallenge(
            user_id=user.id,
            plan_id=plan.id,
            starting_balance=plan.starting_balance,
            equity=plan.starting_balance,
            day_start_equity=plan.starting_balance,
            status="active"
        )
        db.session.add(ch)
        db.session.commit()
        
        print(f"✓ Nouveau challenge créé pour {email}")
        print(f"  Challenge ID: {ch.id}")
        print(f"  Plan: {plan.name} ({plan.price_dh} DH)")
        print(f"  Balance: {plan.starting_balance} DH")

def change_challenge_status(challenge_id, new_status):
    """Modifier le status d'un challenge (active/failed/passed)"""
    app = create_app()
    with app.app_context():
        ch = UserChallenge.query.get(challenge_id)
        if not ch:
            print(f"✗ Challenge {challenge_id} non trouvé")
            return
        
        old_status = ch.status
        ch.status = new_status
        db.session.commit()
        
        print(f"✓ Challenge {challenge_id} : {old_status} → {new_status}")

def reset_challenge(challenge_id):
    """Réinitialiser un challenge (remettre equity à la balance de départ)"""
    app = create_app()
    with app.app_context():
        ch = UserChallenge.query.get(challenge_id)
        if not ch:
            print(f"✗ Challenge {challenge_id} non trouvé")
            return
        
        ch.equity = ch.starting_balance
        ch.day_start_equity = ch.starting_balance
        ch.status = "active"
        db.session.commit()
        
        print(f"✓ Challenge {challenge_id} réinitialisé")
        print(f"  Equity remise à: {ch.starting_balance} DH")

def modify_challenge_equity(challenge_id, new_equity):
    """Modifier l'equity d'un challenge"""
    app = create_app()
    with app.app_context():
        ch = UserChallenge.query.get(challenge_id)
        if not ch:
            print(f"✗ Challenge {challenge_id} non trouvé")
            return
        
        old_equity = ch.equity
        ch.equity = new_equity
        db.session.commit()
        
        print(f"✓ Challenge {challenge_id} : equity {old_equity} DH → {new_equity} DH")

def delete_challenge(challenge_id):
    """Supprimer un challenge"""
    app = create_app()
    with app.app_context():
        from models import Trade
        
        ch = UserChallenge.query.get(challenge_id)
        if not ch:
            print(f"✗ Challenge {challenge_id} non trouvé")
            return
        
        # Supprimer les trades associés
        Trade.query.filter_by(challenge_id=challenge_id).delete()
        
        db.session.delete(ch)
        db.session.commit()
        
        print(f"✓ Challenge {challenge_id} supprimé (avec tous ses trades)")

def list_user_challenges(email):
    """Lister tous les challenges d'un utilisateur"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"✗ Utilisateur {email} non trouvé")
            return
        
        challenges = UserChallenge.query.filter_by(user_id=user.id).all()
        
        print(f"\n{'='*70}")
        print(f"📋 CHALLENGES DE {email}")
        print(f"{'='*70}")
        
        if not challenges:
            print("❌ Aucun challenge")
        else:
            for ch in challenges:
                plan = Plan.query.get(ch.plan_id)
                print(f"\n🎯 Challenge #{ch.id}")
                print(f"   Plan: {plan.name if plan else 'N/A'} ({plan.price_dh if plan else 0} DH)")
                print(f"   Status: {ch.status}")
                print(f"   Balance départ: {ch.starting_balance} DH")
                print(f"   Equity actuelle: {ch.equity} DH")
                profit = ch.equity - ch.starting_balance
                print(f"   Profit/Perte: {profit:+.2f} DH ({(profit/ch.starting_balance*100):+.2f}%)")
                print(f"   Créé: {ch.created_at}")
        
        print(f"{'='*70}\n")

if __name__ == "__main__":
    # Exemples d'utilisation - Décommentez ce que vous voulez faire :
    
    # 1. Lister vos challenges
     list_user_challenges("ahmed@gmail.com")
    
    # 2. Créer un nouveau challenge avec un autre plan
    # Plans disponibles: 1=Starter (5000 DH), 2=Pro (10000 DH), 3=Elite (20000 DH)
    # create_new_challenge("ahmed@gmail.com", plan_id=2)  # Plan Pro
    
    # 3. Modifier le status d'un challenge
    # change_challenge_status(3, "passed")  # active/failed/passed
    
    # 4. Réinitialiser un challenge
    # reset_challenge(3)
    
    # 5. Modifier l'equity manuellement
    # modify_challenge_equity(3, 7500.0)
    
    # 6. Supprimer un challenge
    # delete_challenge(3)