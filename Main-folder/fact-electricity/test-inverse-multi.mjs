import { calcInverse, calcBill, APPS } from './src/utils/electricity.js';

const testBudgets = [5000, 10000, 30000, 50000, 80000];

testBudgets.forEach(budget => {
  const suggestions = calcInverse(budget);
  const totalKwh = APPS.reduce((s, a, i) => s + (a.watts * (suggestions[i]?.suggestedH ?? 0) * 30) / 1000, 0);
  const bill = calcBill(totalKwh);
  const diff = Math.abs(budget - bill.cost);
  const diffPercent = (diff / budget * 100).toFixed(2);
  console.log(`Budget: ${budget} Ar → Cost: ${bill.cost.toFixed(0)} Ar (${bill.label}) | Diff: ${diff.toFixed(2)} Ar (${diffPercent}%)`);
});
