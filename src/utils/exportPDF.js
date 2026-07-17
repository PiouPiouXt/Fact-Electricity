import { APPS, MONTHS, calcBill, fmtTime, numfmt, T1_MAX, T1_RATE, T2_MAX, T2_RATE, T3_RATE } from './electricity.js';

export function exportPDF(times, customs, monthlyData) {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const kwh = calcTotKwh(times, customs);
    const bill = calcBill(kwh);
    const W = 210, M = 18;
    let y = 20;

    /* Header */
    doc.setFillColor(5, 5, 8);
    doc.rect(0, 0, W, 38, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(245, 197, 24);
    doc.text('FACT ELECTRICITY', M, 16);
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 120);
    doc.text('Rapport de consommation électrique — Madagascar', M, 23);
    doc.setTextColor(180, 180, 200);
    doc.setFontSize(7);
    doc.text('Généré le ' + new Date().toLocaleDateString('fr-FR'), W - M, 23, { align: 'right' });

    /* Summary box */
    y = 48;
    doc.setFillColor(15, 15, 26);
    doc.roundedRect(M, y, W - M * 2, 28, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 197, 24);
    doc.text('Consommation totale estimée', M + 8, y + 9);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(kwh.toFixed(1) + ' kWh/mois', M + 8, y + 21);
    doc.setFontSize(12);
    doc.setTextColor(245, 197, 24);
    doc.text(numfmt(bill.cost) + ' Ar', W - M - 8, y + 21, { align: 'right' });

    /* Devices table */
    y += 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 110);
    doc.text('APPAREILS', M, y);
    doc.setDrawColor(40, 40, 60);
    doc.line(M, y + 2, W - M, y + 2);
    y += 8;

    const rows = [];
    APPS.forEach((a, i) => {
      if ((times[i] || 0) > 0) {
        const k = (a.watts * times[i] * 30) / 1000;
        rows.push([a.icon + ' ' + a.name, a.watts + 'W', fmtTime(times[i]) + '/j', k.toFixed(2) + ' kWh']);
      }
    });
    customs.forEach((c) => {
      if ((c.h || 0) > 0) {
        const k = (c.watts * c.h * 30) / 1000;
        rows.push([c.icon + ' ' + c.name, c.watts + 'W', fmtTime(c.h) + '/j', k.toFixed(2) + ' kWh']);
      }
    });

    rows.forEach((r, ri) => {
      if (y > 260) { doc.addPage(); y = 20; }
      const bg = ri % 2 === 0 ? [18, 18, 30] : [14, 14, 22];
      doc.setFillColor(...bg);
      doc.rect(M, y - 4, W - M * 2, 10, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 220);
      doc.text(r[0], M + 4, y + 2);
      doc.text(r[1], M + 85, y + 2);
      doc.text(r[2], M + 115, y + 2);
      doc.setTextColor(245, 197, 24);
      doc.text(r[3], W - M - 4, y + 2, { align: 'right' });
      y += 10;
    });

    if (rows.length === 0) {
      doc.setTextColor(80, 80, 110);
      doc.setFontSize(8);
      doc.text('Aucun appareil sélectionné.', M, y);
      y += 10;
    }

    /* Tranche breakdown */
    y += 6;
    if (bill.t > 0 && y < 250) {
      doc.setFillColor(12, 10, 0);
      const bkH = bill.t === 1 ? 18 : bill.t === 2 ? 26 : 34;
      doc.roundedRect(M, y, W - M * 2, bkH, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 120, 100);
      doc.text('Décomposition par tranche :', M + 6, y + 7);
      let by = y + 14;
      if (bill.t >= 1) { doc.setTextColor(34, 197, 94);  doc.text('130 kWh × 350 Ar = ' + numfmt(T1_MAX * T1_RATE) + ' Ar', M + 10, by); by += 8; }
      if (bill.t >= 2) { doc.setTextColor(234, 179, 8);  doc.text((Math.min(kwh, T2_MAX) - T1_MAX).toFixed(1) + ' kWh × 580 Ar = ' + numfmt((Math.min(kwh, T2_MAX) - T1_MAX) * T2_RATE) + ' Ar', M + 10, by); by += 8; }
      if (bill.t === 3){ doc.setTextColor(249, 115, 22); doc.text((kwh - T2_MAX).toFixed(1) + ' kWh × 760 Ar = ' + numfmt((kwh - T2_MAX) * T3_RATE) + ' Ar', M + 10, by); }
      y += bkH + 10;
    }

    /* Monthly history */
    if (monthlyData.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 110);
      doc.text('HISTORIQUE MENSUEL', M, y);
      doc.line(M, y + 2, W - M, y + 2);
      y += 8;
      monthlyData.slice(-6).forEach((d) => {
        doc.setFillColor(15, 15, 22);
        doc.rect(M, y - 4, W - M * 2, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(170, 170, 200);
        doc.text(MONTHS[d.month] + ' ' + d.year, M + 4, y + 2);
        doc.text(d.kwh + ' kWh', M + 60, y + 2);
        doc.setTextColor(245, 197, 24);
        doc.text(numfmt(d.cost) + ' Ar', W - M - 4, y + 2, { align: 'right' });
        y += 10;
      });
    }

    /* Footer */
    doc.setFillColor(5, 5, 8);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 70);
    doc.text('FACT ELECTRICITY · Tarifs JIRAMA · ' + new Date().getFullYear(), W / 2, 291, { align: 'center' });

    doc.save('facture-fact-electricity-' + new Date().toISOString().slice(0, 10) + '.pdf');
  });
}

function calcTotKwh(times, customs) {
  let k = 0;
  APPS.forEach((a, i) => { k += (a.watts * (times[i] || 0) * 30) / 1000; });
  customs.forEach((c) => { k += (c.watts * (c.h || 0) * 30) / 1000; });
  return k;
}
