# Janngo — Plateforme de gestion des requêtes étudiantes UIT

Application web full-stack pour la gestion des requêtes administratives étudiantes de l'UIT, avec chatbot IA intégré.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Tailwind CSS + Redux Toolkit |
| Backend | Node.js + Express.js |
| ORM | Sequelize |
| Base de données | PostgreSQL |
| Auth | JWT (24h) |
| Chatbot | OpenAI GPT-3.5 |
| Upload | Multer (local `uploads/`) |

## Prérequis

- Node.js >= 16
- PostgreSQL >= 13
- Clé API OpenAI (optionnel, le chatbot a un fallback)

## Installation

### 1. Cloner et configurer l'environnement

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL et clé OpenAI
```

### 2. Backend

```bash
cd backend
npm install

# Créer la base de données PostgreSQL manuellement :
# psql -U postgres -c "CREATE DATABASE janngo_db;"

# Exécuter les migrations
npm run db:migrate

# Peupler avec les données de démonstration
npm run db:seed

# Démarrer le serveur
npm run dev
# → http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Étudiant | etudiant@uit.sn | etudiant123 |
| Étudiant 2 | etudiant2@uit.sn | etudiant123 |
| Secrétaire | secretaire@uit.sn | secret123 |
| Directeur | directeur@uit.sn | direct123 |
| Directeur Adjoint | dadjoint@uit.sn | dadjoint123 |
| Resp. Département | dept@uit.sn | dept123 |
| Scolarité | scolarite@uit.sn | scol123 |
| Cellule Info | cellule@uit.sn | cellule123 |

## Workflows

### Demande d'attestation
```
Étudiant → Secrétariat (vérification) → Dir. Adjoint (orientation) → Département OU Scolarité → FAVORABLE/DÉFAVORABLE → Notification
```

### Correction de nom
```
Étudiant → Secrétariat (vérification) → Directeur (validation) → Cellule Informatique (modification) → Clôture → Notification
```

### Contestation de note
```
Étudiant → Département (analyse) → FAVORABLE: Cellule Info (MAJ note) → Clôture
                                 → DÉFAVORABLE: Clôture directe → Notification
```

## Structure du projet

```
janngo/
├── backend/
│   ├── config/          # Config BDD et Sequelize
│   ├── models/          # 21 modèles Sequelize
│   ├── controllers/     # Logique métier
│   ├── services/        # Services (workflow, notif, chatbot...)
│   ├── middlewares/     # Auth, rôle, upload
│   ├── routes/          # Routes API Express
│   ├── migrations/      # Migration Sequelize
│   ├── seeders/         # Données de test
│   └── uploads/         # Fichiers uploadés
└── frontend/
    └── src/
        ├── components/  # Sidebar, Navbar, Chatbot, formulaires
        ├── pages/       # Pages par rôle (7 rôles)
        ├── services/    # Appels API axios
        ├── store/       # Redux slices (auth, requetes, notifs)
        └── utils/       # Constants, helpers
```

## API Endpoints

### Auth
- `POST /api/auth/login` — connexion
- `POST /api/auth/logout` — déconnexion
- `GET  /api/auth/me` — profil connecté

### Requêtes
- `GET    /api/requetes` — liste (filtrée par rôle)
- `GET    /api/requetes/:id` — détail
- `PATCH  /api/requetes/:id/statut` — changer statut
- `GET    /api/requetes/:id/historique`

### Workflows spécifiques
- `POST   /api/requetes/attestation`
- `PATCH  /api/requetes/attestation/:id/transmettre`
- `PATCH  /api/requetes/attestation/:id/orienter`
- `PATCH  /api/requetes/attestation/:id/resultat`
- `POST   /api/requetes/correction-nom`
- `PATCH  /api/requetes/correction-nom/:id/transmettre`
- `PATCH  /api/requetes/correction-nom/:id/valider`
- `PATCH  /api/requetes/correction-nom/:id/modifier`
- `POST   /api/requetes/contestation-note`
- `PATCH  /api/requetes/contestation-note/:id/analyser`
- `PATCH  /api/requetes/contestation-note/:id/resultat`
- `PATCH  /api/requetes/contestation-note/:id/modifier-note`

### Documents
- `POST /api/documents/upload` — upload fichier
- `GET  /api/documents/:id` — télécharger

### Chatbot (étudiants uniquement)
- `POST /api/chatbot/message`
- `GET  /api/chatbot/historique`

### Rapports (directeur uniquement)
- `GET /api/rapports/activite`
- `GET /api/rapports/requetes`

## Réinitialiser la base de données

```bash
cd backend
npm run db:reset
```

## Notes importantes

- Les mots de passe sont gérés par l'administration UIT (pas d'inscription publique)
- Les fichiers uploadés sont stockés dans `backend/uploads/`
- JWT expire après 24h
- Le chatbot requiert une clé OpenAI valide dans `.env`
- En cas d'absence de clé OpenAI, le chatbot répond avec un message de fallback
