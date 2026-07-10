import React, { useEffect } from 'react';
import { useParticles } from '../hooks/useParticles.js';
import styles from './HomePage.module.css';

const FEATURES = [
  { icon: '⚡', title: 'Temps réel',      desc: 'Jauge dynamique mise à jour à chaque sélection d\'appareil.' },
  { icon: '🎯', title: 'Calcul inverse',  desc: 'Budget → répartition intelligente par priorité d\'usage.' },
  { icon: '📊', title: 'Suivi mensuel',   desc: 'Graphique d\'évolution sur 12 mois de vos factures.' },
  { icon: '📄', title: 'Export PDF Pro',  desc: 'Rapport stylisé à partager avec vos colocataires.' },
];

export default function HomePage({ onStart }) {
  const canvasRef = useParticles(true);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.particles} aria-hidden />
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.corner} data-pos="tl" aria-hidden />
      <div className={styles.corner} data-pos="tr" aria-hidden />
      <div className={styles.corner} data-pos="bl" aria-hidden />
      <div className={styles.corner} data-pos="br" aria-hidden />

      <div className={styles.inner}>
        {/* Badge */}
        <div className={styles.badge}>⚡ Madagascar · Simulateur Électricité JIRAMA</div>

        {/* Headline */}
        <h1 className={styles.h1}>
          <span className={styles.line1}>Maîtrisez votre</span>
          <span className={styles.line2}>Budget Électrique</span>
        </h1>

        <p className={styles.sub}>
          Estimez votre consommation en kWh, calculez votre facture selon les tranches
          tarifaires JIRAMA et optimisez chaque appareil de votre foyer — en temps réel.
        </p>

        {/* CTA */}
        <button className={styles.ctaBtn} onClick={onStart}>
          ⚡ Lancer le simulateur
        </button>

        {/* Tariff pills */}
        <div className={styles.pills}>
          <span className={`${styles.pill} ${styles.t1}`}>T1 · 0–130 kWh · 350 Ar/kWh</span>
          <span className={`${styles.pill} ${styles.t2}`}>T2 · 130–300 kWh · 580 Ar/kWh</span>
          <span className={`${styles.pill} ${styles.t3}`}>T3 · &gt;300 kWh · 760 Ar/kWh</span>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCell}><div className={styles.statVal}>9+</div><div className={styles.statLbl}>Appareils</div></div>
          <div className={styles.statCell}><div className={styles.statVal}>100%</div><div className={styles.statLbl}>Temps réel</div></div>
          <div className={styles.statCell}><div className={styles.statVal}>0 Ar</div><div className={styles.statLbl}>Gratuit</div></div>
        </div>

        {/* Feature cards */}
        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featCard}>
              <div className={styles.featIcon}>{f.icon}</div>
              <div className={styles.featTitle}>{f.title}</div>
              <div className={styles.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
