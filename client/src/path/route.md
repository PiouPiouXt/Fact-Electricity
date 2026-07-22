fact-electricity/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    ← entry point
    ├── App.jsx                     ← router home/app + onglets
    ├── styles/global.css           ← tokens CSS globaux
    ├── utils/
    │   ├── electricity.js          ← tarifs, calcBill, calcInverse, helpers
    │   └── exportPDF.js            ← génération PDF
    ├── hooks/
    │   ├── useAppState.js          ← état global (times, customs, mensuel)
    │   └── useParticles.js         ← canvas particles homepage
    ├── components/
    │   ├── Navbar.jsx / .css       ← barre tabs + logo + retour accueil
    │   ├── CircularGauge.jsx       ← jauge animée canvas
    │   ├── DeviceCard.jsx          ← carte appareil cliquable
    │   ├── FloatPanel.jsx          ← panneau inline temps d'utilisation
    │   └── BillModal.jsx           ← modal résultat + export PDF
    └── pages/
        ├── HomePage.jsx            ← landing immersive + particles
        ├── CalcPage.jsx            ← simulateur principal
        ├── InversePage.jsx         ← calcul inverse (bug corrigé)
        └── DashboardPage.jsx       ← suivi mensuel + Chart.js