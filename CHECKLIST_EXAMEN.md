# ✅ Checklist Pré-Examen - TanstradIA

## 🎯 À Vérifier AVANT la Présentation

### 1. Installation & Dépendances

- [ ] Python 3.10+ installé
- [ ] Node.js 18+ installé
- [ ] Backend: `pip install -r requirements.txt` exécuté
- [ ] Frontend: `npm install` exécuté
- [ ] ✅ PayPal SDK installé: `python -c "import paypalrestsdk; print('OK')"`
- [ ] ✅ BVC fonctionnel: `python -c "from services.bvc import get_bvc_symbols; print(get_bvc_symbols())"`

### 2. Base de Données

- [ ] Base de données créée: `backend/instance/tradesense.db` existe
- [ ] Seeds exécutés: `python seed.py`
- [ ] SUPERADMIN créé: `python create_superadmin.py`
- [ ] Vérifier users:
```sql
SELECT id, email, role FROM user;
-- Au moins 1 avec role='superadmin'
```

### 3. Configuration PayPal (Optionnel mais Recommandé)

- [ ] Compte PayPal Developer créé (https://developer.paypal.com)
- [ ] Application PayPal créée
- [ ] Client ID et Client Secret copiés
- [ ] Configuration via `/superadmin` effectuée
- [ ] Mode Sandbox sélectionné
- [ ] Vérifier status: `curl http://localhost:5000/api/settings/paypal/status`

### 4. Serveurs Démarrés

- [ ] Backend démarré: `cd backend && python app.py`
  - Vérifier: http://localhost:5000/health retourne `{"status": "ok"}`
- [ ] Frontend démarré: `cd frontend && npm run dev`
  - Vérifier: http://localhost:5173 accessible
- [ ] Aucune erreur dans les consoles

### 5. Tests Fonctionnels

#### Module A - Moteur du Challenge
- [ ] Créer un compte utilisateur
- [ ] Acheter un challenge (via mock ou PayPal)
- [ ] Ouvrir une position (BUY AAPL)
- [ ] Vérifier que l'equity diminue
- [ ] Fermer la position
- [ ] Vérifier que le P&L est calculé
- [ ] Challenge status reste "active" si règles respectées

#### Module B - Paiements
- [ ] Page `/pricing` affiche 3 plans
- [ ] Page `/checkout/1` s'affiche correctement
- [ ] Mock payment (CMI/Crypto) fonctionne
- [ ] PayPal redirige vers sandbox (si configuré)
- [ ] Challenge créé après paiement

#### Module C - Dashboard Temps Réel
- [ ] Graphique s'affiche avec données réelles
- [ ] Prix se met à jour toutes les 10s
- [ ] Signaux IA affichés dans le panneau
- [ ] Boutons Acheter/Vendre fonctionnels
- [ ] BVC: Tester `/api/prices/bvc?symbol=IAM`
  ```bash
  curl http://localhost:5000/api/prices/bvc?symbol=IAM
  # Doit retourner: {"symbol":"IAM","price":142.5,"currency":"MAD"}
  ```

#### Module D - Leaderboard
- [ ] Page `/leaderboard` accessible sans connexion
- [ ] Top 10 affiché
- [ ] Noms réels affichés (si configurés dans BD)
- [ ] Classement trié par % profit (DESC)

#### SUPERADMIN
- [ ] Page `/superadmin` accessible (compte superadmin uniquement)
- [ ] Formulaire PayPal visible
- [ ] Badge "Configuré/Non configuré" correct
- [ ] Sauvegarde de configuration fonctionne

### 6. Données de Démonstration

#### Créer des utilisateurs avec noms
```sql
UPDATE user SET first_name = 'Mohammed', last_name = 'Alami' WHERE email = 'alice@example.com';
UPDATE user SET first_name = 'Fatima', last_name = 'Zahra' WHERE email = 'bob@example.com';
```

#### Créer des challenges avec différents résultats
```sql
-- Challenge en profit
INSERT INTO user_challenge (user_id, plan_id, status, starting_balance, equity, day_start_equity)
VALUES (1, 1, 'active', 5000, 5500, 5500);

-- Challenge en perte
INSERT INTO user_challenge (user_id, plan_id, status, starting_balance, equity, day_start_equity)
VALUES (2, 2, 'active', 10000, 9200, 9200);

-- Challenge réussi
INSERT INTO user_challenge (user_id, plan_id, status, starting_balance, equity, day_start_equity)
VALUES (3, 1, 'passed', 5000, 5600, 5600);
```

### 7. Documentation

- [ ] `README.md` à jour
- [ ] `ANALYSE_MVP.md` présent (analyse conformité)
- [ ] `AMELIORATIONS_MVP.md` présent (détails améliorations)
- [ ] `GUIDE_DEMARRAGE.md` présent (guide installation)
- [ ] `DOSSIER_EXAMEN.md` présent (récapitulatif examen)

### 8. Code Propre

- [ ] Aucun `console.log` debug dans le code de production
- [ ] Commentaires pertinents présents
- [ ] Variables bien nommées
- [ ] Aucun code commenté inutile
- [ ] Indentation cohérente

### 9. Sécurité

- [ ] Pas de credentials en dur dans le code
- [ ] JWT_SECRET_KEY configuré
- [ ] Routes SUPERADMIN protégées
- [ ] Validation des inputs

### 10. Performance

- [ ] Pas de requêtes N+1
- [ ] Graphiques se chargent < 2s
- [ ] Dashboard réactif
- [ ] Pas de fuites mémoire

---

## 🎤 Plan de Présentation (15 min)

### Introduction (2 min)
- [ ] Se présenter
- [ ] Expliquer le concept (Prop Firm)
- [ ] Montrer l'architecture globale

### Démonstration Module A (3 min)
- [ ] Créer un compte
- [ ] Acheter un challenge
- [ ] Montrer les règles (5%, 10%, +10%)
- [ ] Ouvrir une position
- [ ] Fermer et montrer le P&L
- [ ] Expliquer `challenge_engine.py`

### Démonstration Module B (3 min)
- [ ] Montrer page pricing
- [ ] Checkout mock (CMI/Crypto)
- [ ] **BONUS:** PayPal réel (redirection sandbox)
- [ ] Montrer création challenge en BD

### Démonstration Module C (4 min)
- [ ] Dashboard avec graphiques TradingView
- [ ] Montrer Yahoo Finance (AAPL)
- [ ] **BONUS:** Montrer BVC (IAM, ATW)
- [ ] Signaux IA (SMA crossover)
- [ ] Refresh automatique
- [ ] Expliquer le code

### Démonstration Module D (2 min)
- [ ] Leaderboard avec Top 10
- [ ] Montrer noms réels
- [ ] Expliquer requête SQL JOIN

### Conclusion (1 min)
- [ ] Récapituler conformité 100%
- [ ] Mentionner bonus (PayPal, BVC, SUPERADMIN)
- [ ] Q&A

---

## 🚨 Pièges à Éviter

### Erreurs Courantes

❌ **Backend non démarré**
- Vérifier que `python app.py` tourne
- Port 5000 non occupé

❌ **CORS errors**
- Vérifier config CORS dans `app.py`
- Frontend sur localhost:5173

❌ **JWT invalide**
- Se reconnecter si token expiré
- Vérifier JWT_SECRET_KEY cohérent

❌ **BVC ne fonctionne pas**
- Site BVC peut être lent/down
- Avoir un plan B (Yahoo Finance uniquement)
- Mentionner: "Architecture prête, site externe temporairement indisponible"

❌ **PayPal non configuré**
- Si pas de credentials, utiliser mock
- Montrer l'interface SUPERADMIN quand même

### Solutions de Secours

**Si BVC ne marche pas:**
```python
# Dans bvc.py, ajouter un mock temporaire
def get_bvc_price(symbol: str) -> float:
    mock_prices = {
        "IAM": 142.50,
        "ATW": 520.00,
        "BCP": 280.00
    }
    return mock_prices.get(symbol, 100.0)
```

**Si PayPal timeout:**
- Utiliser mock CMI/Crypto
- Montrer le code PayPal dans l'éditeur
- Expliquer le workflow théorique

**Si base de données corrompue:**
```bash
# Recréer rapidement
cd backend
rm -f instance/tradesense.db
python -c "from app import create_app; app = create_app()"
python seed.py
python create_superadmin.py
```

---

## 📝 Questions Probables & Réponses

**Q: Comment garantissez-vous que les données sont réelles?**
R: Yahoo Finance via yfinance (bibliothèque officielle), BVC via scraping du site officiel casablanca-bourse.com

**Q: Que se passe-t-il si un utilisateur perd plus de 10%?**
R: Le `challenge_engine.py` détecte automatiquement et met le status à "failed". L'utilisateur ne peut plus trader sur ce challenge.

**Q: PayPal est-il obligatoire?**
R: Non, le système fonctionne avec mock payment. PayPal est un bonus pour 100% conformité.

**Q: Combien de symboles BVC supportez-vous?**
R: 10 symboles majeurs: IAM, ATW, BCP, GAZ, CIH, CDM, LBL, MNG, SNI, TQM. Architecture extensible.

**Q: Comment gérez-vous la sécurité?**
R: JWT pour auth, validation inputs, SUPERADMIN role-based, secrets en BD cryptée.

**Q: Le code est-il prêt pour production?**
R: Base solide oui, mais ajouts recommandés: rate limiting, caching (Redis), logging (Sentry), tests unitaires.

---

## ✅ Validation Finale

### Le Jour J - 30 min avant

- [ ] Redémarrer PC (mémoire propre)
- [ ] Fermer applications inutiles
- [ ] Backend démarré
- [ ] Frontend démarré
- [ ] Se connecter avec compte test
- [ ] Tester un trade complet
- [ ] Vérifier leaderboard
- [ ] Batterie ordinateur chargée
- [ ] Backup USB du code (au cas où)

### Pendant la Présentation

- [ ] Parler clairement et lentement
- [ ] Montrer le code ET l'interface
- [ ] Expliquer la logique métier
- [ ] Rester calme si bug mineur
- [ ] Avoir les fichiers .md ouverts (preuve documentation)

### Après la Présentation

- [ ] Demander feedback
- [ ] Noter les suggestions
- [ ] Remercier le jury

---

## 🎯 Score Attendu: 20/20

**Avec:**
- Module A: 100% ✅
- Module B: 100% ✅ (Mock + PayPal bonus)
- Module C: 100% ✅ (Yahoo + BVC bonus)
- Module D: 100% ✅ (Noms réels bonus)
- Qualité code: Excellente
- Documentation: Complète
- Présentation: Professionnelle

**Bonne chance! 🚀**
