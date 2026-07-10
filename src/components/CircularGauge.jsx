import React, { useEffect, useRef } from 'react';
import { trancheColor, T1_MAX, T2_MAX } from '../utils/electricity.js';
import styles from './CircularGauge.module.css';

const CX = 100, CY = 105, R = 84;

function gaugePt(frac) {
  const angle = Math.PI * frac;
  return {
    x: CX - R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  };
}

export default function CircularGauge({ kwh, animated = true }) {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const currentRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const target = Math.min(350, Math.max(0, kwh));

    if (!animated) {
      currentRef.current = target;
      draw(ctx, target);
      return;
    }

    const start    = currentRef.current;
    const diff     = target - start;
    const duration = 900;
    const t0       = performance.now();

    function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      currentRef.current = start + diff * ease;
      draw(ctx, currentRef.current);
      if (p < 1) animRef.current = requestAnimationFrame(step);
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [kwh, animated]);

  function draw(ctx, value) {
    const W = 200, H = 130;
    ctx.clearRect(0, 0, W, H);
    const frac = Math.min(1, value / 300);
    const col  = trancheColor(value);
    const t1f  = T1_MAX / 300;
    const t2f  = T2_MAX / 300;
    const ep   = gaugePt(frac);
    const t1p  = gaugePt(t1f);
    const t2p  = gaugePt(t2f);

    /* Track */
    ctx.beginPath();
    ctx.arc(CX, CY, R, Math.PI, 0, false);
    ctx.strokeStyle = '#181828';
    ctx.lineWidth   = 13;
    ctx.lineCap     = 'round';
    ctx.stroke();

    /* T1 zone */
    ctx.beginPath();
    ctx.arc(CX, CY, R, Math.PI, Math.PI + t1f * Math.PI, false);
    ctx.strokeStyle = 'rgba(34,197,94,0.18)';
    ctx.lineWidth   = 10;
    ctx.stroke();

    /* T2 zone */
    ctx.beginPath();
    ctx.arc(CX, CY, R, Math.PI + t1f * Math.PI, Math.PI + t2f * Math.PI, false);
    ctx.strokeStyle = 'rgba(234,179,8,0.14)';
    ctx.lineWidth   = 10;
    ctx.stroke();

    /* Filled arc */
    if (value > 0) {
      ctx.beginPath();
      ctx.arc(CX, CY, R, Math.PI, Math.PI + frac * Math.PI, false);
      ctx.strokeStyle = col;
      ctx.lineWidth   = 9;
      ctx.lineCap     = 'round';
      ctx.shadowColor = col;
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    /* Separator lines */
    [[t1f, '#22c55e'], [t2f, '#eab308']].forEach(([f, c]) => {
      const pt  = gaugePt(f);
      const ang = Math.PI * f;
      const nx  = Math.cos(ang), ny = Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(CX - (R - 8) * nx, CY - (R - 8) * ny);
      ctx.lineTo(CX - (R + 8) * nx, CY - (R + 8) * ny);
      ctx.strokeStyle = value * f > 0 ? c : c + '44';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 0;
      ctx.stroke();
    });

    /* Needle dot */
    const dotX = value > 0 ? ep.x : CX - R;
    const dotY = value > 0 ? ep.y : CY;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle   = col;
    ctx.shadowColor = col;
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur  = 0;

    /* Labels */
    ctx.font          = '500 9px JetBrains Mono, monospace';
    ctx.fillStyle     = '#333';
    ctx.textAlign     = 'left';
    ctx.textBaseline  = 'middle';
    ctx.fillText('0', CX - R - 14, CY + 5);
    ctx.textAlign = 'right';
    ctx.fillText('300', CX + R + 14, CY + 5);

    /* T1/T2 labels */
    ctx.font      = '500 8px JetBrains Mono, monospace';
    ctx.fillStyle = value > 0 && value <= T1_MAX ? 'rgba(34,197,94,0.8)' : 'rgba(34,197,94,0.25)';
    ctx.textAlign = 'center';
    const m1 = gaugePt(t1f * 0.5);
    ctx.fillText('T1', m1.x - 4, m1.y - 4);

    ctx.fillStyle = value > T1_MAX ? 'rgba(234,179,8,0.8)' : 'rgba(234,179,8,0.25)';
    const m2 = gaugePt(t1f + (t2f - t1f) * 0.5);
    ctx.fillText('T2', m2.x - 2, m2.y - 4);

    if (value > T2_MAX) {
      ctx.fillStyle = 'rgba(249,115,22,0.9)';
      const m3 = gaugePt(t2f + (1 - t2f) * 0.5);
      ctx.fillText('T3', m3.x + 2, m3.y - 4);
    }
  }

  const col = trancheColor(kwh);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} width={200} height={130} className={styles.canvas} />
      <div className={styles.center}>
        <div className={styles.kwhNum} style={{ color: col }}>{kwh.toFixed(1)}</div>
        <div className={styles.kwhUnit}>kWh/mois</div>
      </div>
    </div>
  );
}
