import jsPDF from 'jspdf';
import { Booking } from '../types';
import { formatSYP } from './helpers';

/**
 * Generates and downloads a clean, professional, high-resolution PDF Invoice for a confirmed booking.
 */
export async function generateBookingInvoicePdf(booking: Booking): Promise<void> {
  try {
    // Create an invisible canvas element to render high-contrast Arabic vector layout
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // 1. Background
    ctx.fillStyle = '#0a0f0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative subtle top and bottom accent borders
    ctx.fillStyle = '#00FFD2';
    ctx.fillRect(0, 0, canvas.width, 16);
    ctx.fillStyle = '#00FFD2';
    ctx.fillRect(0, canvas.height - 16, canvas.width, 16);

    // Inner Card Container
    const margin = 50;
    ctx.fillStyle = '#111916';
    ctx.strokeStyle = 'rgba(0, 255, 210, 0.3)';
    ctx.lineWidth = 3;
    
    // Round rectangle helper
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    drawRoundRect(margin, 40, canvas.width - margin * 2, canvas.height - 80, 24);
    ctx.fill();
    ctx.stroke();

    // 2. Header Area
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 38px "Cairo", "Tajawal", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تطبيق الكابتن الرياضي | AL-KAPTAN', canvas.width / 2, 110);

    ctx.fillStyle = '#a0aec0';
    ctx.font = '22px "Cairo", "Tajawal", "Segoe UI", sans-serif';
    ctx.fillText('المنصة الرياضية المتكاملة لحجز الملاعب والبطولات في سوريا (عمولة 0%)', canvas.width / 2, 150);

    // Horizontal Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin + 40, 180);
    ctx.lineTo(canvas.width - margin - 40, 180);
    ctx.stroke();

    // 3. Invoice Title & Reference Box
    drawRoundRect(margin + 40, 205, canvas.width - (margin + 40) * 2, 110, 16);
    ctx.fillStyle = '#070b09';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 210, 0.4)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Cairo", sans-serif';
    ctx.fillText('فاتورة حجز ملعب معتمدة (INVOICE)', canvas.width - margin - 70, 250);

    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 22px monospace, sans-serif';
    ctx.fillText(`رقم الحجز المرجعي: ${booking.referenceNumber}`, canvas.width - margin - 70, 290);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.fillText('الحالة: مؤكد ومعتمد ✓', margin + 70, 250);

    const issueDate = new Date(booking.createdAt || Date.now()).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px "Cairo", sans-serif';
    ctx.fillText(`تاريخ الإصدار: ${issueDate}`, margin + 70, 285);

    // 4. Two Columns: Customer Info & Playground Info
    const colY = 340;
    const colWidth = 490;
    const colHeight = 220;

    // Right Box: Customer Details
    drawRoundRect(canvas.width - margin - 40 - colWidth, colY, colWidth, colHeight, 16);
    ctx.fillStyle = '#0c1310';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 22px "Cairo", sans-serif';
    ctx.fillText('👤 بيانات الحاجز / الكابتن', canvas.width - margin - 70, colY + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Cairo", sans-serif';
    ctx.fillText(`الاسم: ${booking.userName || 'كابتن المنصة'}`, canvas.width - margin - 70, colY + 85);
    ctx.fillText(`رقم الهاتف: ${booking.userPhone || '—'}`, canvas.width - margin - 70, colY + 125);
    ctx.fillText(`المحافظة: ${booking.governorate}`, canvas.width - margin - 70, colY + 165);
    ctx.fillText(`طريقة الدفع: ${booking.paymentMethod}`, canvas.width - margin - 70, colY + 200);

    // Left Box: Playground Details
    drawRoundRect(margin + 40, colY, colWidth, colHeight, 16);
    ctx.fillStyle = '#0c1310';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 22px "Cairo", sans-serif';
    ctx.fillText('⚽ بيانات الملعب والمنشأة', margin + 40 + colWidth - 30, colY + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Cairo", sans-serif';
    ctx.fillText(`الملعب: ${booking.playgroundName}`, margin + 40 + colWidth - 30, colY + 85);
    ctx.fillText(`المنطقة: ${booking.detailedArea || booking.governorate}`, margin + 40 + colWidth - 30, colY + 125);
    ctx.fillText(`هاتف الإدارة: ${booking.managerPhone || '—'}`, margin + 40 + colWidth - 30, colY + 165);
    ctx.fillText(`سعة الملعب: ${booking.playerCount || '6v6'}`, margin + 40 + colWidth - 30, colY + 200);

    // 5. Booking Schedule & Items Table
    const tableY = 590;
    const tableWidth = canvas.width - (margin + 40) * 2;
    
    // Table Header
    drawRoundRect(margin + 40, tableY, tableWidth, 55, 12);
    ctx.fillStyle = '#16221d';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 210, 0.3)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 20px "Cairo", sans-serif';
    ctx.fillText('تفاصيل الخدمة والوقت', canvas.width - margin - 70, tableY + 36);
    ctx.fillText('الموعد والتاريخ', canvas.width - margin - 360, tableY + 36);
    ctx.fillText('المدة', canvas.width - margin - 650, tableY + 36);
    ctx.fillText('المبلغ المستحق', margin + 80, tableY + 36);

    // Table Row 1: Pitch Booking
    const row1Y = tableY + 70;
    drawRoundRect(margin + 40, row1Y, tableWidth, 90, 12);
    ctx.fillStyle = '#070b09';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Cairo", sans-serif';
    ctx.fillText(`حجز ملعب كروي: ${booking.playgroundName}`, canvas.width - margin - 70, row1Y + 40);
    ctx.font = '16px "Cairo", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`فئة: ${booking.playerCount} • إضاءة وعشب معتمد`, canvas.width - margin - 70, row1Y + 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Cairo", monospace';
    ctx.fillText(booking.selectedDates?.join(', ') || '—', canvas.width - margin - 360, row1Y + 40);
    ctx.fillStyle = '#00FFD2';
    ctx.font = '16px "Cairo", sans-serif';
    ctx.fillText(`بتوقيت: ${booking.timeSlot}`, canvas.width - margin - 360, row1Y + 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Cairo", sans-serif';
    ctx.fillText(booking.duration || 'ساعة ونصف', canvas.width - margin - 650, row1Y + 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace, sans-serif';
    ctx.fillText(formatSYP(booking.totalPrice), margin + 80, row1Y + 55);

    // Optional Extra Services Row
    let currentY = row1Y + 105;
    if (booking.extraServices && booking.extraServices.length > 0) {
      drawRoundRect(margin + 40, currentY, tableWidth, 65, 12);
      ctx.fillStyle = '#070b09';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Cairo", sans-serif';
      ctx.fillText(`خدمات إضافية مختارة: ${booking.extraServices.join(', ')}`, canvas.width - margin - 70, currentY + 40);
      ctx.fillStyle = '#10B981';
      ctx.fillText('مشمولة ضمن الإجمالي', margin + 80, currentY + 40);
      currentY += 80;
    }

    // 6. Pricing Summary Box
    const sumBoxY = currentY + 15;
    const sumBoxWidth = 460;
    drawRoundRect(canvas.width - margin - 40 - sumBoxWidth, sumBoxY, sumBoxWidth, 230, 16);
    ctx.fillStyle = '#141e1a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 210, 0.4)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '19px "Cairo", sans-serif';
    ctx.fillText('المجموع الفرعي لحجز الملعب:', canvas.width - margin - 70, sumBoxY + 45);
    ctx.fillText('رسوم وعمولة المنصة (تطبيق الكابتن):', canvas.width - margin - 70, sumBoxY + 90);
    ctx.fillText('طريقة تسديد الحساب:', canvas.width - margin - 70, sumBoxY + 135);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px monospace';
    ctx.fillText(formatSYP(booking.totalPrice), canvas.width - margin - 40 - sumBoxWidth + 40, sumBoxY + 45);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 19px "Cairo"';
    ctx.fillText('0 ل.س (مجاناً 100%)', canvas.width - margin - 40 - sumBoxWidth + 40, sumBoxY + 90);
    ctx.fillStyle = '#00FFD2';
    ctx.fillText(booking.paymentMethod, canvas.width - margin - 40 - sumBoxWidth + 40, sumBoxY + 135);

    // Total Amount Line
    ctx.strokeStyle = 'rgba(0, 255, 210, 0.3)';
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - 50, sumBoxY + 160);
    ctx.lineTo(canvas.width - margin - 40 - sumBoxWidth + 30, sumBoxY + 160);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Cairo", sans-serif';
    ctx.fillText('المبلغ الإجمالي المطلوب:', canvas.width - margin - 70, sumBoxY + 200);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 28px monospace, sans-serif';
    ctx.fillText(formatSYP(booking.totalPrice), canvas.width - margin - 40 - sumBoxWidth + 40, sumBoxY + 200);

    // 7. Official Seal & Instructions on Left side of Summary Box
    const sealX = margin + 40;
    const sealY = sumBoxY;
    const sealWidth = canvas.width - margin * 2 - 80 - sumBoxWidth - 30;

    drawRoundRect(sealX, sealY, sealWidth, 230, 16);
    ctx.fillStyle = '#0c1310';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00FFD2';
    ctx.font = 'bold 20px "Cairo", sans-serif';
    ctx.fillText('📌 شروط وتعليمات الحضور:', sealX + sealWidth - 30, sealY + 40);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px "Cairo", sans-serif';
    ctx.fillText('• يرجى الحضور قبل الموعد بـ 15 دقيقة لتجهيز الفريق.', sealX + sealWidth - 30, sealY + 75);
    ctx.fillText('• يجب الالتزام بالزي الرياضي والأحذية المناسبة لأرضية الملعب.', sealX + sealWidth - 30, sealY + 110);
    ctx.fillText('• إبراز هذا الإيصال أو الرقم المرجعي لإدارة الملعب عند الوصول.', sealX + sealWidth - 30, sealY + 145);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 18px "Cairo", sans-serif';
    ctx.fillText('✓ ختم الاعتماد الإلكتروني: معتمد من إدارة تطبيق الكابتن', sealX + sealWidth - 30, sealY + 195);

    // 8. Footer Bar
    const footerY = canvas.height - 110;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Cairo", sans-serif';
    ctx.fillText('تطبيق الكابتن الرياضي | دمشق - حلب - حمص - اللاذقية - حماة - طرطوس - كافة المحافظات السورية', canvas.width / 2, footerY);
    ctx.fillText('للدعم الفني والاستفسار: 0945688090 | family2016amer@gmail.com', canvas.width / 2, footerY + 30);

    // Convert Canvas to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Clean filename
    const cleanRef = (booking.referenceNumber || 'booking').replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`فاتورة_حجز_الكابتن_${cleanRef}.pdf`);
  } catch (error) {
    console.error('Error generating booking invoice PDF:', error);
    // Fallback: trigger print dialog if PDF fails
    window.print();
  }
}
