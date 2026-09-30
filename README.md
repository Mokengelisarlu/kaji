# Kaji.com

**Talent & Professional Mediation Platform** — opérée par Mokengeli SARLU.

Plateforme de médiation entre talents et entreprises. Le moteur de matching
propose, l'humain décide. Le site public est un annuaire de talents
partageable et indexable, dont les coordonnées ne sont jamais publiées.

---

## Stack

| Élément | Version |
|---|---|
| Next.js | 16.3.6 (App Router, Turbopack, React Server Components) |
| React | 19.2.8 |
| TypeScript | 5, `strict` + `noUncheckedIndexedAccess` |
| Tailwind CSS | 4 (`@theme` dans `src/app/globals.css`) |
| Validation | Zod 4 |
| Icônes | lucide-react |
| Paquet | pnpm 11 |

Non installés, mais ciblés : Clerk (authentification), Neon + Drizzle
(persistance), un fournisseur d'e-mails, un stockage objet compatible S3.

## Commandes

```bash
pnpm install
pnpm dev          # serveur de développement
pnpm build        # build de production
pnpm start        # serveur de production
pnpm lint         # eslint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm check        # lint + typecheck + build — à passer avant tout commit
```

`pnpm check` est la seule commande qui compte avant de dire qu'une chose
fonctionne. Il n'y a pas de suite de tests : c'est une dette ouverte, pas un
oubli. Voir `06-progress-tracker.md` §4.

## Structure

```
src/
├── app/                  # Routes. Chaque page est un écran identifié EC-xx (design.md §60)
├── components/
│   ├── layout/           # En-tête, pied de page — mentions de marque obligatoires
│   ├── talent/           # Cartes, filtres, sections de fiche publique
│   └── ui/               # Design system. Tokens dans app/globals.css
├── lib/
│   ├── domain/           # Règles métier pures. Aucun import React, aucune base
│   ├── mock/             # Données de démonstration, marquées ⚠️ DONNÉES FICTIVES
│   ├── repositories/     # Accès données. Aujourd'hui : MockTalentRepository
│   ├── use-cases/        # Surface que les pages consomment. Aucune logique de présentation
│   ├── validation/       # Listes blanches et schémas Zod
│   └── site.ts           # BRAND, PRIMARY_CTA, FOOTER_NAV, LEGAL_NAV
└── assets/               # Images utilisées par les composants (importées via @/assets)
```

Le sens de dépendance est strict : `app/` → `use-cases/` → `repositories/` →
`domain/`. Le domaine ne connaît rien du reste.

## Documentation

Sept documents font référence. Toute modification du code qui change un
comportement visible doit mettre à jour le document concerné.

| Document | Contenu |
|---|---|
| `01-ai-workflow.md` | Workflow, validation, registre des 68 sections |
| `02-product-vision.md` | Produit, confidentialité, parcours, MVP, règles R1–R18 |
| `03-system-architecture.md` | Architecture, données, cache, sécurité, intégrations |
| `04-design-system.md` | Tokens, 27 composants, états, responsive, accessibilité |
| `05-development-standards.md` | TypeScript, sécurité, tests, Git, performance |
| `06-progress-tracker.md` | État réel, jalons, risques, ordre de travail |
| `design.md` | Écrans `EC-01`–`EC-13`, parcours `PA-01`–`PA-04` |

## Règles qui ne se négocient pas

1. **Aucune coordonnée dans une route publique.** Garanti par le type
   `PublicTalentProfile`, pas par la prudence.
2. **Les données de démonstration vont dans `src/lib/mock/`** et sont marquées.
3. **Aucun secret dans le dépôt.** Les variables d'environnement sont listées
   dans `03-system-architecture.md` §38.
4. **Un chiffre public est calculé, jamais écrit en dur.** Voir
   `getTalentPoolStats()`.
5. **Une promesse d'interface doit renvoyer à une exigence de
   `02-product-vision.md` ou à une fonctionnalité existante.**
6. **Pas de commit sans `pnpm check` au vert.**

## État

Le site public est fonctionnel : accueil, annuaire, fiche talent, 404. Les
pages légales, le formulaire de contact et les espaces authentifiés sont des
placeholders. L'authentification et la persistance ne sont pas branchées. Le
détail et l'ordre de travail sont dans `06-progress-tracker.md`.
