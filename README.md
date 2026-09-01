# 📚 Library Management System

Application web permettant de gérer une bibliothèque avec **FastAPI** côté backend et **React + TypeScript + Tailwind CSS** côté frontend.

Le projet est conçu selon les principes de l'**Architecture Hexagonale (Ports & Adapters)**.

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │     React       │
                    │ TypeScript      │
                    │ Tailwind CSS    │
                    └────────┬────────┘
                             │ HTTP
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    │  Adapter HTTP   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Use Cases    │
                    │                 │
                    │ AddBook         │
                    │ ListBooks       │
                    │ BorrowBook      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Domain      │
                    │      Book       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      Port       │
                    │ BookRepository  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Adapter     │
                    │ InMemoryRepo    │
                    └─────────────────┘
```

## ✨ Fonctionnalités

* Ajouter un livre
* Lister les livres
* Vérifier la disponibilité d'un livre
* Emprunter un livre
* Empêcher l'emprunt d'un livre déjà emprunté
* API REST documentée avec Swagger

## 🛠️ Technologies

### Backend

* Python
* FastAPI
* Uvicorn
* Architecture Hexagonale

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* pnpm

## 📁 Structure du projet

```text
library/
│
├── backend/
│   ├── app/
│   │   ├── domain/
│   │   │   └── book.py
│   │   │
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── book_repository.py
│   │   │   │
│   │   │   └── use_cases/
│   │   │       ├── add_book.py
│   │   │       ├── list_books.py
│   │   │       └── borrow_book.py
│   │   │
│   │   ├── adapters/
│   │   │   └── repositories/
│   │   │       └── in_memory_book_repository.py
│   │   │
│   │   ├── api/
│   │   │   └── books.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── package.json
└── README.md
```

# 🚀 Installation

## Prérequis

Assurez-vous d'avoir installé :

* Python 3.10+
* Node.js 18+
* pnpm

Vérifier les versions :

```bash
python --version
node --version
pnpm --version
```

## 1. Cloner le projet

```bash
git clone https://github.com/Charys245/library
cd library
```

## 2. Installer le backend

```bash
cd backend

python -m venv .venv
```

### Linux / macOS

```bash
source .venv/bin/activate
```

### Windows

```bash
.venv\Scripts\activate
```

Installer les dépendances :

```bash
pip install -r requirements.txt
```

Puis revenir à la racine :

```bash
cd ..
```

## 3. Installer le frontend

```bash
cd frontend
pnpm install
cd ..
```

## 4. Installer les dépendances du projet racine

```bash
pnpm install
```

# ▶️ Lancer le projet

Une fois l'installation terminée, une seule commande permet de lancer **le backend et le frontend simultanément** :

```bash
pnpm dev
```

Le projet sera disponible sur :

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://localhost:8000
```

### Documentation API

```text
http://localhost:8000/docs
```

# 🔌 API

## Ajouter un livre

```http
POST /books
```

Body :

```json
{
  "title": "Clean Architecture",
  "author": "Robert C. Martin"
}
```

## Lister les livres

```http
GET /books
```

## Emprunter un livre

```http
POST /books/{book_id}/borrow
```

Exemple :

```http
POST /books/1/borrow
```

Si le livre est disponible, son statut devient :

```json
{
  "available": false
}
```

Si le livre est déjà emprunté :

```json
{
  "detail": "Book is not available"
}
```

# 🧠 Règles métier

Le système applique les règles suivantes :

1. Un nouveau livre est disponible par défaut.
2. Un livre disponible peut être emprunté.
3. Un livre déjà emprunté ne peut pas être emprunté une deuxième fois.
4. Un livre inexistant ne peut pas être emprunté.

Ces règles sont portées par le **domaine** et les **cas d'utilisation**, et non par FastAPI.

# 🏛️ Architecture Hexagonale

L'application sépare le cœur métier des détails techniques.

### Domain

Contient les entités et les règles métier.

```text
domain/book.py
```

### Application

Contient les cas d'utilisation :

```text
AddBook
ListBooks
BorrowBook
```

### Ports

Définissent les contrats nécessaires à l'application :

```text
BookRepository
```

### Adapters

Implémentent les interactions avec l'extérieur.

Dans cette version :

```text
InMemoryBookRepository
```

### API

FastAPI agit comme **adapter entrant** et expose les cas d'utilisation via HTTP.

## 🔄 Flux d'un emprunt

```text
POST /books/1/borrow
        │
        ▼
     FastAPI
        │
        ▼
   BorrowBook
        │
        ▼
 BookRepository
        │
        ▼
     Book
        │
        ▼
    borrow()
        │
        ├── disponible → emprunté
        │
        └── indisponible → erreur
```

## ⚠️ Stockage

Cette version utilise un repository en mémoire :

```text
InMemoryBookRepository
```

Les données sont donc perdues lorsque le serveur backend est arrêté.

Pour une version production, le repository peut être remplacé par une implémentation PostgreSQL, SQLite ou autre sans modifier le cœur métier.

# 🧪 Test rapide

1. Lancer le projet :

```bash
pnpm dev
```

2. Ouvrir :

```text
http://localhost:5173
```

3. Ajouter un livre.
4. Cliquer sur **Emprunter**.
5. Vérifier que le statut passe de :

```text
Disponible
```

à :

```text
Emprunté
```

6. Vérifier également l'API via :

```text
http://localhost:8000/docs
```

# 📌 Commandes utiles

Lancer les deux applications :

```bash
pnpm dev
```

Lancer uniquement le backend :

```bash
pnpm dev:backend
```

Lancer uniquement le frontend :

```bash
pnpm dev:frontend
```

Construire le frontend :

```bash
pnpm --dir frontend build
```
