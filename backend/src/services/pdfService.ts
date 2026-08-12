import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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
   * Safely format currency values with Rs. / INR prefix for clean PDFKit rendering
   */
  private static formatCurrency(val: number): string {
    return `Rs. ${val.toLocaleString('en-IN')}`;
  }

  /**
   * Generate A4 Invoice PDF
   */
  static async generateInvoicePDF(order: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    // Brand Header
    doc
      .fillColor('#0f2d21')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SHEENEEKA NURSERY', 40, 40)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#386641')
      .text('BRINGING NATURE CLOSER TO YOU • OFFICIAL ORDER INVOICE', 40, 65);

    // Order Number Badge
    doc
      .rect(380, 35, 175, 40)
      .fillAndStroke('#f0fdf4', '#166534')
      .fillColor('#166534')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`INVOICE: ${order.orderNumber}`, 390, 48, { width: 155, align: 'center' });

    // Divider Line
    doc
      .moveTo(40, 90)
      .lineTo(555, 90)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();

    // Order Meta Details Section
    let y = 105;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text('ORDER DETAILS', 40, y)
      .font('Helvetica')
      .fillColor('#475569')
      .fontSize(9)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 16)
      .text(`Order Status: ${order.status}`, 40, y + 30)
      .text(`Payment Method: ${order.paymentMethod}`, 40, y + 44)
      .text(`Payment Status: ${order.paymentStatus}`, 40, y + 58);

    // Customer & Address Info Section
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text('CUSTOMER & DELIVERY DETAILS', 300, y)
      .font('Helvetica')
      .fillColor('#475569')
      .fontSize(9)
      .text(`Customer: ${order.user?.name || order.shippingAddress?.fullName || 'Customer'}`, 300, y + 16)
      .text(`Email: ${order.user?.email || 'N/A'}`, 300, y + 30)
      .text(`Phone: ${order.shippingAddress?.phone || order.user?.phone || 'N/A'}`, 300, y + 44);

    // Shipping Address Box
    const addr = order.shippingAddress || {};
    const addressStr = [
      addr.addressLine1,
      addr.addressLine2,
      `${addr.city || ''}, ${addr.state || ''} - ${addr.postalCode || ''}`,
      addr.country || 'India',
    ]
      .filter(Boolean)
      .join(', ');

    doc
      .fontSize(8.5)
      .fillColor('#334155')
      .text(`Address: ${addressStr}`, 300, y + 58, { width: 250 });

    y += 105;

    // Items Table Header
    doc
      .rect(40, y, 515, 24)
      .fill('#0f2d21')
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('ITEM DESCRIPTION', 50, y + 7)
      .text('QTY', 340, y + 7, { width: 40, align: 'center' })
      .text('UNIT PRICE', 390, y + 7, { width: 75, align: 'right' })
      .text('LINE TOTAL', 475, y + 7, { width: 70, align: 'right' });

    y += 24;

    // Items Table Rows
    const items = order.items || [];
    items.forEach((item: any, idx: number) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.rect(40, y, 515, 22).fill('#f8fafc');
      }

      const name = item.productNameSnapshot || item.product?.name || 'Nursery Specimen';
      const qty = item.quantity || 1;
      const price = item.priceSnapshot || item.price || 0;
      const lineTotal = item.subtotal || qty * price;

      doc
        .fillColor('#1e293b')
        .font('Helvetica')
        .fontSize(9)
        .text(name, 50, y + 6, { width: 280, height: 14, ellipsis: true })
        .text(String(qty), 340, y + 6, { width: 40, align: 'center' })
        .text(this.formatCurrency(price), 390, y + 6, { width: 75, align: 'right' })
        .text(this.formatCurrency(lineTotal), 475, y + 6, { width: 70, align: 'right' });

      y += 22;
    });

    // Divider
    doc
      .moveTo(40, y + 5)
      .lineTo(555, y + 5)
      .strokeColor('#cbd5e1')
      .lineWidth(1)
      .stroke();

    y += 15;

    // Financial Totals Summary
    const subtotal = order.subtotal || items.reduce((sum: number, i: any) => sum + (i.subtotal || (i.priceSnapshot * i.quantity)), 0);
    const deliveryFee = order.deliveryFee || 0;
    const total = order.total || subtotal + deliveryFee;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text('Subtotal:', 380, y, { width: 85, align: 'right' })
      .text(this.formatCurrency(subtotal), 475, y, { width: 70, align: 'right' });

    y += 16;
    doc
      .text('Delivery Fee:', 380, y, { width: 85, align: 'right' })
      .text(deliveryFee === 0 ? 'FREE' : this.formatCurrency(deliveryFee), 475, y, { width: 70, align: 'right' });

    y += 20;
    doc
      .rect(370, y - 4, 185, 26)
      .fill('#f0fdf4')
      .fillColor('#166534')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TOTAL AMOUNT:', 380, y + 3, { width: 95, align: 'right' })
      .text(this.formatCurrency(total), 475, y + 3, { width: 70, align: 'right' });

    // Footer & Gratitude Note
    doc
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .fillColor('#64748b')
      .text('Thank you for choosing Sheeneeka Nursery for your green space! For queries, contact support at +91 81231 91863.', 40, 780, { align: 'center', width: 515 });

    return this.docToBuffer(doc);
  }

  /**
   * Generate Printable Shipping Label PDF
   */
  static async generateShippingLabelPDF(order: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const addr = order.shippingAddress || {};

    // Outer Label Border
    doc
      .rect(30, 30, 535, 380)
      .lineWidth(2)
      .strokeColor('#0f2d21')
      .stroke();

    // Brand Header Bar
    doc
      .rect(32, 32, 531, 45)
      .fill('#0f2d21')
      .fillColor('#ffffff')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('SHEENEEKA NURSERY — PARCEL SHIPPING LABEL', 45, 48);

    // Order ID & Date Sub-header
    doc
      .rect(32, 77, 531, 30)
      .fill('#f1f5f9')
      .fillColor('#0f2d21')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`ORDER NUMBER: ${order.orderNumber}`, 45, 85)
      .fontSize(10)
      .font('Helvetica')
      .text(`DATE: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 380, 86, { align: 'right', width: 170 });

    // SHIP TO SECTION (PROMINENT & LARGE PRINTABLE FONT)
    let y = 125;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#386641')
      .text('SHIP TO / DELIVER RECIPIENT:', 45, y);

    y += 20;

    // Recipient Name (18pt Bold)
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text(addr.fullName || addr.name || order.user?.name || 'Customer Recipient', 45, y);

    y += 28;

    // Contact Phone (14pt Bold)
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text(`PHONE: ${addr.phone || order.user?.phone || 'N/A'}`, 45, y);

    y += 24;

    // Full Address Lines (13pt Regular)
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#334155')
      .text(addr.addressLine1 || '', 45, y, { width: 500 });

    if (addr.addressLine2) {
      y += 18;
      doc.text(addr.addressLine2, 45, y, { width: 500 });
    }

    y += 20;

    // City, State, PIN Code (14pt Bold)
    const cityStatePin = `${addr.city || ''}, ${addr.state || ''} - ${addr.postalCode || ''} (${addr.country || 'India'})`;
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#0f2d21')
      .text(cityStatePin, 45, y, { width: 500 });

    y += 35;

    // COD Payment Box Banner
    if (order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID') {
      doc
        .rect(45, y, 505, 40)
        .fillAndStroke('#fef3c7', '#d97706')
        .fillColor('#92400e')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`COLLECT CASH ON DELIVERY (COD): ${this.formatCurrency(order.total || 0)}`, 55, y + 12, { width: 485, align: 'center' });
    } else {
      doc
        .rect(45, y, 505, 40)
        .fillAndStroke('#dcfce7', '#166534')
        .fillColor('#14532d')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('PREPAID PARCEL — DO NOT COLLECT CASH', 55, y + 12, { width: 485, align: 'center' });
    }

    // Contents Brief
    y += 55;
    const items = order.items || [];
    const itemNames = items.map((i: any) => `${i.productNameSnapshot || 'Plant'} (x${i.quantity})`).join(', ');

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Contents (${items.length} items): ${itemNames}`, 45, y, { width: 505, height: 25, ellipsis: true });

    return this.docToBuffer(doc);
  }
}
