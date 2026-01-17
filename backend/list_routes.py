"""List all registered routes"""
from app import create_app

app = create_app()
print("\n=== Routes enregistrées ===\n")
for rule in app.url_map.iter_rules():
    methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
    print(f"{methods:10} {rule.rule}")
