"""Check users in database"""
from app import create_app, db
from models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"\n=== {len(users)} utilisateurs dans la base ===\n")
    for u in users:
        print(f"Email: {u.email}")
        print(f"Nom: {u.first_name} {u.last_name}")
        print(f"Devise: {u.currency}")
        print(f"Role: {u.role}")
        print(f"Created: {u.created_at}")
        print("-" * 50)
