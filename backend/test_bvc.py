"""Test script pour vérifier la récupération des données BVC"""
from services.bvc import get_bvc_price, get_bvc_symbols

print("=" * 60)
print("TEST DE RÉCUPÉRATION DES DONNÉES BVC")
print("=" * 60)

# Afficher les symboles disponibles
symbols = get_bvc_symbols()
print(f"\nSymboles BVC disponibles: {', '.join(symbols)}")
print(f"Nombre total: {len(symbols)}")

# Tester quelques symboles
test_symbols = ['IAM', 'ATW', 'BCP']

print("\n" + "=" * 60)
print("TESTS DE PRIX")
print("=" * 60)

for symbol in test_symbols:
    print(f"\nTest pour {symbol}...")
    try:
        price = get_bvc_price(symbol)
        print(f"✅ {symbol}: {price} MAD")
    except Exception as e:
        print(f"❌ {symbol}: Erreur - {str(e)[:100]}")

print("\n" + "=" * 60)
print("FIN DES TESTS")
print("=" * 60)
