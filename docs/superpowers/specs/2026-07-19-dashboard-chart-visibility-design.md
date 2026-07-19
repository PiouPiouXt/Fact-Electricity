# Fix: Dashboard chart only appears after the 2nd calculation

**Date:** 2026-07-19
**Status:** Approved (design)

## Problem

When a user saves a calculation (Calculator → `CALCULER MA FACTURE` → `Enregistrer au
suivi`) and then opens the Dashboard tab, the monthly consumption chart ("Graphique de
consommation mensuelle") is blank. It only appears after a second save.

### Root cause

In `App.jsx`, all three pages (`CalcPage`, `InversePage`, `DashboardPage`) are mounted
simultaneously and switched via `display: none` / `display: block` — they are never
unmounted.

`DashboardPage` creates its Chart.js instance (`useChart`) as soon as `monthlyData`
gains its first entry. But at that moment the Dashboard tab is hidden
(`display:none`), so the chart's `<canvas>` measures **0×0** and renders invisibly.
Switching to the Dashboard tab does not reliably force Chart.js (v4.5.1) to re-measure,
so the chart stays blank until a later event (a second save / a resize) recreates it at
a real size — the "appears after two" behavior.

The canvas only exists in the DOM when `monthlyData.length > 0`
(`DashboardPage.jsx` lines 137–141), and the chart effect deps are
`monthlyData.length > 0 && !hasInvalid ? [monthlyData] : []` (line 85).

## Approach

**Gate the canvas + chart creation on tab visibility (Approach A).** Pass an `active`
prop into `DashboardPage`; only mount the `<canvas>` when the tab is actually visible
*and* there is data. `useChart` already keys off the canvas ref, so the chart is then
only ever created against a laid-out, visible container → correct size on the first try.
Leaving the tab triggers the effect cleanup, which destroys the chart.

This is preferred over:
- *Approach B* (call `chart.resize()` on tab open): smaller render change but the chart
  is still created once at 0×0 while hidden; relies on `resize()` recovering.
- *Approach C* (mount only the active page): definitely visible, but unmounts
  Calculator/Inverse on every switch and loses their in-progress UI state.

## Changes

### `src/App.jsx`
Pass an `active` flag to the dashboard (one line):
```jsx
<DashboardPage
  active={tab === 'dash'}
  monthlyData={monthlyData}
  addMonthEntry={addMonthEntry}
  removeMonthEntry={removeMonthEntry}
  times={times}
  customs={customs}
/>
```

### `src/pages/DashboardPage.jsx`
1. Accept the `active` prop in the function signature.
2. Only render the `<canvas>` when the tab is active **and** data exists; otherwise show
   the existing empty-state placeholder:
   ```jsx
   {active && monthlyData.length > 0
     ? <div className={styles.chartWrap} style={{ minHeight: 220 }}>
         <canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" />
       </div>
     : <div className={styles.emptyChart}>Aucune donnée. Ajoutez votre première facture ci-dessous.</div>}
   ```
3. Include `active` in the chart effect deps so the chart is (re)built when the tab opens
   and torn down when it closes:
   ```jsx
   useChart(chartRef, chartConfig,
     active && monthlyData.length > 0 && !hasInvalid ? [monthlyData] : []);
   ```

### `src/hooks/useChart.js`
**No changes.** It already keys off the canvas ref and destroys/recreates the instance
via its effect + cleanup. The caller now controls *when* the canvas exists, which is what
gates chart creation.

## Behavior & edge cases

- **First save now works:** save a calc while on the Calculator tab → switch to Dashboard.
  `active` flips `false→true`, the canvas mounts, the effect re-runs, and Chart.js
  measures a visible container → correct size on the first try.
- **Leaving the tab** (`active` `true→false`): deps change triggers the effect cleanup,
  which destroys the chart — no stale/duplicate Chart.js instances on the same canvas
  (also pre-empts a latent "canvas already in use" bug).
- **Adding entries on the Dashboard itself** (form): canvas already mounted,
  `monthlyData` reference changes → chart updates as before.
- **Invalid data** (non-finite cost/kWh): no chart is built (deps resolve to `[]`), so a
  blank canvas is shown rather than the chart — same safe behavior as today. The
  "Aucune donnée" placeholder only appears when there is genuinely no entry yet.
- **Other tabs' state preserved:** pages stay mounted via `display:none`; only the canvas
  mount is gated, so Calculator/Inverse in-progress UI (open FloatPanel, draft device) is
  untouched.

## Verification

No test framework is configured. Verification is manual + a clean build:

1. From Calculator: **CALCULER MA FACTURE → Enregistrer au suivi → open Dashboard** →
   chart appears immediately (no 2nd save required).
2. Add a 2nd entry via the Dashboard form → chart updates.
3. Switch to Calculator and back to Dashboard → chart still renders.
4. `npm run build` succeeds with no console errors and no "Canvas already in use" warnings.
