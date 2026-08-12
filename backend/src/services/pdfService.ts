import PDFDocument from 'pdfkit';

export class PDFService {
  /**
   * Helper to convert PDFDocument stream to Buffer
   */
  private static async docToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      doc.end();
    });
  }

  /**
   * Format currency values with clean Rs. prefix
   */
  private static formatCurrency(val: number): string {
    return `Rs. ${val.toLocaleString('en-IN')}`;
  }

  /**
   * Generate Clean A4 Invoice PDF (original design)
   */
  static async generateInvoicePDF(order: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    // BRAND HEADER
    doc
      .fillColor('#0f2d21')
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('SHEENEEKA NURSERY', 40, 40);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#386641')
      .text('BRINGING NATURE CLOSER TO YOU  \u2022  OFFICIAL ORDER INVOICE', 40, 72);

    // Invoice number badge (top right, green bordered box)
    doc
      .rect(370, 35, 185, 45)
      .lineWidth(1.5)
      .strokeColor('#166534')
      .stroke()
      .fillColor('#166534')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`INVOICE: ${order.orderNumber}`, 375, 50, { width: 175, align: 'center' });

    // Divider line
    doc
      .moveTo(40, 95)
      .lineTo(555, 95)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();

    // ORDER DETAILS / CUSTOMER & DELIVERY DETAILS
    let y = 115;

    const addr = order.shippingAddress || {};
    const recipientName = addr.fullName || addr.name || order.user?.name || 'Customer';
    const recipientPhone = addr.phone || order.user?.phone || 'N/A';
    const addressStr = [
      addr.addressLine1,
      addr.addressLine2,
      `${addr.city || ''}, ${addr.state || ''} - ${addr.postalCode || ''}`,
      addr.country || 'India',
    ]
      .filter(Boolean)
      .join(', ');

    // Left column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text('ORDER DETAILS', 40, y)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 18)
      .text(`Order Status: ${order.status}`, 40, y + 33)
      .text(`Payment Method: ${order.paymentMethod}`, 40, y + 48)
      .text(`Payment Status: ${order.paymentStatus}`, 40, y + 63);

    // Right column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text('CUSTOMER & DELIVERY DETAILS', 300, y)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`Customer: ${recipientName}`, 300, y + 18)
      .text(`Email: ${order.user?.email || 'N/A'}`, 300, y + 33)
      .text(`Phone: ${recipientPhone}`, 300, y + 48)
      .text(`Address: ${addressStr}`, 300, y + 63, { width: 250, height: 36, ellipsis: true });

    y += 110;

    // ITEMS TABLE — dark green header
    doc
      .rect(40, y, 515, 26)
      .fill('#0f2d21')
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('ITEM DESCRIPTION', 50, y + 8)
      .text('QTY', 350, y + 8, { width: 50, align: 'center' })
      .text('UNIT PRICE', 405, y + 8, { width: 70, align: 'right' })
      .text('LINE TOTAL', 482, y + 8, { width: 68, align: 'right' });

    y += 26;

    const items = order.items || [];
    items.forEach((item: any, idx: number) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.rect(40, y, 515, 22).fill('#f8fafc');
      }

      const name = item.productNameSnapshot || item.product?.name || 'Plant';
      const qty = item.quantity || 1;
      const price = item.priceSnapshot || item.price || 0;
      const lineTotal = item.subtotal || qty * price;

      doc
        .fillColor('#1e293b')
        .font('Helvetica')
        .fontSize(9)
        .text(name, 50, y + 6, { width: 290, height: 14, ellipsis: true })
        .text(String(qty), 350, y + 6, { width: 50, align: 'center' })
        .text(this.formatCurrency(price), 405, y + 6, { width: 70, align: 'right' })
        .text(this.formatCurrency(lineTotal), 482, y + 6, { width: 68, align: 'right' });

      y += 22;
    });

    // Divider under rows
    doc
      .moveTo(40, y + 6)
      .lineTo(555, y + 6)
      .strokeColor('#cbd5e1')
      .lineWidth(0.8)
      .stroke();

    y += 20;

    // TOTALS
    const subtotal = order.subtotal || items.reduce((sum: number, i: any) => sum + (i.subtotal || (i.priceSnapshot * i.quantity)), 0);
    const deliveryFee = order.deliveryFee || 0;
    const total = order.total || subtotal + deliveryFee;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text('Subtotal:', 380, y, { width: 90, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(this.formatCurrency(subtotal), 478, y, { width: 72, align: 'right' });

    y += 16;

    doc
      .font('Helvetica')
      .fillColor('#475569')
      .text('Delivery Fee:', 380, y, { width: 90, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(deliveryFee === 0 ? 'FREE' : this.formatCurrency(deliveryFee), 478, y, { width: 72, align: 'right' });

    y += 20;

    // Total row — light green background
    doc
      .rect(350, y - 4, 205, 28)
      .fill('#f0fdf4')
      .fillColor('#166534')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('TOTAL AMOUNT:', 358, y + 4, { width: 110, align: 'right' })
      .fontSize(11)
      .fillColor('#14532d')
      .text(this.formatCurrency(total), 478, y + 3, { width: 72, align: 'right' });

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .fillColor('#64748b')
      .text(
        'Thank you for choosing Sheeneeka Nursery! For queries, contact support at +91 81231 91863.',
        40, 780,
        { align: 'center', width: 515 }
      );

    return this.docToBuffer(doc);
  }


  /**
   * Generate Breathtaking Ultra-Premium Parcel Shipping Label PDF
   */
  static async generateShippingLabelPDF(order: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 25 });
    const addr = order.shippingAddress || {};

    // Premium Double Frame (Emerald & Gold)
    doc
      .rect(25, 25, 545, 490)
      .lineWidth(2.5)
      .strokeColor('#0b2519')
      .stroke();

    doc
      .rect(29, 29, 537, 482)
      .lineWidth(1)
      .strokeColor('#b45309')
      .stroke();

    // 1. BRAND HEADER BANNER
    doc
      .rect(30, 30, 535, 55)
      .fill('#0b2519');

    // Decorative Gold Strip
    doc
      .rect(30, 85, 535, 3)
      .fill('#b45309');

    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('SHEENEEKA NURSERY', 45, 42)
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#86efac')
      .text('PARCEL DELIVERY & EXPRESS BOTANICAL FULFILLMENT LABEL', 45, 67);

    // Order Badge on Right of Header
    doc
      .rect(365, 40, 185, 36)
      .fillAndStroke('#166534', '#ffffff')
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ORDER NUMBER', 375, 46, { width: 165, align: 'center' })
      .fontSize(11)
      .text(order.orderNumber, 375, 59, { width: 165, align: 'center' });

    // 2. RECIPIENT / DELIVER TO SECTION (EXECUTIVE CARDS)
    let y = 100;

    // "DELIVER TO" Tag Header
    doc
      .rect(30, y, 535, 24)
      .fill('#f1f5f9');

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text('SHIP TO / DELIVERY RECIPIENT DESTINATION', 45, y + 7);

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`DATE: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, y + 8, { align: 'right', width: 150 });

    y += 32;

    // Recipient Name (20pt Bold Large Printable Font)
    const recipientName = addr.fullName || addr.name || order.user?.name || 'Valued Customer';
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text(recipientName, 45, y, { width: 505 });

    y += 28;

    // Phone Number Box Badge (14pt Bold)
    const phone = addr.phone || order.user?.phone || 'N/A';
    doc
      .rect(45, y - 2, 260, 24)
      .fillAndStroke('#f0fdf4', '#166534')
      .fillColor('#166534')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`TEL: ${phone}`, 55, y + 4);

    y += 32;

    // Full Address Display Box
    doc
      .rect(45, y, 505, 75)
      .fillAndStroke('#fafafa', '#e2e8f0');

    doc
      .fontSize(11.5)
      .font('Helvetica')
      .fillColor('#1e293b')
      .text(addr.addressLine1 || '', 55, y + 10, { width: 485 });

    if (addr.addressLine2) {
      doc.text(addr.addressLine2, 55, y + 26, { width: 485 });
    }

    // High Visibility City / State / PIN Code Pill Badge
    const cityStatePin = `${(addr.city || 'Bangalore').toUpperCase()}, ${(addr.state || 'Karnataka').toUpperCase()} - ${addr.postalCode || '560001'}`;
    doc
      .rect(55, y + 44, 485, 22)
      .fill('#0b2519')
      .fillColor('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(cityStatePin, 65, y + 49, { width: 465, align: 'center' });

    y += 90;

    // 3. CASH COLLECTION / PAYMENT BANNER
    if (order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID') {
      doc
        .rect(45, y, 505, 45)
        .fillAndStroke('#fef3c7', '#b45309')
        .fillColor('#78350f')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`** CASH ON DELIVERY (COD) ** COLLECT: ${this.formatCurrency(order.total || 0)}`, 55, y + 15, { width: 485, align: 'center' });
    } else {
      doc
        .rect(45, y, 505, 45)
        .fillAndStroke('#dcfce7', '#15803d')
        .fillColor('#14532d')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('[ PREPAID ] PARCEL — DO NOT COLLECT CASH', 55, y + 15, { width: 485, align: 'center' });
    }

    y += 55;

    // 4. PARCEL CONTENTS BREAKDOWN
    doc
      .rect(45, y, 505, 55)
      .fillAndStroke('#f8fafc', '#cbd5e1');

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text('PARCEL CONTENTS / SPECIMENS ENCLOSED:', 55, y + 8);

    const items = order.items || [];
    const itemNames = items.map((i: any) => `${i.productNameSnapshot || 'Plant Specimen'} (x${i.quantity})`).join(', ');

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#334155')
      .text(itemNames, 55, y + 24, { width: 485, height: 24, ellipsis: true });

    y += 65;

    // 5. RETURN ADDRESS FOOTER BANNER
    doc
      .rect(30, y, 535, 45)
      .fill('#f1f5f9');

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text('RETURN ADDRESS IF UNDELIVERED:', 45, y + 8)
      .font('Helvetica')
      .fillColor('#475569')
      .text('Sheeneeka Nursery, Main Gate Road, Cholanayakanahalli, Bangalore South, Karnataka - 562120 | Customer Care: +91 81231 91863', 45, y + 22, { width: 505 });

    return this.docToBuffer(doc);
  }
}
