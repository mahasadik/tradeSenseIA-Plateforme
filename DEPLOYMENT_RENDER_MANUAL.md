# Configuration Manuelle pour Render.com

## 📦 ÉTAPE 1 : Créer la Base de Données PostgreSQL

1. Dashboard Render → **New +** → **PostgreSQL**
2. Configuration :
   - **Name**: `tradesense-db`
   - **Database**: `tradesense_production`  
   - **User**: `tradesense_user`
   - **Region**: Frankfurt (ou le plus proche)
   - **Plan**: **Free**
3. Cliquez **Create Database**
4. ⚠️ **Copiez l'Internal Database URL** (commence par `postgres://`)

---

## 🔧 ÉTAPE 2 : Créer le Backend (API Flask)

1. Dashboard Render → **New +** → **Web Service**
2. **Connect Repository**: Sélectionnez `AhmedChik/tanstradIA`
3. Configuration :

   **Basic Settings:**
   - **Name**: `tradesense-api`
   - **Region**: Même région que la DB (Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: Laissez VIDE ⚠️
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     cd backend && pip install --upgrade pip && pip install -r requirements.txt && pip install gunicorn psycopg2-binary
     ```
   - **Start Command**: 
     ```bash
     cd backend && gunicorn wsgi:app --bind 0.0.0.0:$PORT
     ```

   **Advanced Settings:**
   - **Plan**: **Free**
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes

4. **Environment Variables** (cliquez Add Environment Variable pour chacune):

   ```
   PYTHON_VERSION=3.11.9
   
   SECRET_KEY=votre-clé-secrète-générée-aléatoirement
   (Générez avec: python -c "import secrets; print(secrets.token_urlsafe(32))")
   
   JWT_SECRET_KEY=votre-jwt-clé-générée-aléatoirement
   (Générez avec: python -c "import secrets; print(secrets.token_urlsafe(32))")
   
   DATABASE_URL=[collez l'Internal Database URL de l'étape 1]
   
   CORS_ORIGINS=https://tradesense-frontend.onrender.com
   
   PAYPAL_CLIENT_ID=test-client-id
   
   PAYPAL_CLIENT_SECRET=test-client-secret
   ```

5. Cliquez **Create Web Service**
6. ⏳ Attendez 5-10 minutes que le déploiement se termine
7. ✅ Vérifiez que le service est **Live** (vert)
8. 🔗 **Notez l'URL**: `https://tradesense-api.onrender.com`

---

## 🎨 ÉTAPE 3 : Créer le Frontend (React)

1. Dashboard Render → **New +** → **Static Site**
2. **Connect Repository**: Sélectionnez `AhmedChik/tanstradIA` (même repo)
3. Configuration :

   **Basic Settings:**
   - **Name**: `tradesense-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

   **Advanced Settings:**
   - **Auto-Deploy**: Yes

4. **Environment Variables**:

   ```
   VITE_API_URL=https://tradesense-api.onrender.com
   ```
   
   ⚠️ Remplacez par l'URL exacte de votre backend (étape 2, point 8)

5. Cliquez **Create Static Site**
6. ⏳ Attendez 3-5 minutes
7. ✅ Vérifiez que le site est **Live**
8. 🔗 **Notez l'URL**: `https://tradesense-frontend.onrender.com`

---

## ↩️ ÉTAPE 4 : Mettre à Jour CORS_ORIGINS du Backend

1. Retournez au service **tradesense-api**
2. Allez dans **Environment** (menu gauche)
3. Trouvez la variable `CORS_ORIGINS`
4. Modifiez-la avec l'URL exacte du frontend :
   ```
   https://tradesense-frontend.onrender.com
   ```
   ⚠️ Pas de slash `/` à la fin
5. Sauvegardez → Le backend va redémarrer automatiquement

---

## ✅ ÉTAPE 5 : Tester le Déploiement

1. **Backend Health Check**:
   - Visitez: `https://tradesense-api.onrender.com/health`
   - Devrait afficher: `{"status": "ok"}`

2. **Frontend**:
   - Visitez: `https://tradesense-frontend.onrender.com`
   - L'application devrait se charger

3. **Test Complet**:
   - Essayez de vous inscrire
   - Essayez de vous connecter

---

## 🐛 Dépannage

### Backend : Erreur Python 3.13 au lieu de 3.11

**Solution**: 
1. Allez dans **Environment** du backend
2. Vérifiez que `PYTHON_VERSION=3.11.9` existe
3. Si elle n'existe pas, ajoutez-la
4. Redéployez manuellement

### Backend : Erreur psycopg2

**Solution**:
1. Vérifiez que `DATABASE_URL` est correcte
2. Vérifiez que le backend et la DB sont dans la même région
3. Vérifiez que la DB est **Live**

### Frontend : CORS Error

**Solution**:
1. Vérifiez que `CORS_ORIGINS` dans le backend contient l'URL exacte du frontend
2. Pas de slash final
3. Format: `https://tradesense-frontend.onrender.com`

### Backend : Cold Start (15-50 secondes)

**C'est normal sur le plan gratuit**. Solutions :
- Utilisez UptimeRobot (gratuit) pour ping toutes les 5 minutes
- Passez au plan Starter (7$/mois)

---

## 💰 Coût Total : 0€/mois

- Backend Free: 0€
- Frontend Static: 0€  
- PostgreSQL Free: 0€ (90 jours, puis recréer)

**Limitations**:
- Backend s'endort après 15 min d'inactivité
- 750 heures/mois d'activité backend
- Database expire après 90 jours

---

## 🔑 Générer les Clés Secrètes

Sur votre machine locale :

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# JWT_SECRET_KEY  
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copiez-collez les résultats dans Render.

---

**⚠️ IMPORTANT : N'utilisez PAS le Blueprint YAML pour l'instant, créez les services manuellement comme décrit ci-dessus.**
