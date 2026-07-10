import { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register controllers/elements once for the app
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function useChart(canvasRef, config, deps = []) {
  const instRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    // destroy any existing Chart tied to this canvas
    try {
      const existing = Chart.getChart?.(canvas);
      if (existing) existing.destroy();
    } catch (e) {
      // ignore
    }

    if (instRef.current) {
      try { instRef.current.destroy(); } catch (e) { /* ignore */ }
      instRef.current = null;
    }

    try {
      canvas.style.background = 'transparent';
    } catch (e) { /* ignore */ }

    try {
      instRef.current = new Chart(canvas, config);
    } catch (err) {
      console.error('useChart: failed to create Chart.js instance', err);
    }

    return () => {
      if (instRef.current) {
        try { instRef.current.destroy(); } catch (e) { /* ignore */ }
        instRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return instRef;
}