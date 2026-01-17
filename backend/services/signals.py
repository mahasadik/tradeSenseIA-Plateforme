import yfinance as yf

def sma(values, n):
    if len(values) < n:
        return None
    return sum(values[-n:]) / n

def sma_crossover_signal(ticker: str, fast=5, slow=20):
    t = yf.Ticker(ticker)
    hist = t.history(period="5d", interval="15m")  # assez de points
    if hist is None or hist.empty:
        raise ValueError("No history data for signal")

    closes = [float(x) for x in hist["Close"].tolist()]
    last_price = closes[-1]

    fast_sma = sma(closes, fast)
    slow_sma = sma(closes, slow)
    if fast_sma is None or slow_sma is None:
        raise ValueError("Not enough data to compute SMA")

    # signal simple
    if fast_sma > slow_sma:
        signal = "BUY"
    elif fast_sma < slow_sma:
        signal = "SELL"
    else:
        signal = "NEUTRAL"

    # exemple stop loss / take profit “basique”
    stop_loss = last_price * 0.99
    take_profit = last_price * 1.02

    return {
        "symbol": ticker,
        "last_price": last_price,
        "fast_sma": fast_sma,
        "slow_sma": slow_sma,
        "signal": signal,
        "suggested_stop_loss": stop_loss,
        "suggested_take_profit": take_profit
    }
