import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import instrumento from '../data/instrumento.json';

export interface ScreeningPDFOptions {
  caseCode?: string;
  childAgeMonths?: number;
  district?: string;
  insurance?: string;
  score?: number;
  nivel?: 'bajo' | 'medio' | 'alto' | 'baja' | 'moderada' | 'alta';
  answers?: Record<number, 'si' | 'no'>;
  dateStr?: string;
}

export async function generateAndDownloadScreeningPDF(options: ScreeningPDFOptions = {}) {
  const caseCode = options.caseCode || 'NA-7K3M9';
  const childAgeMonths = options.childAgeMonths || 20;
  const district = options.district || 'No registrado';
  const insurance = (options.insurance || 'SIS').toUpperCase();
  const score = options.score ?? 5;
  const rawNivel = options.nivel || (score <= 2 ? 'baja' : score <= 7 ? 'moderada' : 'alta');
  const nivel = rawNivel === 'bajo' ? 'baja' : rawNivel === 'medio' ? 'moderada' : rawNivel === 'alto' ? 'alta' : rawNivel;
  
  const todayDate = options.dateStr || new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const answers = options.answers || {
    1: 'si', 2: 'no', 3: 'no', 4: 'si', 5: 'si',
    6: 'si', 7: 'no', 8: 'si', 9: 'no', 10: 'si',
    11: 'si', 12: 'no', 13: 'si', 14: 'si', 15: 'si',
    16: 'si', 17: 'si', 18: 'si', 19: 'si', 20: 'si'
  };

  // Next step text according to level
  const nextStepText =
    nivel === 'baja'
      ? 'Continuar con los controles CRED habituales en el centro de salud. Si el menor tiene menos de 2 años, repetir tamizaje a los 24 meses.'
      : nivel === 'moderada'
      ? 'Acudir a control CRED en el centro de salud de su sector para aplicar la entrevista de seguimiento del M-CHAT-R/F (Anexo 11 NTS N° 238-MINSA/DGIESP-2025).'
      : 'Acudir a evaluación médica prioritaria en el centro de salud o CSMC de su jurisdicción para derivación especializada a neuropediatría o psiquiatría infantil.';

  // Build target URL for QR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://PAN.pe';
  const qrUrl = `${origin}/caso/${caseCode}`;

  // Generate QR as Data URL (PNG)
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    margin: 1,
    width: 200,
    color: {
      dark: '#4A2270',
      light: '#FFFFFF'
    }
  });

  // Create A4 PDF (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  // --- 1. HEADER ---
  // Top brand bar
  doc.setFillColor(74, 34, 112); // #4A2270
  doc.rect(margin, 12, 4, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(74, 34, 112);
  doc.text('PAN', margin + 7, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(46, 42, 51);
  doc.text('Resultado de orientación inicial', margin + 7, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 106, 117);
  doc.text('Acompañamiento del neurodesarrollo en el Perú', margin + 7, 30);

  // QR Code top right (36 x 36 mm)
  const qrSize = 32;
  const qrX = pageWidth - margin - qrSize;
  const qrY = 12;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 34, 112);
  doc.text(caseCode, qrX + qrSize / 2, qrY + qrSize + 3.5, { align: 'center' });

  // Divider line
  doc.setDrawColor(229, 225, 236);
  doc.setLineWidth(0.4);
  doc.line(margin, 49, pageWidth - margin, 49);

  // --- 2. DATOS DEL CASO (Sin nombre del niño) ---
  doc.setFillColor(247, 245, 250); // #F7F5FA
  doc.roundedRect(margin, 52, contentWidth, 12, 2, 2, 'F');
  doc.setDrawColor(229, 225, 236);
  doc.roundedRect(margin, 52, contentWidth, 12, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(110, 106, 117);
  
  const colW = contentWidth / 4;
  doc.text('EDAD:', margin + 4, 57);
  doc.text('DISTRITO:', margin + colW + 4, 57);
  doc.text('SEGURO:', margin + colW * 2 + 4, 57);
  doc.text('FECHA:', margin + colW * 3 + 4, 57);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 42, 51);
  doc.text(`${childAgeMonths} meses`, margin + 4, 61.5);
  doc.text(district, margin + colW + 4, 61.5);
  doc.text(insurance, margin + colW * 2 + 4, 61.5);
  doc.text(todayDate, margin + colW * 3 + 4, 61.5);

  // --- 3. BLOQUE DEL TAMIZAJE ---
  const screeningY = 67;
  const isMed = nivel === 'moderada';
  const isLow = nivel === 'baja';

  // Background box for score
  if (isLow) {
    doc.setFillColor(230, 242, 236); // #E6F2EC
    doc.setDrawColor(194, 227, 212);
  } else if (isMed) {
    doc.setFillColor(253, 241, 223); // #FDF1DF
    doc.setDrawColor(246, 220, 182);
  } else {
    doc.setFillColor(243, 237, 249); // #F3EDF9
    doc.setDrawColor(213, 198, 235);
  }
  doc.roundedRect(margin, screeningY, contentWidth, 20, 2, 2, 'FD');

  // Circle score
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 12, screeningY + 10, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (isLow) doc.setTextColor(46, 125, 91);
  else if (isMed) doc.setTextColor(199, 119, 0);
  else doc.setTextColor(74, 34, 112);
  doc.text(String(score), margin + 12, screeningY + 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(46, 42, 51);
  doc.text('M-CHAT-R/F (versión peruana, Anexo 11 NTS N° 238-MINSA/DGIESP-2025)', margin + 23, screeningY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  if (isLow) doc.setTextColor(46, 125, 91);
  else if (isMed) doc.setTextColor(199, 119, 0);
  else doc.setTextColor(74, 34, 112);
  doc.text(`Puntaje obtenido: ${score} / 20 puntos · Probabilidad ${nivel}`, margin + 23, screeningY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 106, 117);
  doc.text('Herramienta de tamizaje para niños de 16 a 30 meses. No constituye diagnóstico clínico.', margin + 23, screeningY + 16);

  // --- 4. TABLA DE LAS 20 PREGUNTAS (2 columnas de 10) ---
  const tableY = 90;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 34, 112);
  doc.text('RESPUESTAS REGISTRADAS POR EL CUIDADOR (20 ÍTEMS)', margin, tableY);

  const colWidth = (contentWidth - 4) / 2; // 89 mm
  const rowHeight = 7.2;
  const startRowY = tableY + 3;

  instrumento.items.forEach((item, index) => {
    const isCol2 = index >= 10;
    const colIndex = isCol2 ? 1 : 0;
    const rowIndex = isCol2 ? index - 10 : index;

    const x = margin + colIndex * (colWidth + 4);
    const y = startRowY + rowIndex * rowHeight;

    const ans = answers[item.n] || 'si';
    const isRisk = (instrumento.invertidos.includes(item.n) && ans === 'si') ||
                   (!instrumento.invertidos.includes(item.n) && ans === 'no');

    // Row bg
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 248, 253);
      doc.rect(x, y, colWidth, rowHeight - 0.5, 'F');
    }

    doc.setDrawColor(229, 225, 236);
    doc.setLineWidth(0.2);
    doc.line(x, y + rowHeight - 0.5, x + colWidth, y + rowHeight - 0.5);

    // Question number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(74, 34, 112);
    doc.text(`#${item.n}`, x + 1.5, y + 4.5);

    // Truncated question text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(46, 42, 51);
    
    // Fit text in cell
    let shortText = item.texto.replace(/¿|\?/g, '');
    if (shortText.length > 52) shortText = shortText.substring(0, 50) + '...';
    doc.text(shortText, x + 7, y + 4.5);

    // Answer badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    if (isRisk) {
      doc.setFillColor(233, 223, 245); // purple highlight for risk
      doc.roundedRect(x + colWidth - 11, y + 1, 9.5, 4.2, 1, 1, 'F');
      doc.setTextColor(74, 34, 112);
    } else {
      doc.setTextColor(110, 106, 117);
    }
    doc.text(ans.toUpperCase(), x + colWidth - 6.25, y + 4, { align: 'center' });
  });

  // --- 5. BLOQUE SIGUIENTE PASO ---
  const stepY = startRowY + 10 * rowHeight + 3;
  doc.setFillColor(233, 223, 245); // #E9DFF5
  doc.setDrawColor(213, 198, 235);
  doc.roundedRect(margin, stepY, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 34, 112);
  doc.text('TU SIGUIENTE PASO SUGERIDO', margin + 4, stepY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(46, 42, 51);
  const splitNextStep = doc.splitTextToSize(nextStepText, contentWidth - 8);
  doc.text(splitNextStep, margin + 4, stepY + 9.5);

  // --- 6. CARTA AL PROFESIONAL DE SALUD ---
  const letterY = stepY + 19;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(74, 34, 112);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, letterY, contentWidth, 29, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(74, 34, 112);
  doc.text('CARTA AL PROFESIONAL DE SALUD', margin + 4, letterY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(46, 42, 51);
  const cartaTexto =
    'Estimado profesional de salud: el cuidador de este menor aplicó el M-CHAT-R/F, herramienta de tamizaje incluida en el Anexo 11 de la NTS N° 238-MINSA/DGIESP-2025. El resultado se adjunta arriba. Como toda herramienta de tamizaje, requiere la entrevista de seguimiento para mejorar su especificidad. Este documento no constituye un diagnóstico. Puede consultar el estado del caso escaneando el código QR.';
  const splitCarta = doc.splitTextToSize(cartaTexto, contentWidth - 8);
  doc.text(splitCarta, margin + 4, letterY + 10);

  // --- 7. PIE DE PÁGINA ---
  const footerY = 286;
  doc.setDrawColor(229, 225, 236);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 136, 148);
  doc.text(`Documento generado por PAN · ${todayDate} · Datos de demostración.`, margin, footerY + 2);
  doc.text('Página 1 de 1', pageWidth - margin, footerY + 2, { align: 'right' });

  // Save / Download PDF
  doc.save(`PAN_Resultado_${caseCode}.pdf`);
}
