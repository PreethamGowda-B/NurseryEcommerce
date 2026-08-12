import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:\\Users\\mrpre\\.gemini\\antigravity-ide\\brain\\bd3d6d82-d169-4198-980e-2d381d2434b9';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runAdminBrowserE2E() {
  console.log('🚀 LAUNCHING GOOGLE CHROME FOR ADMIN PANEL VERIFICATION');
  console.log(`Target URL: https://nursery-ecommerce.vercel.app/login`);

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
    // 1. Open Dedicated Admin Login Page
    console.log('1️⃣ Navigating to /admin/login...');
    await page.goto('https://nursery-ecommerce.vercel.app/admin/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Fill Admin Credentials
    console.log('2️⃣ Typing Super Admin Credentials...');
    const emailInp = await page.$('input[type="email"]');
    if (emailInp) await emailInp.type('admin@sheeneekanursery.in');

    const passInp = await page.$('input[type="password"]');
    if (passInp) await passInp.type('Admin@Sheeneeka2026!');

    const screenshotAdmin1 = path.join(ARTIFACTS_DIR, 'admin_01_login_filled.png');
    await page.screenshot({ path: screenshotAdmin1 });
    console.log(`   📸 Screenshot saved: admin_01_login_filled.png`);

    // 3. Submit Admin Login
    console.log('3️⃣ Submitting Admin Login...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));

    console.log(`   Current URL post-login: ${page.url()}`);

    // If redirected to /account or homepage, navigate to /admin
    if (!page.url().includes('/admin')) {
      await page.goto('https://nursery-ecommerce.vercel.app/admin', { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 3000));
    }

    const screenshotAdmin2 = path.join(ARTIFACTS_DIR, 'admin_02_overview_dashboard.png');
    await page.screenshot({ path: screenshotAdmin2 });
    console.log(`   📸 Screenshot saved: admin_02_overview_dashboard.png`);

    // 4. Click Orders Tab
    console.log('4️⃣ Switching to Orders Management Tab...');
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Orders')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    const screenshotAdmin3 = path.join(ARTIFACTS_DIR, 'admin_03_orders_tab.png');
    await page.screenshot({ path: screenshotAdmin3 });
    console.log(`   📸 Screenshot saved: admin_03_orders_tab.png`);

    // 5. Click Products Tab
    console.log('5️⃣ Switching to Product Catalog Management Tab...');
    const allBtns2 = await page.$$('button');
    for (const b of allBtns2) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Products')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    const screenshotAdmin4 = path.join(ARTIFACTS_DIR, 'admin_04_products_tab.png');
    await page.screenshot({ path: screenshotAdmin4 });
    console.log(`   📸 Screenshot saved: admin_04_products_tab.png`);

    console.log('\n✨ ADMIN PANEL REAL BROWSER E2E VERIFICATION COMPLETE!');
  } catch (err) {
    console.error('❌ Admin browser test error:', err);
  } finally {
    await browser.close();
  }
}

runAdminBrowserE2E();
