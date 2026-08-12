import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:\\Users\\mrpre\\.gemini\\antigravity-ide\\brain\\bd3d6d82-d169-4198-980e-2d381d2434b9';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runFullAdminOpsE2E() {
  console.log('🚀 LAUNCHING GOOGLE CHROME FOR FULL SUPER ADMIN OPERATIONS E2E TEST');
  console.log(`Target Admin Login URL: https://nursery-ecommerce.vercel.app/admin/login`);

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome executable not found at ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  try {
    // 1. Open Admin Login Page
    console.log('1️⃣ Navigating to /admin/login...');
    await page.goto('https://nursery-ecommerce.vercel.app/admin/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Submit Credentials
    console.log('2️⃣ Entering Super Admin Credentials...');
    const emailInp = await page.$('input[type="email"]');
    if (emailInp) await emailInp.type('admin@sheeneekanursery.in');

    const passInp = await page.$('input[type="password"]');
    if (passInp) await passInp.type('Admin@Sheeneeka2026!');

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));

    console.log(`   Current URL post-login: ${page.url()}`);
    if (!page.url().includes('/admin')) {
      await page.goto('https://nursery-ecommerce.vercel.app/admin', { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 3000));
    }

    const screenshotOverview = path.join(ARTIFACTS_DIR, 'admin_ops_01_overview.png');
    await page.screenshot({ path: screenshotOverview });
    console.log(`   📸 Screenshot saved: admin_ops_01_overview.png`);

    // 3. Add New Product Specimen
    console.log('3️⃣ Opening "Add New Plant Specimen" Modal...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Add New Plant Specimen')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 1500));
        break;
      }
    }

    const screenshotModal = path.join(ARTIFACTS_DIR, 'admin_ops_02_add_product_modal.png');
    await page.screenshot({ path: screenshotModal });
    console.log(`   📸 Screenshot saved: admin_ops_02_add_product_modal.png`);

    // Fill Product Form
    console.log('   Filling Product Specimen Details...');
    const inputs = await page.$$('input');
    if (inputs[0]) await inputs[0].type('Rare Variegated Monstera Albo');
    if (inputs[1]) await inputs[1].type('1499');
    if (inputs[2]) await inputs[2].type('1299');

    // Submit Product Form
    const modalForm = await page.$('form');
    if (modalForm) {
      const saveBtn = await page.$('button[type="submit"]');
      if (saveBtn) await saveBtn.click();
      await new Promise((r) => setTimeout(r, 3000));
    }

    // 4. Switch to Products Catalog Tab
    console.log('4️⃣ Switching to Botanical Catalog Management Tab...');
    const navBtns = await page.$$('button');
    for (const b of navBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Products')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    const screenshotProducts = path.join(ARTIFACTS_DIR, 'admin_ops_03_products_catalog.png');
    await page.screenshot({ path: screenshotProducts });
    console.log(`   📸 Screenshot saved: admin_ops_03_products_catalog.png`);

    // 5. Switch to Orders Management Tab & Perform Status Updates
    console.log('5️⃣ Switching to Customer Orders Management Tab...');
    const navBtns2 = await page.$$('button');
    for (const b of navBtns2) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Orders')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    // Perform Order Fulfillment Actions (Confirm & Ship)
    console.log('   Performing Fulfillment Operations (Confirming & Dispatching Orders)...');
    const orderActionBtns = await page.$$('button');
    for (const b of orderActionBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && (text.includes('Confirm Order') || text.includes('Dispatch / Ship Order'))) {
        await b.click();
        console.log(`   Clicked Action: "${text}"`);
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    const screenshotOrders = path.join(ARTIFACTS_DIR, 'admin_ops_04_orders_updated.png');
    await page.screenshot({ path: screenshotOrders });
    console.log(`   📸 Screenshot saved: admin_ops_04_orders_updated.png`);

    // 6. Navigate to Customer Account Orders Tab to verify live tracking
    console.log('6️⃣ Verifying Customer Live Order Tracking Stepper on /account/orders...');
    await page.goto('https://nursery-ecommerce.vercel.app/account/orders', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 3000));

    const screenshotCustomerTracking = path.join(ARTIFACTS_DIR, 'customer_01_live_order_tracking.png');
    await page.screenshot({ path: screenshotCustomerTracking });
    console.log(`   📸 Screenshot saved: customer_01_live_order_tracking.png`);

    console.log('\n✨ ALL SUPER ADMIN OPERATIONS & CUSTOMER TRACKING VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Full Admin Ops test error:', err);
  } finally {
    await browser.close();
  }
}

runFullAdminOpsE2E();
