"""Generate JWT token for testing"""
from app import create_app
from flask_jwt_extended import create_access_token

app = create_app()
with app.app_context():
    # Token for alice (user_id = 1)
    token = create_access_token(identity="1", additional_claims={"role": "user"})
    print("\n=== Token for alice@example.com ===")
    print(token)
    print("\n=== Pour tester dans le terminal ===")
    print(f'curl -H "Authorization: Bearer {token}" http://127.0.0.1:5000/api/challenges')
