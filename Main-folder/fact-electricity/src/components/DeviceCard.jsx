import React from 'react';
import { fmtTime } from '../utils/electricity.js';
import styles from './DeviceCard.module.css';

export default function DeviceCard({ app, value, isOpen, onClick }) {
  const active = value > 0;
  return (
    <div
      className={`${styles.card} ${active ? styles.active : ''} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {active && <div className={styles.check} aria-hidden>✓</div>}
      <div className={styles.icon}>{app.icon}</div>
      <div className={styles.name}>{app.name}</div>
      <div className={styles.watts}>{app.watts}W</div>
      {active && (
        <div className={styles.time}>{fmtTime(value)}/j</div>
      )}
    </div>
  );
}
