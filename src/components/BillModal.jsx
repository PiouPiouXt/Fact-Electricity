import React, { useEffect } from 'react';
import { APPS, calcBill, fmtTime, numfmt, T1_MAX, T1_RATE, T2_MAX, T2_RATE, T3_RATE } from '../utils/electricity.js';
import { exportPDF } from '../utils/exportPDF.js';
import styles from './BillModal.module.css';

export default function BillModal({ times, customs, monthlyData, onClose, addMonthEntry }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSaveToHistory = () => {
    const now = new Date();
    addMonthEntry(now.getMonth(), now.getFullYear(), Math.round(bill.cost), parseFloat(totalKwh.toFixed(2)));
    onClose();
  };

  const rows = [];
  let totalKwh = 0;

  APPS.forEach((a, i) => {
    if ((times[i] || 0) > 0) {
      const k = (a.watts * times[i] * 30) / 1000;
      totalKwh += k;
      rows.push({ icon: a.icon, name: a.name, h: times[i], kwh: k });
    }
  });
  customs.forEach((c) => {
    if ((c.h || 0) > 0) {
      const k = (c.watts * c.h * 30) / 1000;
      totalKwh += k;
      rows.push({ icon: c.icon, name: c.name, h: c.h, kwh: k });
    }
  });

  const bill = calcBill(totalKwh);

  let breakdownRows = null;
  if (bill.t === 1) {
    breakdownRows = [<span key="t1" style={{ color: '#22c55e' }}>✓ Tout dans la 1ère tranche (≤ 130 kWh)</span>];
  } else if (bill.t === 2) {
    const c1 = T1_MAX * T1_RATE;
    const c2 = (totalKwh - T1_MAX) * T2_RATE;
    breakdownRows = [
      <span key="t1" style={{ color: '#22c55e' }}>130 kWh × 350 Ar = {numfmt(c1)} Ar</span>,
      <span key="t2" style={{ color: '#eab308' }}>{(totalKwh - T1_MAX).toFixed(1)} kWh × 580 Ar = {numfmt(c2)} Ar</span>,
    ];
  } else if (bill.t === 3) {
    const c1 = T1_MAX * T1_RATE;
    const c2 = (T2_MAX - T1_MAX) * T2_RATE;
    const c3 = (totalKwh - T2_MAX) * T3_RATE;
    breakdownRows = [
      <span key="t1" style={{ color: '#22c55e' }}>130 kWh × 350 Ar = {numfmt(c1)} Ar</span>,
      <span key="t2" style={{ color: '#eab308' }}>170 kWh × 580 Ar = {numfmt(c2)} Ar</span>,
      <span key="t3" style={{ color: '#f97316' }}>{(totalKwh - T2_MAX).toFixed(1)} kWh × 760 Ar = {numfmt(c3)} Ar</span>,
    ];
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.box} role="dialog" aria-modal aria-label="Résultat facture">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        <div className={styles.title}>⚡ RÉSULTAT — FACTURE ESTIMÉE</div>

        {/* Device rows */}
        <div className={styles.rows}>
          {rows.length > 0
            ? rows.map((r, i) => (
                <div key={i} className={styles.row}>
                  <span className={styles.devLabel}>
                    <span className={styles.devIcon}>{r.icon}</span>
                    {r.name}
                    <span className={styles.devTime}>{fmtTime(r.h)}/j</span>
                  </span>
                  <span className={styles.devKwh}>{r.kwh.toFixed(2)} kWh</span>
                </div>
              ))
            : <p className={styles.empty}>Aucun appareil sélectionné.</p>
          }
        </div>

        <hr className={styles.divider} />

        {/* Total */}
        <div className={styles.totalLbl}>Coût mensuel estimé (30 jours)</div>
        <div className={styles.totalNum}>{numfmt(bill.cost)}</div>
        <div className={styles.totalUnit}>Ariary / mois · {totalKwh.toFixed(2)} kWh</div>

        {bill.t > 0 && (
          <div className={styles.tranche} style={{ color: bill.color, borderColor: `${bill.color}55` }}>
            {bill.label} · {bill.rate} Ar/kWh
          </div>
        )}

        {breakdownRows && (
          <div className={styles.breakdown}>
            {breakdownRows}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={handleSaveToHistory}
          >
            💾 Enregistrer au suivi
          </button>
          <button
            className={styles.btnOutline}
            onClick={() => exportPDF(times, customs, monthlyData)}
          >
            ⬇ Export PDF
          </button>
          <button className={styles.btnOutline} onClick={onClose}>📊 Fermer (démo)</button>
        </div>
      </div>
    </div>
  );
}
