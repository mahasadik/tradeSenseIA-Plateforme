from datetime import date
from models import db, UserChallenge

DAILY_LOSS_LIMIT = 0.05
TOTAL_LOSS_LIMIT = 0.10
PROFIT_TARGET = 0.10

def evaluate_challenge(challenge_id: int):
    ch = UserChallenge.query.get(challenge_id)
    if not ch or ch.status != "active":
        return ch

    today = date.today()
    if ch.day_start_date != today:
        ch.day_start_date = today
        ch.day_start_equity = ch.equity
        db.session.commit()

    if ch.equity <= ch.day_start_equity * (1 - DAILY_LOSS_LIMIT):
        ch.status = "failed"
    elif ch.equity <= ch.starting_balance * (1 - TOTAL_LOSS_LIMIT):
        ch.status = "failed"
    elif ch.equity >= ch.starting_balance * (1 + PROFIT_TARGET):
        ch.status = "passed"

    db.session.commit()
    return ch
