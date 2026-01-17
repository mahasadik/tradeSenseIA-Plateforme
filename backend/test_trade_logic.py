"""
Test de la logique de trading
"""

print("=== SCÉNARIO 1: Achat puis vente avec profit ===")
initial_equity = 5000.0
entry_price = 150.0
qty = 10
exit_price = 155.0

print(f"Equity initiale: ${initial_equity}")
print(f"\n1. OUVERTURE position BUY")
print(f"   Prix d'entrée: ${entry_price}")
print(f"   Quantité: {qty}")

total_cost = entry_price * qty
equity_after_open = initial_equity - total_cost

print(f"   Coût total: ${total_cost}")
print(f"   Equity après ouverture: ${equity_after_open}")

print(f"\n2. FERMETURE position")
print(f"   Prix de sortie: ${exit_price}")

pnl = (exit_price - entry_price) * qty
exit_value = exit_price * qty
equity_after_close = equity_after_open + exit_value

print(f"   P&L: ${pnl}")
print(f"   Valeur de sortie: ${exit_value}")
print(f"   Equity après fermeture: ${equity_after_close}")
print(f"   Profit total: ${equity_after_close - initial_equity}")

print("\n" + "="*50)
print("\n=== SCÉNARIO 2: Achat puis vente avec perte ===")
initial_equity = 5000.0
entry_price = 150.0
qty = 10
exit_price = 145.0

print(f"Equity initiale: ${initial_equity}")
print(f"\n1. OUVERTURE position BUY")
print(f"   Prix d'entrée: ${entry_price}")
print(f"   Quantité: {qty}")

total_cost = entry_price * qty
equity_after_open = initial_equity - total_cost

print(f"   Coût total: ${total_cost}")
print(f"   Equity après ouverture: ${equity_after_open}")

print(f"\n2. FERMETURE position")
print(f"   Prix de sortie: ${exit_price}")

pnl = (exit_price - entry_price) * qty
exit_value = exit_price * qty
equity_after_close = equity_after_open + exit_value

print(f"   P&L: ${pnl}")
print(f"   Valeur de sortie: ${exit_value}")
print(f"   Equity après fermeture: ${equity_after_close}")
print(f"   Perte totale: ${equity_after_close - initial_equity}")

print("\n" + "="*50)
print("\n=== SCÉNARIO 3: Vente à découvert puis rachat avec profit ===")
initial_equity = 5000.0
entry_price = 150.0
qty = 10
exit_price = 145.0

print(f"Equity initiale: ${initial_equity}")
print(f"\n1. OUVERTURE position SELL (short)")
print(f"   Prix d'entrée: ${entry_price}")
print(f"   Quantité: {qty}")

total_cost = entry_price * qty
equity_after_open = initial_equity - total_cost

print(f"   Marge bloquée: ${total_cost}")
print(f"   Equity après ouverture: ${equity_after_open}")

print(f"\n2. FERMETURE position")
print(f"   Prix de sortie (rachat): ${exit_price}")

pnl = (entry_price - exit_price) * qty  # inversé pour SELL
exit_value = (entry_price * qty) + pnl  # marge + P&L
equity_after_close = equity_after_open + exit_value

print(f"   P&L: ${pnl}")
print(f"   Valeur de sortie: ${exit_value}")
print(f"   Equity après fermeture: ${equity_after_close}")
print(f"   Profit total: ${equity_after_close - initial_equity}")
