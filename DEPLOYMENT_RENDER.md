# TradeSense AI - Guide de Déploiement sur Render.com

Ce guide explique comment déployer l'application TradeSense AI sur Render.com.

## Prérequis

1. Compte GitHub avec le code du projet
2. Compte Render.com (gratuit) - [render.com](https://render.com)

## Architecture de Déploiement

- **Backend**: Web Service Python (Flask + Gunicorn)
- **Frontend**: Static Site (React + Vite)
- **Database**: PostgreSQL (Render Managed Database)

## Étape 1: Préparer le Dépôt Git

Assurez-vous que tous les fichiers sont commitées et pushées sur GitHub:

```bash
git add .
git commit -m "feat: Add Render deployment configuration"
git push origin main
```

## Étape 2: Créer la Base de Données PostgreSQL

1. Connectez-vous à [dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configurez:
   - **Name**: `tanstrad-db`
   - **Database**: `tanstrad_production`
   - **User**: `tanstrad_user`
   - **Region**: Choisissez la région la plus proche
   - **Plan**: Free
4. Cliquez sur **"Create Database"**
5. **Copiez l'Internal Database URL** (commençant par `postgres://`)

## Étape 3: Déployer le Backend (API)

1. Dans le Dashboard Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre dépôt GitHub
3. Configurez:
   - **Name**: `tanstrad-api`
   - **Region**: Même région que la base de données
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`

4. **Variables d'Environnement** (Section "Environment"):
   Cliquez sur **"Add Environment Variable"** pour chaque:
   
   ```
   SECRET_KEY = [générer une clé aléatoire sécurisée]
   JWT_SECRET_KEY = [générer une clé aléatoire sécurisée]
   DATABASE_URL = [coller l'Internal Database URL de l'étape 2]
   CORS_ORIGINS = https://tanstrad-frontend.onrender.com
   PAYPAL_CLIENT_ID = [votre PayPal Client ID]
   PAYPAL_CLIENT_SECRET = [votre PayPal Client Secret]
   PYTHON_VERSION = 3.11
   ```

   > **Note**: Pour générer des clés sécurisées, utilisez:
   > ```bash
   > python -c "import secrets; print(secrets.token_urlsafe(32))"
   > ```

5. **Health Check Path**: `/health`
6. Cliquez sur **"Create Web Service"**

Le déploiement du backend démarre automatiquement. Attendez qu'il soit en ligne (statut "Live").

**Notez l'URL du backend**: `https://tanstrad-api.onrender.com`

## Étape 4: Déployer le Frontend

1. Dans le Dashboard Render, cliquez sur **"New +"** → **"Static Site"**
2. Connectez le même dépôt GitHub
3. Configurez:
   - **Name**: `tanstrad-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Variables d'Environnement**:
   ```
   VITE_API_URL = https://tanstrad-api.onrender.com
   ```

5. Cliquez sur **"Create Static Site"**

Le déploiement du frontend démarre automatiquement.

## Étape 5: Configurer les Redirections (Frontend)

Dans les paramètres du Static Site frontend:

1. Allez dans **"Redirects/Rewrites"**
2. Ajoutez une règle:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

Cela permet au React Router de fonctionner correctement.

## Étape 6: Mettre à Jour CORS (Backend)

1. Retournez dans le service backend
2. Mettez à jour la variable d'environnement `CORS_ORIGINS`:
   ```
   CORS_ORIGINS = https://tanstrad-frontend.onrender.com
   ```
3. Le service se redéploiera automatiquement

## Étape 7: Initialiser la Base de Données

1. Allez dans le service backend sur Render
2. Cliquez sur **"Shell"** (en haut à droite)
3. Exécutez:
   ```bash
   cd backend
   python -c "from app import create_app; from models import db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized!')"
   ```

4. Optionnel - Créer un superadmin:
   ```bash
   python create_superadmin.py
   ```

## Étape 8: Vérifier le Déploiement

1. **Backend API**: Visitez `https://tanstrad-api.onrender.com/health`
   - Devrait retourner: `{"status": "ok"}`

2. **Frontend**: Visitez `https://tanstrad-frontend.onrender.com`
   - L'application devrait se charger correctement

## Utilisation du Blueprint (Méthode Alternative)

Au lieu de créer manuellement chaque service, vous pouvez utiliser le fichier `render.yaml`:

1. Dans le Dashboard Render, cliquez sur **"New +"** → **"Blueprint"**
2. Connectez votre dépôt GitHub
3. Render détectera automatiquement le fichier `render.yaml`
4. Ajoutez les variables d'environnement manquantes
5. Cliquez sur **"Apply"**

## Maintenance et Mises à Jour

### Déploiement Automatique
Render redéploie automatiquement quand vous pushez sur la branche `main`:

```bash
git add .
git commit -m "Update: description des changements"
git push origin main
```

### Voir les Logs
- Backend: Dans le service backend → Onglet **"Logs"**
- Frontend: Dans le static site → Onglet **"Logs"**

### Redéploiement Manuel
- Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

## Variables d'Environnement - Résumé

### Backend (`tanstrad-api`)
| Variable | Description | Exemple |
|----------|-------------|---------|
| `SECRET_KEY` | Clé secrète Flask | `random-secret-key-here` |
| `JWT_SECRET_KEY` | Clé JWT | `random-jwt-key-here` |
| `DATABASE_URL` | URL PostgreSQL | `postgres://user:pass@host/db` |
| `CORS_ORIGINS` | URLs frontend autorisées | `https://tanstrad-frontend.onrender.com` |
| `PAYPAL_CLIENT_ID` | PayPal Client ID | `your-paypal-client-id` |
| `PAYPAL_CLIENT_SECRET` | PayPal Secret | `your-paypal-secret` |

### Frontend (`tanstrad-frontend`)
| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `https://tanstrad-api.onrender.com` |

## Limitations du Plan Gratuit Render

- **Backend**: Se met en veille après 15 min d'inactivité (premier accès peut prendre 30-50s)
- **Database**: 256 MB de stockage, 97 heures d'uptime/mois
- **Bandwidth**: 100 GB/mois

Pour une production sérieuse, envisagez les plans payants.

## Dépannage

### Erreur: "Failed to connect to database"
- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que la base de données est en ligne
- Assurez-vous que le backend et la DB sont dans la même région

### Erreur: "CORS policy blocked"
- Vérifiez que `CORS_ORIGINS` contient l'URL exacte du frontend
- Pas de slash final dans l'URL

### Frontend: Pages vides ou erreurs 404
- Vérifiez que la redirection `/* → /index.html` est configurée
- Vérifiez que `VITE_API_URL` pointe vers le bon backend

### Backend: Cold start lent
- C'est normal sur le plan gratuit (15-50 secondes)
- Pour éviter: passez au plan payant ou utilisez un service de ping

## Commandes Utiles

### Générer des clés secrètes:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Tester l'API localement:
```bash
cd backend
python app.py
```

### Builder le frontend localement:
```bash
cd frontend
npm run build
npm run preview
```

## Support

Pour toute question sur le déploiement Render:
- Documentation Render: [docs.render.com](https://docs.render.com)
- Support Render: [render.com/support](https://render.com/support)

---

**Créé le**: {{ date }}  
**Version**: 1.0  
**Application**: TradeSense AI
