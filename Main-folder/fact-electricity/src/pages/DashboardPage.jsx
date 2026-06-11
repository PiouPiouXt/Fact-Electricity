import React, { useState, useEffect, useRef } from 'react';
import { useChart } from '../hooks/useChart.js';
import { MONTHS, numfmt } from '../utils/electricity.js';
import { exportPDF } from '../utils/exportPDF.js';
import styles from './DashboardPage.module.css';


const NOW = new Date();

export default function DashboardPage({ monthlyData, addMonthEntry, removeMonthEntry, times, customs }) {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [month, setMonth] = useState(NOW.getMonth());
  const [year, setYear] = useState(NOW.getFullYear());
  const [cost, setCost] = useState('');
  const [kwh, setKwh] = useState('');

  const avg = monthlyData.length > 0 ? monthlyData.reduce((s, d) => s + d.cost, 0) / monthlyData.length : 0;
  const peak = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.cost)) : 0;
  const totKwh = monthlyData.reduce((s, d) => s + d.kwh, 0);


    // build chart config from monthlyData
  const chartConfig = {
    type: 'bar',
    data: {
      labels: monthlyData.map((d) => `${MONTHS[d.month]} ${d.year}`),
      datasets: [
        {
          label: 'Coût (Ar)',
          data: monthlyData.map((d) => d.cost),
          backgroundColor: 'rgba(245,197,24,0.75)',
          borderColor: '#f5c518',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'kWh',
          data: monthlyData.map((d) => d.kwh),
          backgroundColor: 'rgba(59,130,246,0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f0f1a',
          borderColor: '#252535',
          borderWidth: 1,
          titleColor: '#f0f0fa',
          bodyColor: '#5a5a7a',
        },
      },
      scales: {
        y: {
          position: 'left',
          grid: { color: '#181828' },
          ticks: { color: '#5a5a7a', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => numfmt(v) + ' Ar' },
        },
        y2: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#3b82f6', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => v + ' kWh' },
        },
        x: {
          grid: { color: '#0f0f1a' },
          ticks: { color: '#444', font: { family: 'JetBrains Mono', size: 9 } },
        },
      },
    },
  };

  // Validate data to avoid creating charts with invalid values
  const hasInvalid = monthlyData.some(d => !isFinite(d.cost) || !isFinite(d.kwh));
  // only attach chart when valid and not empty
  useChart(chartRef, chartConfig, monthlyData.length > 0 && !hasInvalid ? [monthlyData] : []);

  const handleAdd = () => {
    const c = parseFloat(cost.replace(/\s/g, '').replace(',', '.'));
    const k = parseFloat(kwh.replace(/\s/g, '').replace(',', '.'));
    if (!c && !k) return;
    addMonthEntry(month, year, c || 0, k || 0);
    setCost(''); setKwh('');
  };

  const yearOptions = [];
  for (let y = NOW.getFullYear() - 3; y <= NOW.getFullYear() + 1; y++) yearOptions.push(y);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Suivi mensuel</h2>
        <button className={styles.btnExport} onClick={() => exportPDF(times, customs, monthlyData)}>
          ⬇ Export PDF
        </button>
      </div>

      {/* Stats strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLbl}>Mois enregistrés</div>
          <div className={styles.statNum} style={{ color: 'var(--y)' }}>{monthlyData.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLbl}>Coût moyen</div>
          <div className={styles.statNum} style={{ color: 'var(--y)' }}>{numfmt(avg)} Ar</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLbl}>Pic mensuel</div>
          <div className={styles.statNum}>{numfmt(peak)} Ar</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLbl}>Total kWh</div>
          <div className={styles.statNum}>{totKwh.toFixed(1)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>
          📊 Évolution de la consommation
          <span className={styles.legend}>
            <span className={styles.legendDot} style={{ background: '#f5c518' }} />Coût (Ar)
            <span className={styles.legendDot} style={{ background: '#3b82f6', marginLeft: 10 }} />kWh
          </span>
        </div>
        {monthlyData.length > 0
          // ? <div className={styles.chartWrap}><canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" /></div>
          ? <div className={styles.chartWrap} style={{ minHeight: 220 }}><canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" /></div>
          : <div className={styles.emptyChart}>Aucune donnée. Ajoutez votre première facture ci-dessous.</div>
        }
      </div>

      {/* Add form */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>➕ Ajouter une facture réelle</div>
        <div className={styles.addRow}>
          <div className={styles.addField}>
            <span className={styles.addLbl}>Mois</span>
            <select className={styles.addIn} value={month} onChange={(e) => setMonth(+e.target.value)}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div className={styles.addField}>
            <span className={styles.addLbl}>Année</span>
            <select className={styles.addIn} value={year} onChange={(e) => setYear(+e.target.value)}>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className={styles.addField}>
            <span className={styles.addLbl}>Coût réel (Ar)</span>
            <input
              className={styles.addIn}
              type="text"
              inputMode="numeric"
              placeholder="45 000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className={styles.addField}>
            <span className={styles.addLbl}>kWh réel</span>
            <input
              className={styles.addIn}
              type="text"
              inputMode="numeric"
              placeholder="128"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
            />
          </div>
          <button className={styles.btnAdd} onClick={handleAdd}>+ Ajouter</button>
        </div>
      </div>

      {/* History list */}
      {monthlyData.length > 0 && (
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>📋 Historique des factures</div>
          <div className={styles.histList}>
            {[...monthlyData].reverse().map((d, ri) => {
              const actualIdx = monthlyData.length - 1 - ri;
              return (
                <div key={`${d.year}-${d.month}-${ri}`} className={styles.histRow}>
                  <div className={styles.histLeft}>
                    <span className={styles.histTag}>{MONTHS[d.month]} {d.year}</span>
                    {d._auto && <span className={styles.histAuto}>AUTO</span>}
                  </div>
                  <div className={styles.histRight}>
                    <span className={styles.histKwh}>{d.kwh} kWh</span>
                    <span className={styles.histCost}>{numfmt(d.cost)} Ar</span>
                    <button
                      className={styles.histDel}
                      onClick={() => removeMonthEntry(actualIdx)}
                      aria-label="Supprimer"
                    >✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
