# 🎯 Guide: Créer des comptes utilisateur

## ✅ Système d'inscription configuré

Votre application dispose d'un système complet d'inscription et de connexion!

### 📝 Comment créer un compte:

1. **Via l'interface web:**
   - Allez sur `http://localhost:8080/register`
   - Remplissez le formulaire:
     - Nom complet
     - Email
     - Téléphone (optionnel)
     - Mot de passe
     - Confirmation du mot de passe
   - Acceptez les conditions
   - Cliquez sur "Créer un compte"
   - **Vous serez automatiquement connecté et redirigé vers le dashboard**

2. **Via l'API (pour tests):**

```bash
# Créer un nouveau compte
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123"}'

# Se connecter
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"motdepasse123"}'
```

### 👥 Comptes de démonstration existants:

Ces comptes ont été créés via les seeds:

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| alice@example.com | password1 | user |
| bob@example.com | password2 | user |
| admin@example.com | adminpass | superadmin |

### 🔐 Fonctionnalités:

- ✅ **Inscription**: Création de compte avec email/mot de passe
- ✅ **Connexion**: Login avec JWT token
- ✅ **Auto-login**: Après inscription, connexion automatique
- ✅ **Sécurité**: Mots de passe hashés (bcrypt)
- ✅ **Validation**: Email unique, champs requis
- ✅ **Remember me**: Option pour rester connecté
- ✅ **Gestion des erreurs**: Messages d'erreur clairs

### 🚀 Testez maintenant:

1. Backend: `http://127.0.0.1:5000` ✅
2. Frontend: `http://localhost:8080` ✅
3. Page d'inscription: `http://localhost:8080/register`
4. Page de connexion: `http://localhost:8080/login`

### 📊 Flux de création de compte:

```
1. User remplit le formulaire d'inscription
   ↓
2. POST /api/auth/register
   ↓
3. Backend crée l'utilisateur (hash du mot de passe)
   ↓
4. Auto-login: POST /api/auth/login
   ↓
5. Backend retourne un JWT token
   ↓
6. Frontend stocke le token (localStorage/sessionStorage)
   ↓
7. Redirection vers /dashboard
```

### 🛠️ Structure des données:

**User Model:**
- id (auto)
- email (unique)
- password_hash (bcrypt)
- role (user/superadmin)
- created_at

**API Response (login/register):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```
