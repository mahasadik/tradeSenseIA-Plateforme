"""
Script pour créer un utilisateur SUPERADMIN
Usage: python create_superadmin.py
"""

from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash
import sys

def create_superadmin():
    app = create_app()
    
    with app.app_context():
        # Paramètres du SUPERADMIN
        email = input("Email du SUPERADMIN (default: admin@tanstrad.com): ").strip() or "admin@tanstrad.com"
        
        # Vérifier si l'utilisateur existe déjà
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            print(f"\n⚠️  L'utilisateur {email} existe déjà!")
            promote = input("Voulez-vous le promouvoir en SUPERADMIN? (o/n): ").strip().lower()
            
            if promote == 'o' or promote == 'y':
                existing_user.role = "superadmin"
                db.session.commit()
                print(f"✅ {email} est maintenant SUPERADMIN!")
            else:
                print("❌ Opération annulée")
            return
        
        # Créer un nouveau SUPERADMIN
        password = input("Mot de passe (default: Admin123!): ").strip() or "Admin123!"
        first_name = input("Prénom (default: Super): ").strip() or "Super"
        last_name = input("Nom (default: Admin): ").strip() or "Admin"
        
        admin = User(
            email=email,
            password_hash=generate_password_hash(password),
            first_name=first_name,
            last_name=last_name,
            role="superadmin"
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ SUPERADMIN créé avec succès!")
        print("="*60)
        print(f"Email:      {email}")
        print(f"Mot de passe: {password}")
        print(f"Nom:        {first_name} {last_name}")
        print(f"Rôle:       SUPERADMIN")
        print("="*60)
        print("\nVous pouvez maintenant:")
        print("1. Vous connecter sur http://localhost:5173/login")
        print("2. Accéder à la page SUPERADMIN: http://localhost:5173/superadmin")
        print("3. Configurer PayPal et autres paramètres système")
        print("="*60)

if __name__ == "__main__":
    try:
        create_superadmin()
    except KeyboardInterrupt:
        print("\n\n❌ Opération annulée par l'utilisateur")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        sys.exit(1)
