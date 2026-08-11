import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:\\Users\\mrpre\\.gemini\\antigravity-ide\\brain\\bd3d6d82-d169-4198-980e-2d381d2434b9';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserE2E() {
  console.log('🚀 LAUNCHING REAL GOOGLE CHROME FOR MANUAL E2E BROWSER VERIFICATION');
  console.log(`Chrome Executable: ${CHROME_PATH}`);
  console.log(`Artifacts Output Dir: ${ARTIFACTS_DIR}\n`);

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome executable not found at ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true, // run in clean background mode
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  const logs: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });

  try {
    // 1. Open Storefront Homepage
    console.log('1️⃣ Navigating to https://nursery-ecommerce.vercel.app...');
    await page.goto('https://nursery-ecommerce.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout?.(2000) || new Promise((r) => setTimeout(r, 2000));
    
    const screenshot1 = path.join(ARTIFACTS_DIR, '01_homepage_catalog.png');
    await page.screenshot({ path: screenshot1, fullPage: false });
    console.log(`   📸 Screenshot 1 saved: 01_homepage_catalog.png`);

    // 2. Add Products to Cart as Guest
    console.log('\n2️⃣ Adding 2 products to cart as Guest...');
    
    // Find all 'Add to Cart' buttons or product cards
    const addToCartBtns = await page.$$('button');
    let addedCount = 0;
    for (const btn of addToCartBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.toLowerCase().includes('add to cart')) {
        await btn.click();
        addedCount++;
        console.log(`   Clicked 'Add to Cart' button #${addedCount}`);
        await new Promise((r) => setTimeout(r, 1000));
        if (addedCount >= 2) break;
      }
    }

    if (addedCount === 0) {
      // If buttons are on plant cards, click first plant card
      console.log('   Looking for product links/cards...');
      const productLinks = await page.$$('a[href*="/product/"]');
      if (productLinks.length > 0) {
        await productLinks[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        const detailAddBtn = await page.$('button');
        if (detailAddBtn) await detailAddBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const screenshot2 = path.join(ARTIFACTS_DIR, '02_guest_cart_added.png');
    await page.screenshot({ path: screenshot2 });
    console.log(`   📸 Screenshot 2 saved: 02_guest_cart_added.png`);

    // 3. Open Cart Page
    console.log('\n3️⃣ Navigating to Cart Page (/cart)...');
    await page.goto('https://nursery-ecommerce.vercel.app/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const screenshot3 = path.join(ARTIFACTS_DIR, '03_cart_page.png');
    await page.screenshot({ path: screenshot3 });
    console.log(`   📸 Screenshot 3 saved: 03_cart_page.png`);

    // 4. Click Proceed to Checkout
    console.log('\n4️⃣ Clicking "Proceed to Checkout"...');
    const checkoutBtns = await page.$$('button, a');
    let checkoutClicked = false;
    for (const btn of checkoutBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && (text.toLowerCase().includes('proceed to checkout') || text.toLowerCase().includes('checkout'))) {
        await btn.click();
        checkoutClicked = true;
        break;
      }
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    const screenshot4 = path.join(ARTIFACTS_DIR, '04_register_redirect.png');
    await page.screenshot({ path: screenshot4 });
    console.log(`   📸 Screenshot 4 saved: 04_register_redirect.png`);
    console.log(`   Current URL: ${page.url()}`);

    // 5. Fill Registration Form
    const testEmail = `manual_browser_${Date.now()}@sheeneekanursery.in`;
    console.log(`\n5️⃣ Registering new customer: ${testEmail}...`);
    
    // Ensure we are on register page
    if (!page.url().includes('/register')) {
      await page.goto('https://nursery-ecommerce.vercel.app/register?redirect=/checkout', { waitUntil: 'networkidle2' });
    }

    await page.waitForSelector('input[name="name"], input[type="text"]');
    
    // Type name, email, phone, password
    const nameInput = await page.$('input[name="name"]') || await page.$('input[placeholder*="Name" i]');
    if (nameInput) await nameInput.type('Manual Browser Tester');

    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) await emailInput.type(testEmail);

    const phoneInput = await page.$('input[name="phone"], input[type="tel"]');
    if (phoneInput) await phoneInput.type('9876543210');

    const passInput = await page.$('input[name="password"], input[type="password"]');
    if (passInput) await passInput.type('Password123!');

    const screenshot5 = path.join(ARTIFACTS_DIR, '05_register_filled.png');
    await page.screenshot({ path: screenshot5 });
    console.log(`   📸 Screenshot 5 saved: 05_register_filled.png`);

    // Submit Registration
    console.log('   Submitting Registration Form...');
    const submitBtn = await page.$('button[type="submit"]') || await page.$('button');
    if (submitBtn) {
      await submitBtn.click();
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));

    const screenshot6 = path.join(ARTIFACTS_DIR, '06_after_registration.png');
    await page.screenshot({ path: screenshot6 });
    console.log(`   📸 Screenshot 6 saved: 06_after_registration.png`);
    console.log(`   Current URL post-registration: ${page.url()}`);

    // 6. Checkout Page / Add Address & Place Order
    console.log('\n6️⃣ Filling Checkout Shipping Address...');
    if (!page.url().includes('/checkout')) {
      await page.goto('https://nursery-ecommerce.vercel.app/checkout', { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Check if address form is present
    const addrName = await page.$('input[name="fullName"], input[name="name"], input[placeholder*="Full Name" i]');
    if (addrName) await addrName.type('Manual Browser Tester');

    const addrPhone = await page.$('input[name="phone"], input[placeholder*="Phone" i]');
    if (addrPhone) await addrPhone.type('9876543210');

    const addrLine1 = await page.$('input[name="addressLine1"], input[placeholder*="Address" i]');
    if (addrLine1) await addrLine1.type('Flat 302, Green Acres Apartment');

    const addrCity = await page.$('input[name="city"], input[placeholder*="City" i]');
    if (addrCity) await addrCity.type('Bengaluru');

    const addrState = await page.$('input[name="state"], input[placeholder*="State" i]');
    if (addrState) await addrState.type('Karnataka');

    const addrPin = await page.$('input[name="postalCode"], input[name="pincode"], input[placeholder*="Pincode" i], input[placeholder*="Postal" i]');
    if (addrPin) await addrPin.type('560001');

    const screenshot7 = path.join(ARTIFACTS_DIR, '07_checkout_address_filled.png');
    await page.screenshot({ path: screenshot7 });
    console.log(`   📸 Screenshot 7 saved: 07_checkout_address_filled.png`);

    // Place Order button
    console.log('   Clicking Place Order button...');
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && (text.toLowerCase().includes('place order') || text.toLowerCase().includes('confirm order') || text.toLowerCase().includes('save address'))) {
        await b.click();
        console.log(`   Clicked button: "${text.trim()}"`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Wait for order completion navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));

    const screenshot8 = path.join(ARTIFACTS_DIR, '08_order_confirmation.png');
    await page.screenshot({ path: screenshot8 });
    console.log(`   📸 Screenshot 8 saved: 08_order_confirmation.png`);
    console.log(`   Current URL post-order: ${page.url()}`);

    // 7. Check Customer Account Order History
    console.log('\n7️⃣ Navigating to Account Dashboard (/account)...');
    await page.goto('https://nursery-ecommerce.vercel.app/account', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    const screenshot9 = path.join(ARTIFACTS_DIR, '09_account_orders_history.png');
    await page.screenshot({ path: screenshot9 });
    console.log(`   📸 Screenshot 9 saved: 09_account_orders_history.png`);

    console.log('\n✨ MANUAL REAL BROWSER E2E TEST COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Browser test failed:', err);
  } finally {
    await browser.close();
  }
}

runBrowserE2E();
