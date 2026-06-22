import React, { useState } from 'react';
import { APPS, totalKwh, calcBill, numfmt, trancheColor } from '../utils/electricity.js';
import CircularGauge from '../components/CircularGauge.jsx';
import DeviceCard    from '../components/DeviceCard.jsx';
import FloatPanel    from '../components/FloatPanel.jsx';
import BillModal     from '../components/BillModal.jsx';
import styles from './CalcPage.module.css';

export default function CalcPage({ times, customs, setDeviceTime, setCustomTime, addCustomDevice, resetAll, monthlyData, autoSaveCalc }) {
  const [activeKey,   setActiveKey]   = useState(null);
  const [origVal,     setOrigVal]     = useState(0);
  const [showBill,    setShowBill]    = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newWatts,    setNewWatts]    = useState('');
  const [newIcon,     setNewIcon]     = useState('');

  const kwh  = totalKwh(times, customs);
  const bill = calcBill(kwh);
  const col  = trancheColor(kwh);

  const openPanel = (key, currentVal) => {
    if (activeKey === key) {
      setActiveKey(null);
    } else {
      setOrigVal(currentVal);
      setActiveKey(key);
    }
  };

  const closePanel = () => setActiveKey(null);

  const handleAddDevice = () => {
    const name  = newName.trim();
    const watts = parseInt(newWatts, 10);
    const icon  = newIcon.trim() || '🔌';
    if (!name || !watts || watts <= 0) { alert('Remplissez le nom et la puissance.'); return; }
    addCustomDevice(name, watts, icon);
    setNewName(''); setNewWatts(''); setNewIcon('');
    setShowAddForm(false);
  };

  const handleOpenBill = () => {
    if (kwh > 0) autoSaveCalc(kwh, bill.cost);
    setShowBill(true);
  };

  return (
    <div className={styles.page}>
      {/* Top gauge bar */}
      <div className={styles.gaugeBar}>
        <div className={styles.gaugeInfo}>
          <div className={styles.gaugeLabel}>⚡ Simulateur en temps réel</div>
          <div className={styles.gaugeMeta}>
            <div className={styles.metaChip} style={{ borderColor: `${col}44` }}>
              <span className={styles.metaNum} style={{ color: col }}>{kwh.toFixed(1)}</span>
              <span className={styles.metaUnit}>kWh/mois</span>
            </div>
            <div className={styles.metaChip} style={{ borderColor: `${col}44` }}>
              <span className={styles.metaNum} style={{ color: col }}>{numfmt(bill.cost)}</span>
              <span className={styles.metaUnit}>Ar/mois</span>
            </div>
            {bill.t > 0 && (
              <div className={styles.metaChip} style={{ borderColor: `${bill.color}44` }}>
                <span className={styles.metaNum} style={{ color: bill.color, fontSize: '0.72rem' }}>{bill.label}</span>
                <span className={styles.metaUnit}>{bill.rate} Ar/kWh</span>
              </div>
            )}
          </div>
        </div>
        <CircularGauge kwh={kwh} />
      </div>

      {/* Device grid */}
      <div className={styles.grid}>
        {/* Built-in devices */}
        {APPS.map((app, i) => {
          const key    = `b-${i}`;
          const isOpen = activeKey === key;
          return (
            <React.Fragment key={app.id}>
              <DeviceCard
                app={app}
                value={times[i] || 0}
                isOpen={isOpen}
                onClick={() => openPanel(key, times[i] || 0)}
              />
              {isOpen && (
                <FloatPanel
                  center
                  // withOverlay
                  app={app}
                  value={times[i] || 0}
                  onChange={(v) => setDeviceTime(i, v)}
                  onClose={closePanel}
                  onReset={() => { setDeviceTime(i, 0); }}
                  onDiscard={() => { setDeviceTime(i, origVal); closePanel(); }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Custom devices */}
        {customs.map((c, i) => {
          const key    = `c-${i}`;
          const isOpen = activeKey === key;
          return (
            <React.Fragment key={`custom-${i}`}>
              <DeviceCard
                app={c}
                value={c.h || 0}
                isOpen={isOpen}
                onClick={() => openPanel(key, c.h || 0)}
              />
              {isOpen && (
                <FloatPanel
                  app={c}
                  value={c.h || 0}
                  onChange={(v) => setCustomTime(i, v)}
                  onClose={closePanel}
                  onReset={() => setCustomTime(i, 0)}
                  onDiscard={() => { setCustomTime(i, origVal); closePanel(); }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Add device card */}
        <div className={styles.addCard} onClick={() => setShowAddForm(v => !v)} role="button" tabIndex={0}>
          <div className={styles.addPlus}>＋</div>
          <div className={styles.addLbl}>Ajouter</div>
        </div>
      </div>

      {/* Add device form - Modal overlay */}
      {showAddForm && (
        <>
          <div className={styles.addFormOverlay} onClick={() => setShowAddForm(false)} />
          <div className={styles.addFormModal}>
            <div className={styles.addFormHeader}>
              <span>⚙️</span>
              <span className={styles.addFormTitle}>Nouvel appareil</span>
              <button className={styles.addFormClose} onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div className={styles.addFormRow}>
              <div className={styles.addFormField}>
                <label className={styles.addFormLabel}>Nom</label>
                <input
                  className={styles.addFormIn}
                  type="text"
                  placeholder="Ex: Chauffe-eau"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className={styles.addFormField} style={{ maxWidth: 100 }}>
                <label className={styles.addFormLabel}>Watts</label>
                <input
                  className={styles.addFormIn}
                  type="number" min={1}
                  placeholder="1200"
                  value={newWatts}
                  onChange={(e) => setNewWatts(e.target.value)}
                />
              </div>
              <div className={styles.addFormField} style={{ maxWidth: 80 }}>
                <label className={styles.addFormLabel}>Icône</label>
                <input
                  className={styles.addFormIn}
                  type="text"
                  placeholder="🔌"
                  maxLength={2}
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                />
              </div>
            </div>
            <button className={styles.addFormBtn} onClick={handleAddDevice}>+ Ajouter</button>
          </div>
        </>
      )}

      {/* Calc bar */}
      <div className={styles.calcBar}>
        <div>
          <div className={styles.calcKwh} style={{ color: col }}>{kwh.toFixed(2)} kWh</div>
          <div className={styles.calcLbl}>Consommation mensuelle estimée</div>
        </div>
        <div className={styles.calcActions}>
          <button className={styles.btnOutline} onClick={resetAll}>↺ Réinit.</button>
          <button className={styles.btnPrimary} onClick={handleOpenBill}>CALCULER MA FACTURE</button>
        </div>
      </div>

      {/* Bill modal */}
      {showBill && (
        <BillModal
          times={times}
          customs={customs}
          monthlyData={monthlyData}
          onClose={() => setShowBill(false)}
        />
      )}
    </div>
  );
}
