from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(180), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    currency = db.Column(db.String(10), default="MAD")  # MAD, USD, EUR, GBP
    role = db.Column(db.String(30), default="user")  # user | superadmin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    price_dh = db.Column(db.Integer, nullable=False)
    starting_balance = db.Column(db.Float, nullable=False, default=5000.0)

class UserChallenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("plan.id"), nullable=False)

    status = db.Column(db.String(20), default="active")  # active|failed|passed
    starting_balance = db.Column(db.Float, nullable=False)
    equity = db.Column(db.Float, nullable=False)

    day_start_equity = db.Column(db.Float, nullable=False)
    day_start_date = db.Column(db.Date, default=date.today, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey("user_challenge.id"), nullable=False)
    symbol = db.Column(db.String(30), nullable=False)
    market = db.Column(db.String(20), nullable=False)  # YAHOO|BVC
    side = db.Column(db.String(10), nullable=False)    # BUY|SELL
    qty = db.Column(db.Float, nullable=False)

    entry_price = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float, nullable=True)
    pnl = db.Column(db.Float, nullable=True)

    status = db.Column(db.String(10), default="OPEN")   # OPEN|CLOSED
    opened_at = db.Column(db.DateTime, default=datetime.utcnow)
    closed_at = db.Column(db.DateTime, nullable=True)

class Setting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=False)
