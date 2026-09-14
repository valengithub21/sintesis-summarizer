import { jsPDF } from 'jspdf';
import { SummaryItem } from '../types';

export interface PdfExportOptions {
  isDarkMode?: boolean;
}

export function exportSummaryToPdf(summary: SummaryItem, options?: PdfExportOptions) {
  // Determine if dark mode is active (either from options or current DOM class)
  const isDark = options?.isDarkMode !== undefined
    ? options.isDarkMode
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm
  let currentY = 22;

  // Theme palettes
  const theme = isDark
    ? {
        bg: [22, 22, 25] as [number, number, number],          // #161619 Apple-style dark neutral
        cardBg: [32, 32, 37] as [number, number, number],      // #202025
        cardBorder: [54, 54, 62] as [number, number, number],  // #36363e
        headerText: [156, 163, 175] as [number, number, number], // #9ca3af
        divider: [48, 48, 56] as [number, number, number],     // #303038
        title: [245, 245, 247] as [number, number, number],    // #f5f5f7
        body: [220, 220, 225] as [number, number, number],     // #dcdce1
        muted: [156, 163, 175] as [number, number, number],    // #9ca3af
        accent: [56, 189, 248] as [number, number, number],    // #38bdf8 sky blue
        pillBg: [38, 44, 54] as [number, number, number],      // subtle blue/zinc pill
        pillText: [125, 211, 252] as [number, number, number], // #7dd3fc
        footerText: [115, 115, 125] as [number, number, number],
      }
    : {
        bg: [255, 255, 255] as [number, number, number],
        cardBg: [245, 247, 250] as [number, number, number],  // #f5f7fa
        cardBorder: [225, 230, 238] as [number, number, number],
        headerText: [107, 114, 128] as [number, number, number],
        divider: [226, 232, 240] as [number, number, number],
        title: [24, 24, 27] as [number, number, number],
        body: [51, 65, 85] as [number, number, number],
        muted: [100, 116, 139] as [number, number, number],
        accent: [0, 113, 227] as [number, number, number],     // #0071e3 Apple blue
        pillBg: [238, 242, 255] as [number, number, number],
        pillText: [2, 132, 199] as [number, number, number],
        footerText: [156, 163, 175] as [number, number, number],
      };

  const fillPageBg = () => {
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 24) {
      doc.addPage();
      fillPageBg();
      currentY = 22;
      return true;
    }
    return false;
  };

  // Initialize Page 1 Background
  fillPageBg();

  // 1. Header: Brand & Offline Mode Pill
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...theme.headerText);
  doc.text('SINTAXIS • RESUMEN INTELIGENTE', margin, currentY);

  // Mode badge pill
  const badgeLabel = isDark ? 'LECTURA OFFLINE • MODO OSCURO' : 'LECTURA OFFLINE • MODO CLARO';
  doc.setFontSize(7.5);
  const badgeWidth = doc.getTextWidth(badgeLabel) + 6;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setFillColor(...theme.pillBg);
  doc.roundedRect(badgeX, currentY - 3.8, badgeWidth, 5.5, 1.5, 1.5, 'F');
  doc.setTextColor(...theme.pillText);
  doc.text(badgeLabel, badgeX + 3, currentY);

  currentY += 5.5;

  // Header divider
  doc.setDrawColor(...theme.divider);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 9;

  // 2. Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...theme.title);
  const titleLines = doc.splitTextToSize(summary.title || 'Resumen', contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 3;

  // 3. Metadata & Stats
  const dateStr = new Date(summary.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const statsText = `Fecha: ${dateStr}   •   Lectura: ~${summary.stats.readTimeMinutes} min   •   Reducción: ${summary.stats.reductionPercentage}%   •   Palabras: ${summary.stats.summaryWords} (de ${summary.stats.originalWords})`;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...theme.muted);
  doc.text(statsText, margin, currentY);
  currentY += 9;

  // 4. Key Takeaways Card (if available)
  if (summary.keyTakeaways && summary.keyTakeaways.length > 0) {
    // Pre-calculate card height
    doc.setFontSize(9);
    let estimatedTakeawayHeight = 12; // header + padding
    const processedTakeaways: string[][] = [];

    for (const point of summary.keyTakeaways) {
      const lines = doc.splitTextToSize(`•  ${point}`, contentWidth - 14);
      processedTakeaways.push(lines);
      estimatedTakeawayHeight += lines.length * 4.8 + 2;
    }

    checkPageBreak(estimatedTakeawayHeight + 6);

    // Draw card background & border
    doc.setFillColor(...theme.cardBg);
    doc.setDrawColor(...theme.cardBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, estimatedTakeawayHeight, 2.5, 2.5, 'FD');

    // Card Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...theme.accent);
    doc.text('IDEAS CLAVE', margin + 6, currentY + 6.5);
    
    let takeawayY = currentY + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...theme.body);

    for (const lines of processedTakeaways) {
      doc.text(lines, margin + 6, takeawayY);
      takeawayY += lines.length * 4.8 + 2;
    }

    currentY += estimatedTakeawayHeight + 7;
  }

  // 5. Structured Summary Section
  checkPageBreak(18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...theme.accent);
  doc.text('RESUMEN', margin, currentY);
  currentY += 6;

  // Parse Markdown paragraphs & clean syntax
  const rawParagraphs = summary.summary.split('\n');
  doc.setFontSize(9.5);

  for (let i = 0; i < rawParagraphs.length; i++) {
    const rawLine = rawParagraphs[i].trim();
    if (!rawLine) {
      currentY += 3;
      continue;
    }

    // Markdown Heading (### or ## or #)
    if (rawLine.startsWith('#')) {
      const headingText = rawLine.replace(/^#+\s*/, '');
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...theme.title);
      const headingLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(headingLines, margin, currentY);
      currentY += headingLines.length * 5 + 3;
      continue;
    }

    // Bullet point
    const isBullet = rawLine.startsWith('- ') || rawLine.startsWith('* ') || rawLine.startsWith('• ');
    let lineContent = rawLine;
    if (isBullet) {
      lineContent = `•  ${rawLine.replace(/^[-*•]\s*/, '')}`;
    }

    // Clean inline formatting tags
    const cleanedText = lineContent
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...theme.body);

    const indent = isBullet ? 4 : 0;
    const textLines = doc.splitTextToSize(cleanedText, contentWidth - indent);
    const blockHeight = textLines.length * 4.8 + 2;

    checkPageBreak(blockHeight);
    doc.text(textLines, margin + indent, currentY);
    currentY += blockHeight;
  }

  // 6. Action Items (if present)
  if (summary.actionItems && summary.actionItems.length > 0) {
    checkPageBreak(20);
    currentY += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...theme.accent);
    doc.text('PUNTOS DE ACCIÓN RECOMENDADOS', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...theme.body);

    for (const item of summary.actionItems) {
      const itemLines = doc.splitTextToSize(`[  ]  ${item}`, contentWidth - 4);
      const itemHeight = itemLines.length * 4.8 + 2;
      checkPageBreak(itemHeight);
      doc.text(itemLines, margin + 2, currentY);
      currentY += itemHeight;
    }
  }

  // 7. Flashcards (if present)
  if (summary.flashcards && summary.flashcards.length > 0) {
    checkPageBreak(25);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...theme.accent);
    doc.text('TARJETAS DE AUTO-EVALUACIÓN', margin, currentY);
    currentY += 6;

    for (let i = 0; i < summary.flashcards.length; i++) {
      const fc = summary.flashcards[i];
      doc.setFontSize(9);
      const qLines = doc.splitTextToSize(`Pregunta ${i + 1}: ${fc.question}`, contentWidth - 10);
      const aLines = doc.splitTextToSize(`Respuesta: ${fc.answer}`, contentWidth - 10);
      const cardHeight = (qLines.length + aLines.length) * 4.8 + 8;

      checkPageBreak(cardHeight + 4);

      doc.setFillColor(...theme.cardBg);
      doc.setDrawColor(...theme.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, cardHeight, 2, 2, 'FD');

      let cardY = currentY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...theme.title);
      doc.text(qLines, margin + 5, cardY);
      cardY += qLines.length * 4.8 + 1.5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...theme.body);
      doc.text(aLines, margin + 5, cardY);

      currentY += cardHeight + 4;
    }
  }

  // 8. Glossary (if present)
  if (summary.glossary && summary.glossary.length > 0) {
    checkPageBreak(25);
    currentY += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...theme.accent);
    doc.text('GLOSARIO DE TÉRMINOS', margin, currentY);
    currentY += 6;

    for (const item of summary.glossary) {
      doc.setFontSize(9);
      const itemLines = doc.splitTextToSize(`${item.term}: ${item.definition}`, contentWidth - 6);
      const itemHeight = itemLines.length * 4.8 + 2;
      checkPageBreak(itemHeight);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...theme.title);
      doc.text(`• ${item.term}: `, margin + 2, currentY);

      const termWidth = doc.getTextWidth(`• ${item.term}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...theme.body);
      const defLines = doc.splitTextToSize(item.definition, contentWidth - termWidth - 4);
      doc.text(defLines, margin + 2 + termWidth, currentY);

      currentY += Math.max(itemLines.length, defLines.length) * 4.8 + 2;
    }
  }

  // 9. Footers Across All Pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer divider
    doc.setDrawColor(...theme.divider);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...theme.footerText);

    // Left info
    doc.text('Sintaxis • Resumen inteligente para lectura offline', margin, pageHeight - 11);

    // Right page number
    const pageStr = `Página ${p} de ${totalPages}`;
    doc.text(pageStr, pageWidth - margin, pageHeight - 11, { align: 'right' });
  }

  // Generate clean filename
  const cleanTitle = (summary.title || 'resumen')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 32);
  const themeSuffix = isDark ? 'offline_oscuro' : 'offline_claro';
  const filename = `${cleanTitle}_${themeSuffix}.pdf`;

  doc.save(filename);
}

export function exportSummaryToMarkdown(summary: SummaryItem) {
  let md = `# ${summary.title}\n\n`;
  md += `*Generado con Sintaxis • ${new Date(summary.createdAt).toLocaleDateString('es-ES')}*\n`;
  md += `*Tiempo estimado de lectura: ~${summary.stats.readTimeMinutes} min | Reducción: ${summary.stats.reductionPercentage}%*\n\n`;

  if (summary.keyTakeaways && summary.keyTakeaways.length > 0) {
    md += `## 💡 Ideas Clave\n\n`;
    for (const point of summary.keyTakeaways) {
      md += `- ${point}\n`;
    }
    md += `\n`;
  }

  md += `## 📄 Resumen\n\n`;
  md += `${summary.summary}\n\n`;

  if (summary.actionItems && summary.actionItems.length > 0) {
    md += `## 🎯 Puntos de Acción\n\n`;
    for (const item of summary.actionItems) {
      md += `- [ ] ${item}\n`;
    }
    md += `\n`;
  }

  if (summary.flashcards && summary.flashcards.length > 0) {
    md += `## 🧠 Tarjetas de Repaso\n\n`;
    for (const fc of summary.flashcards) {
      md += `**P:** ${fc.question}\n\n**R:** ${fc.answer}\n\n---\n\n`;
    }
  }

  if (summary.glossary && summary.glossary.length > 0) {
    md += `## 📖 Glosario\n\n`;
    for (const g of summary.glossary) {
      md += `- **${g.term}**: ${g.definition}\n`;
    }
    md += `\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(summary.title || 'resumen').toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 35)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSummaryToTxt(summary: SummaryItem) {
  let txt = `${summary.title.toUpperCase()}\n`;
  txt += `========================================\n`;
  txt += `Fecha: ${new Date(summary.createdAt).toLocaleDateString('es-ES')}\n`;
  txt += `Lectura: ~${summary.stats.readTimeMinutes} min | Reducción: ${summary.stats.reductionPercentage}%\n\n`;

  if (summary.keyTakeaways && summary.keyTakeaways.length > 0) {
    txt += `IDEAS CLAVE:\n`;
    summary.keyTakeaways.forEach((k, i) => {
      txt += `${i + 1}. ${k}\n`;
    });
    txt += `\n----------------------------------------\n\n`;
  }

  txt += `RESUMEN:\n\n`;
  txt += summary.summary
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');

  txt += `\n\n========================================\nGenerado con Sintaxis - Creador de Resúmenes\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(summary.title || 'resumen').toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 35)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
