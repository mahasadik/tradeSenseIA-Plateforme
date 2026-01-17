from app import create_app
from models import db, User, Plan, UserChallenge, Trade
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # create a few users
    if User.query.count() == 0:
        users = [
            User(email="alice@example.com", password_hash=generate_password_hash("password1"), currency="MAD"),
            User(email="bob@example.com", password_hash=generate_password_hash("password2"), currency="MAD"),
            User(email="superadmin@example.com", password_hash=generate_password_hash("superadminpass"), role="superadmin", currency="MAD"),
            User(email="admin@example.com", password_hash=generate_password_hash("adminpass"), role="admin", currency="MAD"),
        ]
        db.session.add_all(users)
        db.session.commit()
        print("Users seeded")
    else:
        print("Users already exist")

    # ensure plans exist
    plans = Plan.query.all()
    if not plans:
        print("No plans found; run seed.py first")
    else:
        # create challenges for first two users
        u1 = User.query.filter_by(email="alice@example.com").first()
        u2 = User.query.filter_by(email="bob@example.com").first()
        plan = Plan.query.filter_by(name="Starter").first() or plans[0]

        if UserChallenge.query.count() == 0:
            c1 = UserChallenge(user_id=u1.id, plan_id=plan.id, starting_balance=plan.starting_balance, equity=plan.starting_balance, day_start_equity=plan.starting_balance)
            c2 = UserChallenge(user_id=u2.id, plan_id=plan.id, starting_balance=plan.starting_balance, equity=plan.starting_balance, day_start_equity=plan.starting_balance)
            db.session.add_all([c1, c2])
            db.session.commit()
            print("Challenges seeded")
        else:
            print("Challenges already exist")

        # create a couple of trades for challenge 1
        challenge = UserChallenge.query.first()
        if challenge and Trade.query.count() == 0:
            t1 = Trade(challenge_id=challenge.id, symbol="AAPL", market="YAHOO", side="BUY", qty=1, entry_price=150.0, status="CLOSED", exit_price=155.0, pnl=5.0)
            t2 = Trade(challenge_id=challenge.id, symbol="TSLA", market="YAHOO", side="SELL", qty=2, entry_price=700.0, status="OPEN")
            db.session.add_all([t1, t2])
            db.session.commit()
            print("Trades seeded")
        else:
            print("Trades already exist or no challenge")

