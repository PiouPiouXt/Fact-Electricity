import React from 'react';
import styles from './Navbar.module.css';
import HamburgerMenu from './HamburgerMenu.jsx'

const TABS = [
  { id: 'calc',    label: 'Simulateur'    },
  { id: 'inverse', label: 'Calcul inverse' },
  { id: 'dash',    label: 'Suivi mensuel'  },
];

export default function Navbar({ page, onTabChange, onHome }) {
  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={onHome} aria-label="Accueil">
        <span className={styles.bolt}>⚡</span>
        <span className={styles.logoWord}>FACT</span>
        <span className={styles.logoAccent}>ELECTRICITY</span>
      </button>

      <div className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={page === tab.id}
            className={`${styles.tab} ${page === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <HamburgerMenu />
    </nav>
  );
}
