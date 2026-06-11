import React, { useState, useCallback } from 'react';
import { calcInverse, calcBill, numfmt, fmtTime, totalKwh, APPS } from '../utils/electricity.js';
import styles from './InversePage.module.css';

export default function InversePage({ applySuggestions }) {
  // Use a string so we can type freely without resets
  const [budgetStr, setBudgetStr] = useState('');

  const budget      = parseFloat(budgetStr.replace(/\s/g, '').replace(',', '.')) || 0;
  const suggestions = budget > 0 ? calcInverse(budget) : [];

  const totalKwhSugg = suggestions.reduce(
    (s, a) => s + (a.watts * a.suggestedH * 30) / 1000, 0
  );
  const verifyBill = calcBill(totalKwhSugg);
  const maxH = suggestions.length > 0
    ? Math.max(...suggestions.map((s) => s.suggestedH), 0.01)
    : 1;

  const handleApply = () => {
    applySuggestions(suggestions);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Calcul Inverse</h2>
        <p className={styles.desc}>
          Entrez votre budget mensuel — l'algorithme distribue les heures en priorité
          sur les appareils essentiels (réfrigérateur, ampoules, ordinateur…).
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>🎯</span>
          <span className={styles.cardTitle}>Budget mensuel cible</span>
        </div>

        <div className={styles.inputRow}>
          <span className={styles.inputLabel}>Je veux payer :</span>
          <div className={styles.inputWrap}>
            <input
              className={styles.budgetIn}
              type="text"
              inputMode="numeric"
              placeholder="45 000"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              aria-label="Budget mensuel en Ariary"
            />
            <span className={styles.inputUnit}>Ar / mois</span>
          </div>
        </div>

        {budget > 0 && (
          <>
            <div className={styles.summaryBanner}>
              Budget <strong>{numfmt(budget)} Ar</strong> →
              environ <strong>{totalKwhSugg.toFixed(1)} kWh</strong>/mois
              <span className={styles.summaryTranche} style={{ color: verifyBill.color }}>
                ({verifyBill.label})
              </span>
            </div>

            <div className={styles.results}>
              {suggestions.map((s) => {
                const pct     = Math.round((s.suggestedH / maxH) * 100);
                const devKwh  = (s.watts * s.suggestedH * 30) / 1000;
                const isHigh  = s.priority >= 8;

                return (
                  <div key={s.id} className={`${styles.devRow} ${isHigh ? styles.highPri : ''}`}>
                    <div className={styles.devInfo}>
                      <span className={styles.devIcon}>{s.icon}</span>
                      <div>
                        <div className={styles.devName}>
                          {s.name}
                          {isHigh && <span className={styles.priorityBadge}>prioritaire</span>}
                        </div>
                        <div className={styles.devWatts}>{s.watts}W</div>
                      </div>
                    </div>

                    <div className={styles.barWrap}>
                      <div className={styles.bar}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: `${pct}%`,
                            background: isHigh ? 'var(--y)' : 'rgba(245,197,24,0.45)',
                          }}
                        />
                      </div>
                    </div>

                    <div className={styles.devRight}>
                      <div className={styles.devTime}>
                        {fmtTime(s.suggestedH)}<span className={styles.devTimeUnit}>/j</span>
                      </div>
                      <div className={styles.devKwh}>{devKwh.toFixed(2)} kWh</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.applyRow}>
              <button className={styles.btnApply} onClick={handleApply}>
                Appliquer ces durées →
              </button>
              <span className={styles.applyHint}>
                Redirige vers le simulateur avec ces valeurs
              </span>
            </div>
          </>
        )}

        {!budget && (
          <div className={styles.empty}>
            Entrez un montant pour voir la répartition suggérée.
          </div>
        )}
      </div>

      {/* Info box */}
      <div className={styles.infoBox}>
        <div className={styles.infoTitle}>Comment fonctionne l'algorithme ?</div>
        <div className={styles.infoText}>
          L'algorithme calcule d'abord le nombre de kWh achetables pour votre budget,
          en tenant compte des tranches tarifaires JIRAMA. Il répartit ensuite ces kWh
          en priorité sur les appareils essentiels (réfrigérateur → ampoules → ordinateur…),
          en respectant des plafonds d'usage réalistes par appareil.
        </div>
      </div>
    </div>
  );
}
