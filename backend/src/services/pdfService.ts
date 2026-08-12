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
   * Generate Ultra-Premium Executive A4 Invoice PDF
   */
  static async generateInvoicePDF(order: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 35 });

    // Outer Thin Gold/Emerald Frame
    doc
      .rect(20, 20, 555, 802)
      .lineWidth(1)
      .strokeColor('#15803d')
      .stroke();

    // Brand Header Bar (Deep Forest Emerald)
    doc
      .rect(25, 25, 545, 65)
      .fill('#0b2519');

    // Gold Brand Accent Strip
    doc
      .rect(25, 87, 545, 3)
      .fill('#b45309');

    // Brand Title & Tagline
    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SHEENEEKA NURSERY', 45, 40)
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#86efac')
      .text('BOTANICAL LUXURY & ECO-FRIENDLY SPECIMENS • OFFICIAL TAX INVOICE', 45, 68);

    // Invoice Badge Box
    doc
      .rect(385, 35, 175, 42)
      .fillAndStroke('#166534', '#ffffff')
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('INVOICE NUMBER', 395, 43, { width: 155, align: 'center' })
      .fontSize(11)
      .text(order.orderNumber, 395, 57, { width: 155, align: 'center' });

    // Section 1: Meta Details Grid
    let y = 105;

    // Order Meta Card
    doc
      .rect(25, y, 265, 85)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    doc
      .fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text('ORDER INFORMATION', 35, y + 10)
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#334155')
      .text(`Date Placed: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 35, y + 28)
      .text(`Fulfillment Status: ${order.status}`, 35, y + 42)
      .text(`Payment Method: ${order.paymentMethod}`, 35, y + 56)
      .text(`Payment Status: ${order.paymentStatus}`, 35, y + 70);

    // Customer & Shipping Card
    doc
      .rect(295, y, 275, 85)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    const addr = order.shippingAddress || {};
    const recipientName = addr.fullName || addr.name || order.user?.name || 'Valued Customer';
    const recipientPhone = addr.phone || order.user?.phone || 'N/A';
    const addressStr = [
      addr.addressLine1,
      addr.addressLine2,
      `${addr.city || ''}, ${addr.state || ''} - ${addr.postalCode || ''}`,
      addr.country || 'India',
    ]
      .filter(Boolean)
      .join(', ');

    doc
      .fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor('#0b2519')
      .text('DELIVERY & CUSTOMER DETAILS', 305, y + 10)
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#334155')
      .text(`Customer: ${recipientName}`, 305, y + 28)
      .text(`Phone: ${recipientPhone}`, 305, y + 42)
      .text(`Address: ${addressStr}`, 305, y + 56, { width: 255, height: 26, ellipsis: true });

    y += 100;

    // Items Table Header Header Bar
    doc
      .rect(25, y, 545, 26)
      .fill('#0b2519')
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('PLANT SPECIMEN / PRODUCT DESCRIPTION', 35, y + 8)
      .text('QTY', 350, y + 8, { width: 40, align: 'center' })
      .text('UNIT PRICE', 400, y + 8, { width: 75, align: 'right' })
      .text('TOTAL', 485, y + 8, { width: 75, align: 'right' });

    y += 26;

    // Items Table Rows
    const items = order.items || [];
    items.forEach((item: any, idx: number) => {
      const isEven = idx % 2 === 0;
      doc
        .rect(25, y, 545, 24)
        .fillAndStroke(isEven ? '#ffffff' : '#f8fafc', '#f1f5f9');

      const name = item.productNameSnapshot || item.product?.name || 'Botanical Specimen';
      const qty = item.quantity || 1;
      const price = item.priceSnapshot || item.price || 0;
      const lineTotal = item.subtotal || qty * price;

      doc
        .fillColor('#0f172a')
        .font('Helvetica')
        .fontSize(9)
        .text(name, 35, y + 7, { width: 300, height: 14, ellipsis: true })
        .text(String(qty), 350, y + 7, { width: 40, align: 'center' })
        .text(this.formatCurrency(price), 400, y + 7, { width: 75, align: 'right' })
        .font('Helvetica-Bold')
        .text(this.formatCurrency(lineTotal), 485, y + 7, { width: 75, align: 'right' });

      y += 24;
    });

    // Summary Box
    y += 12;
    const subtotal = order.subtotal || items.reduce((sum: number, i: any) => sum + (i.subtotal || (i.priceSnapshot * i.quantity)), 0);
    const deliveryFee = order.deliveryFee || 0;
    const total = order.total || subtotal + deliveryFee;

    // Subtotal Row
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text('Subtotal:', 380, y, { width: 90, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(this.formatCurrency(subtotal), 480, y, { width: 80, align: 'right' });

    y += 18;

    // Delivery Fee Row
    doc
      .font('Helvetica')
      .fillColor('#475569')
      .text('Delivery & Handling:', 360, y, { width: 110, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor('#15803d')
      .text(deliveryFee === 0 ? 'FREE DELIVERY' : this.formatCurrency(deliveryFee), 480, y, { width: 80, align: 'right' });

    y += 22;

    // Grand Total Highlight Pill
    doc
      .rect(350, y - 4, 220, 32)
      .fillAndStroke('#0b2519', '#b45309')
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TOTAL AMOUNT:', 360, y + 6, { width: 100, align: 'right' })
      .fillColor('#fef08a')
      .fontSize(12)
      .text(this.formatCurrency(total), 470, y + 5, { width: 90, align: 'right' });

    // Premium Terms & Watermark Banner
    doc
      .rect(25, 765, 545, 45)
      .fill('#f0fdf4');

    doc
      .fillColor('#166534')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('THANK YOU FOR YOUR PURCHASE FROM SHEENEEKA NURSERY!', 35, 775, { align: 'center', width: 525 })
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#334155')
      .text('For plant care tips, order inquiries, or assistance contact us at support@sheeneekanursery.in | Ph: +91 81231 91863', 35, 792, { align: 'center', width: 525 });

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
      .text('📍 SHIP TO / DELIVERY RECIPIENT DESTINATION', 45, y + 7);

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
      .text(`📞 CONTACT: ${phone}`, 55, y + 4);

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
        .text(`💰 CASH ON DELIVERY (COD) — COLLECT CASH AMOUNT: ${this.formatCurrency(order.total || 0)}`, 55, y + 15, { width: 485, align: 'center' });
    } else {
      doc
        .rect(45, y, 505, 45)
        .fillAndStroke('#dcfce7', '#15803d')
        .fillColor('#14532d')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('✅ PREPAID PARCEL — DO NOT COLLECT CASH', 55, y + 15, { width: 485, align: 'center' });
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
      .text('🌿 PARCEL CONTENTS / SPECIMENS ENCLOSED:', 55, y + 8);

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
