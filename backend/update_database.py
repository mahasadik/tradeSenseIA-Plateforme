"""
Script pour modifier les données dans la base de données
"""
from app import create_app
from models import db, User, Plan, UserChallenge, Trade

def update_user_name(email, first_name, last_name):
    """Mettre à jour le nom d'un utilisateur"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            user.first_name = first_name
            user.last_name = last_name
            db.session.commit()
            print(f"✓ Utilisateur {email} mis à jour : {first_name} {last_name}")
        else:
            print(f"✗ Utilisateur {email} non trouvé")

def update_user_email(old_email, new_email):
    """Changer l'email d'un utilisateur"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=old_email).first()
        if user:
            user.email = new_email
            db.session.commit()
            print(f"✓ Email mis à jour : {old_email} → {new_email}")
        else:
            print(f"✗ Utilisateur {old_email} non trouvé")

def delete_user(email):
    """Supprimer un utilisateur"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            # Supprimer d'abord les challenges et trades associés
            challenges = UserChallenge.query.filter_by(user_id=user.id).all()
            for ch in challenges:
                Trade.query.filter_by(challenge_id=ch.id).delete()
                db.session.delete(ch)
            
            db.session.delete(user)
            db.session.commit()
            print(f"✓ Utilisateur {email} supprimé avec tous ses challenges et trades")
        else:
            print(f"✗ Utilisateur {email} non trouvé")

def update_challenge_status(challenge_id, new_status):
    """Modifier le status d'un challenge (active/failed/passed)"""
    app = create_app()
    with app.app_context():
        ch = UserChallenge.query.get(challenge_id)
        if ch:
            ch.status = new_status
            db.session.commit()
            print(f"✓ Challenge {challenge_id} : status → {new_status}")
        else:
            print(f"✗ Challenge {challenge_id} non trouvé")

def update_challenge_equity(challenge_id, new_equity):
    """Modifier l'equity d'un challenge"""
    app = create_app()
    with app.app_context():
        ch = UserChallenge.query.get(challenge_id)
        if ch:
            ch.equity = new_equity
            db.session.commit()
            print(f"✓ Challenge {challenge_id} : equity → {new_equity}")
        else:
            print(f"✗ Challenge {challenge_id} non trouvé")

def close_trade(trade_id, exit_price, pnl):
    """Fermer manuellement un trade"""
    app = create_app()
    with app.app_context():
        trade = Trade.query.get(trade_id)
        if trade:
            from datetime import datetime
            trade.exit_price = exit_price
            trade.pnl = pnl
            trade.status = "CLOSED"
            trade.closed_at = datetime.utcnow()
            
            # Mettre à jour l'equity du challenge
            ch = UserChallenge.query.get(trade.challenge_id)
            if ch:
                ch.equity += pnl
            
            db.session.commit()
            print(f"✓ Trade {trade_id} fermé : PnL = {pnl}")
        else:
            print(f"✗ Trade {trade_id} non trouvé")

def list_all_users():
    """Lister tous les utilisateurs"""
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print("\n📋 LISTE DES UTILISATEURS:")
        print("-" * 70)
        for u in users:
            print(f"ID: {u.id} | Email: {u.email}")
            print(f"   Nom: {u.first_name or 'N/A'} {u.last_name or 'N/A'}")
            print(f"   Rôle: {u.role}")
            print()

# ========== EXEMPLES D'UTILISATION ==========

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🔧 SCRIPT DE MODIFICATION DE BASE DE DONNÉES")
    print("="*70)
    
    # Décommentez les lignes que vous voulez exécuter :
    
    # 1. Lister tous les utilisateurs
    list_all_users()
    
    # 2. Mettre à jour le nom d'un utilisateur
    # update_user_name("ahmed@gmail.com", "Ahmed", "Benali")
    
    # 3. Changer l'email d'un utilisateur
    # update_user_email("old@example.com", "new@example.com")
    
    # 4. Modifier le status d'un challenge
    # update_challenge_status(1, "passed")
    
    # 5. Modifier l'equity d'un challenge
    # update_challenge_equity(1, 15000.0)
    
    # 6. Fermer un trade manuellement
    # close_trade(1, 150.5, 250.0)
    
    # 7. Supprimer un utilisateur
    # delete_user("user@example.com")
    
    print("="*70 + "\n")
