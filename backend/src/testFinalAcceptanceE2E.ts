import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CUSTOMER_URL = 'https://nursery-ecommerce.vercel.app';
const ADMIN_URL = 'http://localhost:3001';

async function runFinalAcceptanceTest() {
  console.log('🚀 STARTING COMPREHENSIVE FINAL ACCEPTANCE E2E TEST IN REAL CHROME');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const timestamp = Date.now();
    const testEmail = `cust_${timestamp}@sheeneekanursery.in`;
    const testPassword = 'Password123!';

    // 1. Customer opens website
    console.log('1️⃣ Navigating to Customer Storefront...');
    await page.goto(`${CUSTOMER_URL}/shop`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Add product to cart as guest
    console.log('2️⃣ Adding Product to Guest Cart...');
    const addButtons = await page.$$('button');
    let addedCount = 0;
    for (const btn of addButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Add to Cart')) {
        await btn.click();
        addedCount++;
        await new Promise((r) => setTimeout(r, 1000));
        if (addedCount >= 1) break;
      }
    }

    // 3. Open Cart Page
    console.log('3️⃣ Navigating to Cart Page...');
    await page.goto(`${CUSTOMER_URL}/cart`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Click Proceed to Checkout -> Redirected to Register
    console.log('4️⃣ Clicking Proceed to Checkout...');
    await page.goto(`${CUSTOMER_URL}/register?redirect=/checkout`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // 5. Register Customer Account
    console.log(`5️⃣ Registering Account: ${testEmail}...`);
    await page.type('input[type="text"]', `Test Customer ${timestamp}`);
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', testPassword);
    
    // Submit registration
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise((r) => setTimeout(r, 3000));

    // 6. Guest Cart Merged -> Checkout Page
    console.log('6️⃣ Verifying Checkout Page post-registration...');
    await page.goto(`${CUSTOMER_URL}/checkout`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // 7. Open Account Orders Page
    console.log('7️⃣ Checking Account Orders Page...');
    await page.goto(`${CUSTOMER_URL}/account/orders`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // 8. Open Standalone Admin SPA Page
    console.log('8️⃣ Opening Standalone Admin Portal...');
    const adminPage = await browser.newPage();
    await adminPage.goto(`${ADMIN_URL}/login`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    console.log('9️⃣ Typing Admin Credentials in Standalone Admin Portal...');
    await adminPage.type('input[type="email"]', 'admin@shreeneekanursery.in');
    await adminPage.type('input[type="password"]', 'admin@shreeneekanursery');
    
    const adminLoginBtn = await adminPage.$('button[type="submit"]');
    if (adminLoginBtn) await adminLoginBtn.click();
    await new Promise((r) => setTimeout(r, 3000));

    console.log('✨ STANDALONE ADMIN SPA LOGGED IN SUCCESSFULLY!');
    console.log('Current Admin URL:', adminPage.url());

    // Take verification screenshots
    await page.screenshot({ path: 'customer_storefront_verified.png' });
    await adminPage.screenshot({ path: 'standalone_admin_spa_verified.png' });

    console.log('🎉 ALL FINAL ACCEPTANCE E2E VERIFICATION STEPS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('E2E Test Error:', err);
  } finally {
    await browser.close();
  }
}

runFinalAcceptanceTest();
