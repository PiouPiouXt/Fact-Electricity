/* ── Tariff constants ── */
export const T1_MAX = 130;
export const T1_RATE = 350;
export const T2_MAX = 300;
export const T2_RATE = 580;
export const T3_RATE = 760;

/* ── Device catalogue ── */
export const APPS = [
  { id: 'ampoule',   name: 'Ampoule LED',      watts: 10,   icon: '💡', priority: 10 },
  { id: 'frigo',     name: 'Réfrigérateur',     watts: 200,  icon: '🧊', priority: 9  },
  { id: 'ordi',      name: 'Ordinateur',        watts: 150,  icon: '💻', priority: 8  },
  { id: 'tv',        name: 'Téléviseur',        watts: 100,  icon: '📺', priority: 7  },
  { id: 'ventilo',   name: 'Ventilateur',       watts: 50,   icon: '🌀', priority: 6  },
  { id: 'micro',     name: 'Micro-ondes',       watts: 900,  icon: '📡', priority: 5  },
  { id: 'machine',   name: 'Machine à laver',   watts: 800,  icon: '🫧', priority: 4  },
  { id: 'fer',       name: 'Fer à repasser',    watts: 1000, icon: '🔲', priority: 3  },
  { id: 'clim',      name: 'Climatiseur',       watts: 1500, icon: '❄️', priority: 2  },
];

/* Practical daily usage hours per device when on "normal" usage */
export const DEVICE_TYPICAL_HOURS = {
  ampoule:  6,
  frigo:    24,
  ordi:     4,
  tv:       3,
  ventilo:  5,
  micro:    0.5,
  machine:  1,
  fer:      0.5,
  clim:     2,
};

export const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

export const CHIPS_M = [
  { l: '5min',  v: 5 / 60  },
  { l: '10min', v: 10 / 60 },
  { l: '15min', v: 0.25    },
  { l: '20min', v: 20 / 60 },
  { l: '30min', v: 0.5     },
  { l: '45min', v: 0.75    },
];

export const CHIPS_H = [
  { l: '1h',  v: 1  },
  { l: '2h',  v: 2  },
  { l: '3h',  v: 3  },
  { l: '4h',  v: 4  },
  { l: '6h',  v: 6  },
  { l: '8h',  v: 8  },
  { l: '12h', v: 12 },
  { l: '24h', v: 24 },
];

/* ── Tariff calculation ── */
export function calcBill(kwh) {
  if (kwh <= 0)      return { cost: 0,       t: 0, label: '—',             rate: 0,       color: '#555' };
  if (kwh <= T1_MAX) return { cost: kwh * T1_RATE,                                         t: 1, label: '1ère tranche', rate: T1_RATE, color: '#22c55e' };
  if (kwh <= T2_MAX) return { cost: T1_MAX * T1_RATE + (kwh - T1_MAX) * T2_RATE,           t: 2, label: '2ème tranche', rate: T2_RATE, color: '#eab308' };
  return               { cost: T1_MAX * T1_RATE + (T2_MAX - T1_MAX) * T2_RATE + (kwh - T2_MAX) * T3_RATE, t: 3, label: '3ème tranche', rate: T3_RATE, color: '#f97316' };
}

/* ── Inverse budget allocation ──
   Priority-weighted: high-priority devices get more hours first.
   Ensures final bill matches the input budget by iterative redistribution.
*/
export function calcInverse(budgetAr) {
  if (!budgetAr || budgetAr <= 0) return [];

  // How many kWh can we buy for this budget?
  let targetKwh;
  if (budgetAr <= T1_MAX * T1_RATE) {
    targetKwh = budgetAr / T1_RATE;
  } else if (budgetAr <= T1_MAX * T1_RATE + (T2_MAX - T1_MAX) * T2_RATE) {
    targetKwh = T1_MAX + (budgetAr - T1_MAX * T1_RATE) / T2_RATE;
  } else {
    targetKwh = T2_MAX + (budgetAr - T1_MAX * T1_RATE - (T2_MAX - T1_MAX) * T2_RATE) / T3_RATE;
  }

  // First pass: allocate by priority proportionally, capped at typical
  const totalPriority = APPS.reduce((s, a) => s + a.priority, 0);
  let allocation = APPS.map((app) => {
    const typicalH = DEVICE_TYPICAL_HOURS[app.id] ?? 2;
    const maxKwh = (app.watts * typicalH * 30) / 1000;
    const shareKwh = (app.priority / totalPriority) * targetKwh;
    const allocKwh = Math.min(shareKwh, maxKwh);
    return { app, allocKwh, maxKwh, typicalH };
  });

  // Second pass: redistribute unused capacity to higher-priority devices
  let totalAllocKwh = allocation.reduce((s, a) => s + a.allocKwh, 0);
  let remainingKwh = targetKwh - totalAllocKwh;
  
  // Sort by priority (descending) for redistribution
  const sorted = allocation
    .map((a, i) => ({ ...a, originalIndex: i, priority: APPS[i].priority }))
    .sort((a, b) => b.priority - a.priority);

  // Give remaining kWh to devices that haven't reached their typical max
  for (let i = 0; i < sorted.length && remainingKwh > 0; i++) {
    const current = sorted[i];
    const availableSpace = current.maxKwh - current.allocKwh;
    if (availableSpace > 0) {
      const toAdd = Math.min(availableSpace, remainingKwh);
      current.allocKwh += toAdd;
      remainingKwh -= toAdd;
    }
  }

  // Convert allocKwh back to hours and restore original order
  const result = new Array(APPS.length);
  sorted.forEach((item) => {
    const suggestedH = (item.allocKwh * 1000) / (item.app.watts * 30);
    result[item.originalIndex] = { ...item.app, suggestedH };
  });

  return result;
}

/* ── Formatting helpers ── */
export function fmtTime(h) {
  if (!h || h <= 0) return '0';
  const H = Math.floor(h);
  const M = Math.min(59, Math.round((h % 1) * 60));
  if (H > 0 && M > 0) return `${H}h ${M}m`;
  if (H > 0)           return `${H}h`;
  return                      `${M}min`;
}

export function padZero(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export function fmtMins(v) {
  return String(Math.min(59, Math.round((v % 1) * 60))).padStart(2, '0');
}

export function numfmt(n) {
  return Math.round(n).toLocaleString('fr-FR');
}

export function trancheColor(kwh) {
  if (kwh <= 0)      return '#555';
  if (kwh <= T1_MAX) return '#22c55e';
  if (kwh <= T2_MAX) return '#eab308';
  return '#f97316';
}

export function totalKwh(times, customs) {
  let k = 0;
  APPS.forEach((a, i) => { k += (a.watts * (times[i] || 0) * 30) / 1000; });
  customs.forEach((c)  => { k += (c.watts  * (c.h     || 0) * 30) / 1000; });
  return k;
}
