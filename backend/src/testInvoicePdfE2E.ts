import { PDFService } from './services/pdfService.js';
import prisma from './db/client.js';

async function runPdfTests() {
  console.log('🧪 RUNNING AUTOMATED TESTS FOR PDF INVOICE & SHIPPING LABEL GENERATION...');

  // Fetch an existing order from DB
  const order = await prisma.order.findFirst({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      payment: true,
    },
  });

  if (!order) {
    throw new Error('❌ Test Failed: No orders found in database to test PDF generation!');
  }

  let parsedAddress = null;
  try {
    parsedAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch {
    parsedAddress = null;
  }

  const orderData = {
    ...order,
    shippingAddress: parsedAddress,
  };

  // Test 1: Generate Invoice PDF Buffer
  console.log(`📄 Generating Invoice PDF for Order ${order.orderNumber}...`);
  const invoiceBuffer = await PDFService.generateInvoicePDF(orderData);
  if (!Buffer.isBuffer(invoiceBuffer) || invoiceBuffer.length < 500) {
    throw new Error(`❌ Test Failed: Invalid Invoice PDF Buffer generated (length: ${invoiceBuffer.length})`);
  }
  // Check PDF Magic Header %PDF-
  const invoiceHeader = invoiceBuffer.subarray(0, 5).toString('ascii');
  if (invoiceHeader !== '%PDF-') {
    throw new Error(`❌ Test Failed: Invoice Buffer does not start with %PDF- header! Received: ${invoiceHeader}`);
  }
  console.log(`✅ TEST 1 PASSED: Valid A4 Invoice PDF generated (${invoiceBuffer.length} bytes, Header: ${invoiceHeader})`);

  // Test 2: Generate Shipping Label PDF Buffer
  console.log(`🏷️ Generating Shipping Label PDF for Order ${order.orderNumber}...`);
  const labelBuffer = await PDFService.generateShippingLabelPDF(orderData);
  if (!Buffer.isBuffer(labelBuffer) || labelBuffer.length < 500) {
    throw new Error(`❌ Test Failed: Invalid Shipping Label PDF Buffer generated (length: ${labelBuffer.length})`);
  }
  const labelHeader = labelBuffer.subarray(0, 5).toString('ascii');
  if (labelHeader !== '%PDF-') {
    throw new Error(`❌ Test Failed: Shipping Label Buffer does not start with %PDF- header! Received: ${labelHeader}`);
  }
  console.log(`✅ TEST 2 PASSED: Valid Parcel Shipping Label PDF generated (${labelBuffer.length} bytes, Header: ${labelHeader})`);

  // Test 3: Verify Data Integrity (Historical Price & Address Snapshots)
  console.log('🔍 Verifying Data Integrity of Order Snapshots...');
  if (!order.shippingAddressSnapshot) {
    throw new Error('❌ Test Failed: Order missing immutable shippingAddressSnapshot!');
  }
  if (!order.items || order.items.length === 0) {
    throw new Error('❌ Test Failed: Order has no item snapshots!');
  }
  for (const item of order.items) {
    if (!item.productNameSnapshot || !item.priceSnapshot) {
      throw new Error(`❌ Test Failed: Item ${item.id} missing productNameSnapshot or priceSnapshot!`);
    }
  }
  console.log(`✅ TEST 3 PASSED: All ${order.items.length} items contain historical productNameSnapshot & priceSnapshot!`);

  console.log('🎉 ALL PDF INVOICE & SHIPPING LABEL AUTOMATED TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runPdfTests().catch((err) => {
  console.error('❌ PDF Automated Test Suite Failed:', err);
  process.exit(1);
});
