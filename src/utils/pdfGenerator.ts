import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Header - Company Logo and Info
  doc.setFillColor(218, 165, 32); // Gold for Magnates Empire
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company logo (simple crown icon)
  doc.setFillColor(255, 255, 255);
  doc.ellipse(margin + 10, 20, 10, 8, 'F'); // Crown base
  doc.setFillColor(218, 165, 32);
  doc.circle(margin + 5, 14, 2, 'F');
  doc.circle(margin + 10, 12, 2, 'F');
  doc.circle(margin + 15, 14, 2, 'F');

  // Company name and details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Magnates Empire', margin + 30, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Business Suite', margin + 30, 28);

  // Company contact info (right side)
  const contactInfo = [
    'Empire Tower, 88 Crown St',
    'Metropolis, NY 10001',
    'billing@magnatesempire.com',
    '(555) 987-6543'
  ];

  let contactY = 12;
  contactInfo.forEach(info => {
    doc.text(info, pageWidth - margin - 70, contactY);
    contactY += 5;
  });

  yPosition = 50;

  // Invoice Title and Status
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, yPosition);

  // Status badge
  const statusText = invoice.status === 'paid' ? 'PAID' : 'UNPAID';
  const statusColor = invoice.status === 'paid' ? [16, 185, 129] : [239, 68, 68];
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(pageWidth - margin - 40, yPosition - 15, 35, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, pageWidth - margin - 37, yPosition - 7);

  yPosition += 15;

  // Invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.id}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Issue Date: ${invoice.createdAt.toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  if (invoice.dueDate) {
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
  }
  if (invoice.status === 'paid' && invoice.paidAt) {
    doc.text(`Paid Date: ${invoice.paidAt.toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
  }

  yPosition += 10;

  // Bill To section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.client.name, margin, yPosition);
  yPosition += 8;

  if (invoice.client.company) {
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client.company, margin, yPosition);
    yPosition += 8;
  }

  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.email, margin, yPosition);
  yPosition += 8;

  // Handle multi-line address
  const addressLines = invoice.client.address.split('\n');
  addressLines.forEach(line => {
    if (line.trim()) {
      doc.text(line.trim(), margin, yPosition);
      yPosition += 6;
    }
  });

  yPosition += 15;

  // Items table header
  const tableStartY = yPosition;
  const colWidths = [80, 25, 35, 35]; // Description, Qty, Unit Price, Total
  const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];

  // Table header background
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');

  // Table header border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15);

  // Table headers
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', colPositions[0] + 2, yPosition + 3);
  doc.text('QTY', colPositions[1] + 2, yPosition + 3);
  doc.text('UNIT PRICE', colPositions[2] + 2, yPosition + 3);
  doc.text('TOTAL', colPositions[3] + 2, yPosition + 3);

  yPosition += 15;

  // Table items
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  invoice.items.forEach((item, index) => {
    const rowHeight = 12;
    
    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, rowHeight, 'F');
    }

    // Item description (with wrapping if needed)
    const descLines = doc.splitTextToSize(item.description, colWidths[0] - 4);
    doc.text(descLines, colPositions[0] + 2, yPosition + 3);
    
    // Quantity
    doc.text(item.quantity.toString(), colPositions[1] + 2, yPosition + 3);
    
    // Unit price
    doc.text(formatCurrency(item.unitPrice), colPositions[2] + 2, yPosition + 3);
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.total), colPositions[3] + 2, yPosition + 3);
    doc.setFont('helvetica', 'normal');

    // Row border
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPosition + rowHeight - 3, pageWidth - margin, yPosition + rowHeight - 3);

    yPosition += Math.max(rowHeight, descLines.length * 4 + 6);
  });

  yPosition += 10;

  // Totals section
  const totalsX = pageWidth - margin - 80;
  const totalsWidth = 75;

  // Totals background
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX - 5, yPosition - 5, totalsWidth + 10, 60, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(totalsX - 5, yPosition - 5, totalsWidth + 10, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(formatCurrency(invoice.subtotal), totalsX + 40, yPosition);
  yPosition += 8;

  // Discount (if applicable)
  if (invoice.discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text('Discount:', totalsX, yPosition);
    doc.text(`-${formatCurrency(invoice.discount)}`, totalsX + 40, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  }

  // Tax
  doc.text(`Tax (${invoice.taxRate}%):`, totalsX, yPosition);
  doc.text(formatCurrency(invoice.tax), totalsX + 40, yPosition);
  yPosition += 12;

  // Total (highlighted)
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, yPosition - 5, totalsX + totalsWidth, yPosition - 5);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, yPosition);
  doc.text(formatCurrency(invoice.total), totalsX + 40, yPosition);

  yPosition += 20;

  // Payment information
  if (invoice.status === 'paid') {
    doc.setFillColor(220, 252, 231);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 25);
    
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ PAYMENT RECEIVED', margin + 5, yPosition + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (invoice.paidAt) {
      doc.text(`Paid on: ${invoice.paidAt.toLocaleDateString()}`, margin + 5, yPosition + 18);
    }
    doc.text(`Payment Method: ${invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1).replace('-', ' ')}`, margin + 5, yPosition + 22);
    
    yPosition += 35;
  } else {
    doc.setFillColor(254, 242, 242);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    doc.setDrawColor(239, 68, 68);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 20);
    
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT PENDING', margin + 5, yPosition + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1).replace('-', ' ')}`, margin + 5, yPosition + 16);
    
    yPosition += 30;
  }

  // Notes section (if applicable)
  if (invoice.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(invoice.notes, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;
  }

  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', margin, footerY);
  doc.text('Questions? Contact us at support@magnatesempire.com | (555) 987-6543', margin, footerY + 6);
  
  // Page number and generation date
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, footerY);
  doc.text('Page 1 of 1', pageWidth - margin - 20, footerY + 6);

  // Save the PDF
  const fileName = invoice.status === 'paid' 
    ? `receipt-${invoice.id}.pdf` 
    : `invoice-${invoice.id}.pdf`;
  
  doc.save(fileName);
};