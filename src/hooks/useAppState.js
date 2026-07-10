import { useState, useCallback } from 'react';
import { APPS } from '../utils/electricity.js';

export function useAppState() {
  const [times,       setTimes]       = useState(APPS.map(() => 0));
  const [customs,     setCustoms]     = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const setDeviceTime = useCallback((index, value) => {
    const v = Math.max(0, Math.min(24, parseFloat(value.toFixed(6))));
    setTimes(prev => { const next = [...prev]; next[index] = v; return next; });
  }, []);

  const setCustomTime = useCallback((index, value) => {
    const v = Math.max(0, Math.min(24, parseFloat(value.toFixed(6))));
    setCustoms(prev => {
      const next = [...prev];
      next[index] = { ...next[index], h: v };
      return next;
    });
  }, []);

  const addCustomDevice = useCallback((name, watts, icon) => {
    setCustoms(prev => [...prev, { name, watts, icon, h: 0 }]);
  }, []);

  const resetAll = useCallback(() => {
    setTimes(APPS.map(() => 0));
    setCustoms(prev => prev.map(c => ({ ...c, h: 0 })));
  }, []);

  const applySuggestions = useCallback((suggestions) => {
    const clamp = (v) => Math.max(0, Math.min(24, parseFloat((v || 0).toFixed(6))));
    const newTimes = APPS.map((_, i) => clamp(suggestions[i]?.suggestedH ?? 0));
    setTimes(newTimes);
  }, []);

  const addMonthEntry = useCallback((month, year, cost, kwh) => {
    setMonthlyData(prev => {
      const next = [...prev, { month, year, cost, kwh }];
      return next.sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    });
  }, []);

  const removeMonthEntry = useCallback((index) => {
    setMonthlyData(prev => prev.filter((_, i) => i !== index));
  }, []);

  const autoSaveCalc = useCallback((kwh, cost) => {
    const now = new Date();
    setMonthlyData(prev => {
      const last = prev[prev.length - 1];
      if (last?._auto) {
        const next = [...prev];
        next[next.length - 1] = { month: now.getMonth(), year: now.getFullYear(), cost: Math.round(cost), kwh: parseFloat(kwh.toFixed(2)), _auto: true };
        return next;
      }
      return [...prev, { month: now.getMonth(), year: now.getFullYear(), cost: Math.round(cost), kwh: parseFloat(kwh.toFixed(2)), _auto: true }]
        .sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    });
  }, []);

  return {
    times, customs, monthlyData,
    setDeviceTime, setCustomTime,
    addCustomDevice, resetAll,
    applySuggestions,
    addMonthEntry, removeMonthEntry,
    autoSaveCalc,
  };
}
