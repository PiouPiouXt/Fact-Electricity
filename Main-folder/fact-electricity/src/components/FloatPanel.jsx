import React, { useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CHIPS_M, CHIPS_H, fmtTime } from '../utils/electricity.js';
import styles from './FloatPanel.module.css';

function padZ(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }
function fmtM(v) { return String(Math.min(59, Math.round((v % 1) * 60))).padStart(2, '0'); }

export default function FloatPanel({
  app,
  value,
  onChange,
  onClose,
  onReset,
  onDiscard,
  center = false,
  withOverlay = true
}) {
  const H   = Math.floor(value);
  const M   = Math.min(59, Math.round((value % 1) * 60));
  const pct = (value / 24) * 100;
  const isDragging = useRef(false);
  const trackRef   = useRef(null);

  const clamp = (v) => Math.max(0, Math.min(24, parseFloat(v.toFixed(6))));

  const stepH = (d) => {
    const next = Math.floor(value) + d + (value % 1);
    onChange(clamp(next));
  };
  const stepM = (d) => {
    const ms = Math.round(value * 60) + d;
    onChange(clamp(ms / 60));
  };

  const handleSlider = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(clamp(Math.round(ratio * 24 * 60) / 60));
  }, [onChange]);

  const onMouseDown = (e) => {
    isDragging.current = true;
    handleSlider(e.clientX);
    const onMove = (ev) => { if (isDragging.current) handleSlider(ev.clientX); };
    const onUp   = ()   => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchStart = (e) => {
    handleSlider(e.touches[0].clientX);
    const onMove = (ev) => handleSlider(ev.touches[0].clientX);
    const onEnd  = ()   => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  const notches = Array.from({ length: 49 }, (_, q) => {
    const qv  = q * 0.5;
    const on  = value >= qv;
    const maj = Number.isInteger(qv) && [0, 4, 8, 12, 16, 20, 24].includes(qv);
    return { qv, on, maj, lbl: maj ? `${qv}h` : '' };
  });

  // Inline container classes (kept for non-centered inline rendering)
  const panelClasses = [styles.panel];
  if (center) panelClasses.push(styles.center);

  // Inner content (the animating element)
  const inner = (
    <>
      {withOverlay && <div className={styles.overlay} onClick={onClose} />}
      <div className={styles.panelContent} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.icon}>{app.icon}</span>
          <span className={styles.title}>{app.name}</span>
          <span className={styles.watts}>· {app.watts}W</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Time display + steppers */}
        <div className={styles.timeRow}>
          <div className={styles.segment}>
            <div className={styles.steppers}>
              <button className={styles.sb} onClick={() => stepH(1)}>▲</button>
              <button className={styles.sb} onClick={() => stepH(-1)}>▼</button>
            </div>
            <div className={styles.segVal}>
              <div className={`${styles.timeNum} ${H === 0 ? styles.zero : styles.lit}`}>{padZ(value)}</div>
              <div className={styles.timeUnit}>H</div>
            </div>
          </div>

          <div className={`${styles.sep} ${value > 0 ? styles.sepLit : ''}`}>:</div>

          <div className={styles.segment}>
            <div className={styles.steppers}>
              <button className={styles.sb} onClick={() => stepM(1)}>▲</button>
              <button className={styles.sb} onClick={() => stepM(-1)}>▼</button>
            </div>
            <div className={styles.segVal}>
              <div className={`${styles.timeNum} ${H === 0 && M === 0 ? styles.zero : styles.lit}`}>{fmtM(value)}</div>
              <div className={styles.timeUnit}>MIN</div>
            </div>
          </div>

          <div className={styles.fmtTime}>{fmtTime(value)}<span className={styles.fmtUnit}>/jour</span></div>
        </div>

        {/* Slider */}
        <div
          ref={trackRef}
          className={styles.track}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={24}
        >
          <div className={styles.fill}  style={{ width: `${pct}%` }} />
          <div className={styles.thumb} style={{ left: `${pct}%` }} />
        </div>
        <div className={styles.notches}>
          {notches.map((n, i) => (
            <div key={i} className={styles.notch}>
              <div className={`${styles.notchBar} ${n.maj ? styles.major : ''} ${n.on ? styles.notchOn : ''}`} />
              {n.lbl && <span className={`${styles.notchLbl} ${n.on ? styles.notchLblOn : ''}`}>{n.lbl}</span>}
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className={styles.chipsLbl}>Raccourcis minutes</div>
        <div className={styles.chips}>
          {CHIPS_M.map((c) => (
            <button
              key={c.l}
              className={`${styles.chip} ${Math.abs(value - c.v) < 0.001 ? styles.chipOn : ''}`}
              onClick={() => onChange(c.v)}
            >{c.l}</button>
          ))}
        </div>
        <div className={styles.chipsLbl}>Raccourcis heures</div>
        <div className={styles.chips}>
          {CHIPS_H.map((c) => (
            <button
              key={c.l}
              className={`${styles.chip} ${Math.abs(value - c.v) < 0.001 ? styles.chipOn : ''}`}
              onClick={() => onChange(c.v)}
            >{c.l}</button>
          ))}
        </div>

         {/* Free input */}
       <div className={styles.freeRow}>
          <span className={styles.freeLbl}>Saisie libre</span>
          <input
            className={styles.freeIn}
            type="number" min={0} max={23}
            placeholder="H"
            value={H || ''}
            onChange={(e) => {
              const n = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
              onChange(clamp(n + (value % 1)));
            }}
          />
          <span className={styles.freeSep}>h</span>
          <input
            className={styles.freeIn}
            type="number" min={0} max={59}
            placeholder="MM"
            value={M || ''}
            onChange={(e) => {
              const n = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
              onChange(clamp(Math.floor(value) + n / 60));
            }}
          />
          <span className={styles.freeUnit}>min</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnDanger} onClick={onDiscard}>✕ Annuler</button>
          <button className={styles.btnGhost}  onClick={onReset}>↺ Réinit.</button>
        </div>
      </div>
    </>
  );

  // If centered, render via portal into document.body to avoid parent transform issues
  if (center) {
    if (typeof document === 'undefined') return null; // SSR safety
    return createPortal(
      <div className={styles.portalRoot}>
        {inner}
      </div>,
      document.body
    );
  }

  // Default inline rendering (keeps previous behavior)
  return (
    <div className={panelClasses.join(' ')}>
      {inner}
    </div>
  );
}
