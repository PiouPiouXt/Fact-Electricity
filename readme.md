# ⚡ Fact-Electricity (ÉnergieAr)

> **Estimateur intelligent et simulateur de consommation d'énergie électrique en Ariary (MGA)**  
> Une application web moderne, immersive et responsive pour calculer, anticiper et optimiser vos factures d'électricité.

---

[![GitHub Repo](https://img.shields.io/badge/GitHub-Fact--Electricity-181717?style=for-the-badge&logo=github)](https://github.com/PiouPiouXt/Fact-Electricity.git)
[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Tailwind-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Theme](https://img.shields.io/badge/UI%2FUX-Dark%20Yellow%20Glow-FFD700?style=for-the-badge)](#-design--uiux)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📌 Sommaire

- [À propos du projet](#-à-propos-du-projet)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Barème & Tranches de Tarification](#-barème--tranches-de-tarification)
- [Design & UI/UX](#-design--uiux)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Structure du Projet](#-structure-du-projet)
- [Installation & Démarrage](#-installation--démarrage)
- [Guide d'utilisation](#-guide-dutilisation)
- [API & Endpoints](#-api--endpoints)
- [Feuille de route (Roadmap)](#-feuille-de-route-roadmap)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 💡 À propos du projet

**Fact-Electricity** est un outil web interactif conçu pour aider les ménages et professionnels à maîtriser leur budget d'électricité. En saisissant simplement le temps d'utilisation quotidien de vos appareils électroniques, l'application estime instantanément votre consommation globale mensuelle en **kWh** ainsi que le coût total en **Ariary (Ar)**.

L'application intègre également un système d'**estimation inverse** (définir un budget max et recevoir une recommandation d'heures d'utilisation) ainsi qu'un suivi en temps réel des **tranches de facturation progressive**.

---

## 🚀 Fonctionnalités Principales

### 1. 🖥️ Interface Immersive & Accueil (Homepage)
- Présentation dynamique et moderne de la plateforme.
- Statistiques clés, aperçu du fonctionnement et call-to-action rapide.

### 2. 🔌 Gestionnaire d'Appareils (Get Started)
- **Catalogue d'appareils de base** prédéfinis avec leurs puissances standard (Réfrigérateur, TV, Téléphone, Climatiseur, Lave-linge, Ampoules LED, etc.).
- **Personnalisation complète** : Modification possible de la puissance ($W$ / $kWh$) de chaque appareil.
- **Ajout personnalisé** : Possibilité d'ajouter des appareils sur-mesure.

### 3. ⏱️ Estimation Directe de Consommation
- Sélection simple des appareils et saisie du temps d'utilisation quotidien/mensuel.
- Calcul en temps réel de la consommation globale ($kWh$) et du montant estimé de la facture mensuelle en **Ariary**.

### 4. 🧮 Calcul Inverse (Budget ciblé)
- Entrez le montant total max que vous souhaitez payer (ex: *50 000 Ar*).
- L'algorithme répartit et suggère automatiquement la durée d'utilisation quotidienne optimale pour chaque appareil afin de respecter votre budget.

### 5. 📊 Indicateur de Tranche & Variabilité du Prix
- Détection automatique de la tranche de consommation atteinte.
- Jauge visuelle indiquant la marge restante avant de basculer dans la tranche supérieure.

### 6. 💾 Enregistrement & Historique (Backend Integration)
- Sauvegarde automatique des calculs pour chaque utilisateur.
- Comparaison de l'évolution de la consommation au fil des mois.

---

## 💰 Barème & Tranches de Tarification

L'algorithme de calcul applique une tarification progressive par tranches :

| Tranche | Intervalle de Consommation ($kWh$) | Tarif par $kWh$ |
| :--- | :--- | :--- |
| **1ère Tranche** | $\le 130 	ext{ kWh}$ | **350 Ar / kWh** |
| **2ème Tranche** | $> 130 	ext{ kWh}$ et $< 300 	ext{ kWh}$ | **580 Ar / kWh** |
| **3ème Tranche** | $\ge 300 	ext{ kWh}$ | **760 Ar / kWh** |

### 📐 Formule de Calcul
$$	ext{Consommation (kWh)} = rac{	ext{Puissance (Watts)} 	imes 	ext{Heures/jour} 	imes 30}{1000}$$

$$	ext{Cout Total (Ar)} = \sum (	ext{kWh dans la tranche } i 	imes 	ext{Tarif tranche } i)$$

---

## 🎨 Design & UI/UX

- **Thème principal** : Dark Yellow / Cyber Glow (Fond sombre `#0D0F12` / `#14171D`, accents jaune néon `#FFD700` & `#F59E0B`).
- **Composants modernes** : Cartes rétroéclairées avec effets de survol (*hover glow*), jauges progressives, et animations fluides.
- **Responsive design** : Optimisé pour mobile, tablette et écran desktop.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework** : React.js (Vite / Next.js)
- **Styling** : CSS Modules / Custom Glow Utilities
- **Icons** : Lucide-React 
- **Visualisation de données** : Recharts / Chart.js

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB / PostgreSQL / SQLite
- **Authentication & Sessions** : JWT (JSON Web Tokens) / Express-session

---

## 📂 Structure du Projet

```text
Fact-Electricity/
├── client/                   # Frontend React
│   ├── public/               # Assets statiques & Favicon
│   ├── src/
│   │   ├── components/       # Composants réutilisables (Navbar, Cards, Gauges)
│   │   ├── pages/            # Home, Calculator, InverseCalc, History
│   │   ├── context/          # Context API (Appareils, Calculs, Theme)
│   │   ├── utils/            # Algorithmes de calcul des tranches
│   │   └── styles/           # Fichiers CSS & Tailwind config
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Backend Node.js / Express
│   ├── config/               # Configuration DB & Env
│   ├── controllers/          # Logique métier des calculs et utilisateurs
│   ├── models/               # Schémas de base de données (User, Calculation)
│   ├── routes/               # API Routes (/api/calculations, /api/auth)
│   ├── utils/                # Helper functions
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚙️ Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (v16.x ou plus récent)
- [Git](https://git-scm.com/)

### 1. Cloner le dépôt
```bash
git clone https://github.com/PiouPiouXt/Fact-Electricity.git
cd Fact-Electricity
```

### 2. Configuration du Backend
```bash
cd server
npm install
```

Créer un fichier `.env` dans le dossier `server/` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fact_electricity
JWT_SECRET=votre_cle_secrete_ici
```

Démarrer le serveur backend :
```bash
npm start
# ou en mode développement
npm run dev
```

### 3. Configuration du Frontend
Dans un nouveau terminal :
```bash
cd client
npm install
npm run dev
```

Ouvrez ensuite votre navigateur sur `http://localhost:5173` (ou port affiché dans le terminal).

---

## 📖 Guide d'utilisation

1. **Accédez à la page d'accueil** pour découvrir la présentation et cliquer sur **Get Started**.
2. **Ajustez les appareils** :
   - Parcourez la liste des appareils prédéfinis.
   - Modifiez leur puissance ($W$) si nécessaire ou ajoutez vos propres équipements.
3. **Définissez le temps d'utilisation** :
   - Entrez les heures d'utilisation quotidiennes pour chaque appareil sélectionné.
4. **Consultez les résultats** :
   - Visualisez la consommation globale ($kWh$), le montant estimé en Ariary et la tranche atteinte.
5. **Essayez le Calcul Inverse** :
   - Basculez sur le mode "Calcul Inverse", indiquez votre budget limite en Ariary, et l'application répartira l'utilisation optimale.
6. **Sauvegardez vos résultats** :
   - Connectez-vous pour enregistrer vos simulations dans votre historique personnel.

---

## 📡 API & Endpoints

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/appliances` | Récupère la liste des appareils par défaut |
| `POST` | `/api/calculate` | Effectue le calcul de facture selon les tranches |
| `POST` | `/api/inverse-calculate` | Génère les suggestions d'heures selon un budget |
| `POST` | `/api/history` | Enregistre une simulation pour l'utilisateur |
| `GET` | `/api/history` | Récupère l'historique des calculs enregistrés |

---

## 🗺️ Feuille de route (Roadmap)

- [x] Structure de base du projet & UI Dark Yellow Glow
- [x] Calcul de consommation classique par tranches (350 / 580 / 760 Ar)
- [x] Module de calcul inverse par budget
- [ ] Exportation de la simulation en PDF / PNG
- [ ] Mode hors-ligne (PWA)
- [ ] Alertes de surconsommation personnalisées

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet.
2. Créez une branche de fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`).
3. Commitez vos modifications (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`).
4. Pushez sur la branche (`git push origin feature/NouvelleFonctionnalite`).
5. Ouvrez une **Pull Request**.

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<p align="center">
  Développé avec ❤️ pour optimiser l'énergie en Ariary 🇲🇬  
  <br>
  <b><a href="https://github.com/PiouPiouXt/Fact-Electricity.git">GitHub Repository: Fact-Electricity</a></b>
</p>