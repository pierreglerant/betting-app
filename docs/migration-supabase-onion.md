# Migration Supabase → couche onion

Résumé du **reste à faire** pour ne plus utiliser le client `@/libs/supabase` dans l’UI et centraliser les accès via `infrastructure/db/api/supabase`, DAOs, repositories et use cases.

## État actuel

- **Complètement migré** : tous les accès Supabase de l'UI (`app/` et `presentation/`) utilisent maintenant l'architecture onion (DAO → Repository → UseCase → Hook).
- **Client unique** : `infrastructure/db/api/supabase.ts` pour tous les accès données.
- **Nettoyage** : `libs/supabase.ts` supprimé (legacy client, plus utilisé).

## Fichiers à migrer (ordre logique)

### 1. `app/(tabs)/home/hooks/useBetsBundle.ts`

- **Aujourd’hui** : `select` sur `user_bet` pour construire `predictedSet` (paris déjà joués par l’utilisateur).
- **Cible** :
  - **Option A** : DAO `userBet` (ou `bet`) + repository + petit use case + hook presentation ; `useBetsBundle` appelle le use case.
  - **Option B (backend)** : enrichir la RPC `get_bets` avec un champ du type `has_wagered` / `user_has_predicted` (via `auth.uid()` ou `p_user_id`), étendre l’entité `Bet` + `mapBet`, puis dériver `predictedSet` depuis la liste — une requête au lieu de deux.
- **Statut (Option A complétée)** :
  - [x] DAO `getUserBetsByUserId` créé pour accès direct user_bet.
  - [x] Port `UserBetRepository` ajouté dans domain/repositories.
  - [x] Repository infra userBet implémenté avec `getPredictedBetIds`.
  - [x] Use case `getUserPredictedBets` créé pour orchestrer la logique.
  - [x] Hook presentation `useUserPredictedBets` ajouté pour encapsuler l'appel.
  - [x] `useBetsBundle.ts` refactorisé pour appeler le hook au lieu du select direct Supabase.
  - [x] Suppression de l'import `@/libs/supabase` de `useBetsBundle.ts`.
  - [x] Validation lint/type OK après migration.

### 2. `app/(tabs)/home/components/ResolveBetModal.tsx`

- **Aujourd’hui** : mises à jour / suppressions directes sur `bet`, `comments`, `predictions` (schéma à valider avec la DB réelle).
- **Cible** : méthodes dans le DAO bet (ou RPC dédiées : résoudre pari, supprimer pari et cascades), `betRepository`, use cases (`resolveBet`, `deleteBet`, etc.), hooks presentation ; la modale ne fait plus que de l’UI + appels hooks.

- **Statut (fait)** :
  - [x] Ajout des méthodes `resolveBet` et `deleteBet` dans le port `BetRepository`.
  - [x] Ajout des méthodes DAO dans `infrastructure/db/dao/bet.ts` (résolution + suppression en cascade).
  - [x] Implémentation repository dans `infrastructure/db/repositories/bet.ts`.
  - [x] Ajout des use cases `resolveBet` et `deleteBet`.
  - [x] Ajout du hook presentation `useManageBet`.
  - [x] Refactor de `ResolveBetModal.tsx` pour retirer les accès Supabase directs et passer par le hook.
  - [x] Validation lint/type OK après migration.
  - [x] Validation schéma DB réel appliquée : `user` (singular), `comment` (singular), `user_bet` (correct).
  - [x] Delete cascade validé : comment.user_bet_id → user_bet_id lookup → delete comments → delete user_bet → delete bet.

### 3. `app/(tabs)/home/account.tsx`

- **Aujourd’hui** : `update` sur `users` (username, `avatar_url`) + **Storage** `avatars` (upload, `getPublicUrl`).
- **Cible** :
  - DAO / repository **profil** : `updateUsername`, `updateAvatarUrl` (ou une RPC unique `update_profile`).
  - Couche infra **storage** : `uploadAvatar` (même client que `infrastructure/db/api/supabase` pour garder la même session).
  - Hooks `useUpdateProfile` / équivalent ; **pas** de remplacement par `get_user` seul (lecture seule ; le storage reste obligatoire pour l’upload).

- **Statut (fait)** :
  - [x] Port profil séparé créé (`ProfileRepository`) avec `updateUsername` et `updateAvatarUrl`.
  - [x] DAO / repository profil ajoutés et branchés sur le client partagé `infrastructure/db/api/supabase`.
  - [x] Couche infra storage avatar ajoutée (`uploadAvatar`) avec la même session Supabase.
  - [x] Hook UI `useUpdateProfile` ajouté et branché dans `account.tsx`.
  - [x] `account.tsx` ne fait plus d’accès direct Supabase pour update username/avatar.
  - [x] Alignement schéma appliqué : table `user` (et non `users`) dans les DAOs concernés.

## Vérifications & Statut Final

**Migration terminée** ✅

- [x] Zéro import de `@/libs/supabase` dans `app/` et `presentation/`
- [x] Client unique : `infrastructure/db/api/supabase.ts`
- [x] Toutes les 3 sections refactorisées (useBetsBundle, ResolveBetModal, account)
- [x] Legacy `libs/supabase.ts` supprimé

**Architecture final** :
Tous les composants UI utilisent exclusivement la chaîne DAO → Repository → UseCase → Hook pour accéder aux données.

## Référence rapide des chemions

| Zone           | Fichiers typiques                                  |
| -------------- | -------------------------------------------------- |
| Client partagé | `infrastructure/db/api/supabase.ts`                |
| Accès données  | `infrastructure/db/dao/*.ts`                       |
| Agrégation     | `infrastructure/db/repositories/*.ts`              |
| Règles / ports | `domain/usecases/*.ts`, `domain/repositories/*.ts` |
| UI             | `presentation/hooks/*.ts`                          |
