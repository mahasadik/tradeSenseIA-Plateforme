# SuperAdmin Module

Module refactorisé pour la page SuperAdmin avec séparation des responsabilités.

## Structure

```
SuperAdmin/
├── components.tsx    # Composants réutilisables pour l'affichage
├── api.ts           # Fonctions d'appels API
└── README.md        # Cette documentation
```

## Fichiers

### `components.tsx`
Contient tous les composants de présentation réutilisables :

- **Types** :
  - `ChallengeData` : Données d'un challenge
  - `PerformerData` : Données d'un trader performant

- **Helpers** :
  - `getStatusBadgeVariant()` : Détermine la variante du badge selon le statut
  - `getRankBadgeClass()` : Classes CSS pour les badges de classement
  - `matchesChallengeSearch()` : Filtre de recherche pour challenges

- **Composants** :
  - `ChallengeRow` : Ligne de tableau pour un challenge
  - `TopPerformerRow` : Ligne de tableau pour un top trader
  - `EmptyState` : État vide pour les tableaux
  - `PaginationInfo` : Information de pagination

### `api.ts`
Contient toutes les fonctions d'appels API :

- `fetchPaypalStatus()` : Récupère le statut PayPal
- `configurePaypal()` : Configure les credentials PayPal
- `fetchStats()` : Récupère les statistiques
- `fetchChallenges()` : Récupère la liste des challenges
- `fetchUsers()` : Récupère la liste des utilisateurs
- `createUser()` : Crée un nouvel utilisateur
- `updateUser()` : Modifie un utilisateur existant
- `deleteUser()` : Supprime un utilisateur

## Avantages de cette structure

1. **Séparation des responsabilités** : UI, logique métier et API sont séparés
2. **Réutilisabilité** : Les composants peuvent être utilisés ailleurs
3. **Testabilité** : Chaque module peut être testé indépendamment
4. **Maintenabilité** : Plus facile de localiser et modifier le code
5. **Type-safety** : Types TypeScript bien définis et exportés

## Usage dans SuperAdmin.tsx

```tsx
import {
    ChallengeRow,
    TopPerformerRow,
    EmptyState,
    PaginationInfo,
    matchesChallengeSearch,
    type ChallengeData,
    type PerformerData
} from './SuperAdmin/components';

import {
    fetchPaypalStatus,
    configurePaypal,
    fetchStats,
    fetchChallenges,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
} from './SuperAdmin/api';
```

## Constantes

Définies dans `SuperAdmin.tsx` :
- `ROLE_OPTIONS` : Options de rôles utilisateur
- `CURRENCY_OPTIONS` : Options de devises
- `ITEMS_PER_PAGE` : Nombre d'éléments par page (20)
