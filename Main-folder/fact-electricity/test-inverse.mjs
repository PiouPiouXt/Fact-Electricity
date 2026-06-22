import { calcInverse, totalKwh, calcBill, APPS } from './src/utils/electricity.js';

const budget = 10000;
const suggestions = calcInverse(budget);
console.log('Budget:', budget);
console.log('Suggestions (id, suggestedH):');
suggestions.forEach(s => console.log(s.id, s.suggestedH));

const totalKwhSugg = APPS.reduce((s, a, i) => s + (a.watts * (suggestions[i]?.suggestedH ?? 0) * 30) / 1000, 0);
const bill = calcBill(totalKwhSugg);
console.log('\nTotal kWh (from suggestions):', totalKwhSugg);
console.log('Bill (from suggestions):', bill.cost, bill.label, `(rate ${bill.rate})`);

// Also show result after rounding to 6 decimals (applySuggestions behavior)
const roundedTimes = APPS.map((_, i) => parseFloat((suggestions[i]?.suggestedH ?? 0).toFixed(6)));
const totalKwhRounded = APPS.reduce((s, a, i) => s + (a.watts * (roundedTimes[i] || 0) * 30) / 1000, 0);
const billRounded = calcBill(totalKwhRounded);
console.log('\nTotal kWh (rounded to 6 decimals):', totalKwhRounded);
console.log('Bill (rounded):', billRounded.cost, billRounded.label, `(rate ${billRounded.rate})`);
