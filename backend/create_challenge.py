"""
Script pour créer un challenge pour un utilisateur spécifique
"""
from app import create_app
from models import db, User, Plan, UserChallenge

def create_challenge_for_user(email, plan_id=1):
    """Créer un challenge pour un utilisateur"""
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
        
        # Créer le challenge
        ch = UserChallenge(
            user_id=user.id,
            plan_id=plan.id,
            starting_balance=plan.starting_balance,
            equity=plan.starting_balance,
            day_start_equity=plan.starting_balance
        )
        db.session.add(ch)
        db.session.commit()
        
        print(f"✓ Challenge créé pour {email}")
        print(f"  Plan: {plan.name}")
        print(f"  Balance de départ: {plan.starting_balance} DH")
        print(f"  Challenge ID: {ch.id}")

def list_users_with_challenges():
    """Lister tous les utilisateurs et leurs challenges"""
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print("\n" + "="*70)
        print("📋 UTILISATEURS ET LEURS CHALLENGES")
        print("="*70)
        
        for user in users:
            challenges = UserChallenge.query.filter_by(user_id=user.id).all()
            print(f"\n👤 {user.email} (ID: {user.id})")
            print(f"   Nom: {user.first_name or 'N/A'} {user.last_name or 'N/A'}")
            if challenges:
                print(f"   🎯 Challenges: {len(challenges)}")
                for ch in challenges:
                    plan = Plan.query.get(ch.plan_id)
                    print(f"      - Challenge #{ch.id}: {plan.name if plan else 'N/A'} - Status: {ch.status} - Equity: {ch.equity}")
            else:
                print("   ❌ Aucun challenge")
        print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    # Lister tous les utilisateurs et leurs challenges
    list_users_with_challenges()
    
    # Créer un challenge pour ahmed@gmail.com
    create_challenge_for_user("ahmed@gmail.com", plan_id=1)  # Plan Starter
