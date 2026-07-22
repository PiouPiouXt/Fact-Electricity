# Dashboard Chart Visibility Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Dashboard monthly chart appear immediately after the first saved calculation, instead of only after a second save.

**Architecture:** Gate the chart `<canvas>` (and thus `useChart`'s Chart.js instance) on Dashboard-tab visibility. The canvas is only mounted when the tab is active *and* there is data, so Chart.js always measures a visible, laid-out container. `useChart` is unchanged — it already keys off the canvas ref and cleans up on unmount.

**Tech Stack:** React 18, Vite 5, Chart.js v4.5.1 (used via `useChart` hook). No test framework is configured in this repo; verification is `npm run build` + manual browser checks.

---

## File Structure

- **Modify `src/App.jsx`** — pass an `active` prop (`tab === 'dash'`) into `DashboardPage`.
- **Modify `src/pages/DashboardPage.jsx`** — accept `active`, gate the `<canvas>` mount on `active && monthlyData.length > 0`, and include `active` in the `useChart` dependency array.
- **No change to `src/hooks/useChart.js`** — confirmed correct as-is; the caller now controls when the canvas exists.

---

### Task 1: Pass `active` prop from App.jsx

**Files:**
- Modify: `src/App.jsx:56-64`

- [ ] **Step 1: Add the `active` prop to the DashboardPage element**

In `src/App.jsx`, the Dashboard is rendered inside a `display:none`/`display:block` wrapper. Add `active={tab === 'dash'}` as the first prop of `<DashboardPage>`:

```jsx
        <div style={{ display: tab === 'dash' ? 'block' : 'none' }}>
          <DashboardPage
            active={tab === 'dash'}
            monthlyData={monthlyData}
            addMonthEntry={addMonthEntry}
            removeMonthEntry={removeMonthEntry}
            times={times}
            customs={customs}
          />
        </div>
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds (no errors referencing App.jsx).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: pass active tab flag to DashboardPage"
```

---

### Task 2: Gate the canvas and chart effect on `active` in DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.jsx:10` (function signature)
- Modify: `src/pages/DashboardPage.jsx:85` (useChart deps)
- Modify: `src/pages/DashboardPage.jsx:137-141` (canvas render gate)

- [ ] **Step 1: Accept the `active` prop in the component signature**

Change line 10 from:
```jsx
export default function DashboardPage({ monthlyData, addMonthEntry, removeMonthEntry, times, customs }) {
```
to:
```jsx
export default function DashboardPage({ active, monthlyData, addMonthEntry, removeMonthEntry, times, customs }) {
```

- [ ] **Step 2: Include `active` in the chart effect dependencies**

Change line 85 from:
```jsx
  useChart(chartRef, chartConfig, monthlyData.length > 0 && !hasInvalid ? [monthlyData] : []);
```
to:
```jsx
  useChart(chartRef, chartConfig, active && monthlyData.length > 0 && !hasInvalid ? [monthlyData] : []);
```

- [ ] **Step 3: Only mount the canvas when the tab is active and data exists**

Change lines 137-141 from:
```jsx
        {monthlyData.length > 0
          // ? <div className={styles.chartWrap}><canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" /></div>
          ? <div className={styles.chartWrap} style={{ minHeight: 220 }}><canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" /></div>
          : <div className={styles.emptyChart}>Aucune donnée. Ajoutez votre première facture ci-dessous.</div>
        }
```
to:
```jsx
        {active && monthlyData.length > 0
          ? <div className={styles.chartWrap} style={{ minHeight: 220 }}><canvas ref={chartRef} role="img" aria-label="Graphique de consommation mensuelle" /></div>
          : <div className={styles.emptyChart}>Aucune donnée. Ajoutez votre première facture ci-dessous.</div>
        }
```

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/DashboardPage.jsx
git commit -m "fix: render dashboard chart only when tab is active and visible"
```

---

### Task 3: Manual verification (no automated test suite configured)

**Files:**
- None (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173/`). Open it.

- [ ] **Step 2: Reproduce the original bug is fixed**

1. On the Calculator tab, set any device's daily hours (open a device card, pick a time chip) so total kWh > 0.
2. Click **CALCULER MA FACTURE** → in the modal click **💾 Enregistrer au suivi**.
3. Switch to the **Dashboard** tab.
   Expected: the "📊 Évolution de la consommation" chart is visible immediately, with one bar for cost (Ar) and one for kWh. (Before the fix this area was blank until a second save.)

- [ ] **Step 3: Verify updates and re-entry**

1. While on the Dashboard, add a second entry with the **➕ Ajouter une facture réelle** form → chart updates to two bars.
2. Switch to Calculator, then back to Dashboard → chart still renders (no blank, no console error).
3. Open DevTools console → confirm no "Canvas is already in use" warning.

- [ ] **Step 4: Commit nothing (verification only) — report result**

If all checks pass, the fix is complete. No commit is required for this task.

---

## Self-Review Notes

- **Spec coverage:** Approach A fully covered — `active` prop (Task 1), canvas gate + deps gate (Task 2), manual verification matching the spec's 4 checks (Task 3). `useChart.js` intentionally untouched (spec explicitly states no change). Edge cases (leaving tab destroys chart via cleanup; invalid data shows no chart) are satisfied by the existing `useChart` logic + `!hasInvalid` guard, unchanged.
- **Placeholders:** None. All steps show exact code or exact commands.
- **Type/name consistency:** `active` is introduced in App.jsx (Task 1) and consumed in DashboardPage.jsx (Task 2) with the same name and boolean `tab === 'dash'` value. `chartRef`, `chartConfig`, `monthlyData`, `hasInvalid` are pre-existing and referenced consistently.
