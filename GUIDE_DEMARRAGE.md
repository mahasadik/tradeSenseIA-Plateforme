#  Guide de Démarrage Rapide - Nouvelles Fonctionnalités

## Installation des Dépendances

### Backend

```bash
cd backend
pip install paypalrestsdk==1.13.1
```

Ou réinstaller toutes les dépendances:
```bash
pip install -r requirements.txt
```

---

## Configuration Initiale

### 1. Créer un Compte SUPERADMIN

Connectez-vous à votre base de données et exécutez:

```sql
-- Vérifier les utilisateurs existants
SELECT id, email, role FROM user;

-- Promouvoir un utilisateur en SUPERADMIN
UPDATE user SET role = 'superadmin' WHERE email = 'votre@email.com';
```

Ou créer un nouveau SUPERADMIN:
```sql
-- Depuis le backend Python
python -c "
from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    admin = User(
        email='admin@tanstrad.com',
        password_hash=generate_password_hash('Admin123!'),
        first_name='Super',
        last_name='Admin',
        role='superadmin'
    )
    db.session.add(admin)
    db.session.commit()
    print('✅ SUPERADMIN créé: admin@tanstrad.com / Admin123!')
"
```

### 2. Configurer PayPal (Optionnel)

1. Allez sur https://developer.paypal.com
2. Créez un compte développeur (gratuit)
3. Créez une application dans "My Apps & Credentials"
4. Copiez:
   - **Client ID** (commence par "A...")
   - **Client Secret** (secret, ne pas partager)

5. Connectez-vous sur http://localhost:5173/login avec le compte SUPERADMIN

6. Allez sur http://localhost:5173/superadmin

7. Remplissez le formulaire:
   - Mode: **Sandbox** (pour tests)
   - Client ID: collez votre Client ID
   - Client Secret: collez votre Client Secret

8. Cliquez sur "Sauvegarder la configuration"

✅ PayPal est maintenant actif !

---

## Tester les Nouvelles Fonctionnalités

### Test 1: BVC (Bourse de Casablanca)

**Option A - Via Python:**
```bash
cd backend
python
```

```python
from services.bvc import get_bvc_price, get_bvc_symbols

# Lister les symboles disponibles
print(get_bvc_symbols())
# ['IAM', 'ATW', 'BCP', 'GAZ', 'CIH', 'CDM', 'LBL', 'MNG', 'SNI', 'TQM']

# Récupérer le prix de Maroc Telecom
price = get_bvc_price('IAM')
print(f"Prix IAM: {price} MAD")
```

**Option B - Via API:**
```bash
# Démarrer le serveur
cd backend
python app.py

# Dans un autre terminal:
curl http://localhost:5000/api/prices/bvc?symbol=IAM
curl http://localhost:5000/api/prices/bvc/symbols
```

### Test 2: PayPal (Paiement Réel)

1. Assurez-vous que PayPal est configuré (voir ci-dessus)

2. Allez sur http://localhost:5173/pricing

3. Sélectionnez un plan (ex: Starter)

4. Sur la page checkout, sélectionnez **PayPal**

5. Cliquez sur "Payer"

6. Vous êtes redirigé vers PayPal Sandbox

7. Connectez-vous avec un compte test PayPal:
   - Email: sb-buyer@business.example.com (créé automatiquement)
   - Mot de passe: voir dans PayPal Developer

8. Approuvez le paiement

9. Vous revenez sur le site avec le challenge activé!

### Test 3: Leaderboard avec Noms Réels

1. Ajouter des noms aux utilisateurs:
```sql
UPDATE user SET first_name = 'Mohammed', last_name = 'Alami' WHERE id = 1;
UPDATE user SET first_name = 'Fatima', last_name = 'Zahra' WHERE id = 2;
UPDATE user SET first_name = 'Youssef', last_name = 'Benjelloun' WHERE id = 3;
```

2. Créer quelques challenges et trades pour ces utilisateurs

3. Visiter http://localhost:5173/leaderboard

4. Les noms réels s'affichent au lieu de "User #1" !

---

## Vérification de l'Installation

### Checklist Backend:

```bash
cd backend

# Vérifier que PayPal est installé
python -c "import paypalrestsdk; print('✅ PayPal SDK installé')"

# Vérifier que BVC fonctionne
python -c "from services.bvc import get_bvc_symbols; print('✅ BVC:', get_bvc_symbols())"

# Vérifier les routes
python -c "
from app import create_app
app = create_app()
routes = [str(r) for r in app.url_map.iter_rules() if 'paypal' in str(r) or 'bvc' in str(r) or 'settings' in str(r)]
print('✅ Routes disponibles:')
for r in routes:
    print('  ', r)
"
```

Résultat attendu:
```
✅ PayPal SDK installé
✅ BVC: ['IAM', 'ATW', 'BCP', 'GAZ', 'CIH', 'CDM', 'LBL', 'MNG', 'SNI', 'TQM']
✅ Routes disponibles:
   /api/paypal/create-order
   /api/paypal/capture-order
   /api/paypal/payment/<payment_id>
   /api/settings
   /api/settings/paypal/configure
   /api/settings/paypal/status
   /api/prices/bvc
   /api/prices/bvc/symbols
```

### Checklist Frontend:

```bash
cd frontend

# Vérifier que la page SuperAdmin existe
ls src/pages/SuperAdmin.tsx

# Vérifier que les routes sont configurées
grep -i "superadmin" src/App.tsx
```

---

## Résolution de Problèmes

### Erreur: "PayPal not configured"

✅ Solution: Configurez PayPal via la page SUPERADMIN (/superadmin)

### Erreur: "BVC scraping failed"

✅ Causes possibles:
- Site BVC inaccessible (vérifier votre connexion internet)
- Structure HTML du site changée
- Symbole invalide

✅ Solution temporaire: Les prix mock fonctionnent toujours pour Yahoo Finance

### Erreur: "Unauthorized - SUPERADMIN access required"

✅ Solution: Promouvoir votre utilisateur:
```sql
UPDATE user SET role = 'superadmin' WHERE email = 'votre@email.com';
```

### Erreur: "ModuleNotFoundError: No module named 'paypalrestsdk'"

✅ Solution:
```bash
cd backend
pip install paypalrestsdk==1.13.1
```

---

## Commandes Utiles

### Démarrer le Projet

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Accéder aux Pages

- Homepage: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard
- Pricing: http://localhost:5173/pricing
- Leaderboard: http://localhost:5173/leaderboard
- **SUPERADMIN: http://localhost:5173/superadmin** ⭐

### Créer des Données de Test

```sql
-- Créer des utilisateurs avec noms
INSERT INTO user (email, password_hash, first_name, last_name, role) VALUES
('trader1@test.com', 'hash123', 'Ahmed', 'Bennani', 'user'),
('trader2@test.com', 'hash456', 'Sara', 'El Idrissi', 'user'),
('trader3@test.com', 'hash789', 'Omar', 'Tazi', 'user');

-- Créer des challenges
INSERT INTO user_challenge (user_id, plan_id, status, starting_balance, equity, day_start_equity) VALUES
(1, 1, 'active', 5000, 5500, 5500),
(2, 2, 'active', 10000, 12000, 12000),
(3, 1, 'active', 5000, 4800, 4800);

-- Vérifier
SELECT 
    u.first_name, 
    u.last_name, 
    uc.equity,
    ROUND((uc.equity - uc.starting_balance) / uc.starting_balance * 100, 2) as profit_pct
FROM user u
JOIN user_challenge uc ON u.id = uc.user_id
ORDER BY profit_pct DESC;
```

---

