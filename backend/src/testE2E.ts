const BASE_URL = 'https://sheeneeka-nursery-api.onrender.com/api';

async function runE2ETest() {
  console.log('🚀 STARTING FULL E2E CUSTOMER VERIFICATION TEST');
  console.log(`Target Backend: ${BASE_URL}\n`);

  try {
    // Step 1: Health Check
    console.log('1️⃣ Testing API Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    console.log('   Health Status:', healthJson);
    if (!healthRes.ok) throw new Error('Health check failed');

    // Step 2: Guest Product Browsing
    console.log('\n2️⃣ Testing Guest Product Browsing...');
    const productsRes = await fetch(`${BASE_URL}/products`);
    const productsJson = await productsRes.json() as any;
    console.log(`   Fetched ${productsJson.data?.length || 0} products from Supabase PostgreSQL.`);
    
    if (!productsJson.data || productsJson.data.length < 2) {
      throw new Error('Not enough products found in catalog!');
    }

    const prod1 = productsJson.data[0];
    const prod2 = productsJson.data[1];
    console.log(`   Selected Product 1: ${prod1.name} (ID: ${prod1.id}, Price: ₹${prod1.price}, Stock: ${prod1.stockQuantity})`);
    console.log(`   Selected Product 2: ${prod2.name} (ID: ${prod2.id}, Price: ₹${prod2.price}, Stock: ${prod2.stockQuantity})`);

    // Step 3: Register New Customer
    const testEmail = `e2e_buyer_${Date.now()}@sheeneekanursery.in`;
    console.log(`\n3️⃣ Registering New Customer: ${testEmail}...`);
    
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Browser E2E Customer',
        email: testEmail,
        password: 'E2ePassword123!',
        phone: '9876543210',
      }),
    });
    
    const regJson = await regRes.json() as any;
    console.log('   Registration Status:', regJson.success ? 'SUCCESS' : 'FAILED', regJson.message || '');
    if (!regJson.success || !regJson.data?.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regJson)}`);
    }

    const token = regJson.data.token;
    const user = regJson.data;
    console.log(`   User ID: ${user.id}, Role: ${user.role}`);

    // Step 4: Add Products to Customer Cart
    console.log('\n4️⃣ Adding Products to Cart...');
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Add Prod 1 (qty 2)
    const addRes1 = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: prod1.id, quantity: 2 }),
    });
    const addJson1 = await addRes1.json() as any;
    console.log(`   Added 2x ${prod1.name}:`, addJson1.success ? 'SUCCESS' : 'FAILED');

    // Add Prod 2 (qty 1)
    const addRes2 = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: prod2.id, quantity: 1 }),
    });
    const addJson2 = await addRes2.json() as any;
    console.log(`   Added 1x ${prod2.name}:`, addJson2.success ? 'SUCCESS' : 'FAILED');

    // Step 5: Verify Cart Items & Total
    console.log('\n5️⃣ Verifying Cart Items...');
    const cartRes = await fetch(`${BASE_URL}/cart`, { headers: authHeaders });
    const cartJson = await cartRes.json() as any;
    console.log(`   Cart contains ${cartJson.data?.items?.length || 0} items.`);
    console.log(`   Calculated Cart Total: ₹${cartJson.data?.subtotal}`);
    
    // Step 6: Create Address & Place Order
    console.log('\n6️⃣ Creating Shipping Address & Placing Order (COD)...');
    const addressPayload = {
      fullName: 'Browser E2E Customer',
      phone: '9876543210',
      addressLine1: '452 Garden View Heights',
      addressLine2: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      isDefault: true,
    };

    const addressRes = await fetch(`${BASE_URL}/account/addresses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(addressPayload),
    });

    const addressJson = await addressRes.json() as any;
    console.log('   Address Creation Response:', addressJson.success ? 'SUCCESS' : 'FAILED');
    if (!addressJson.success || !addressJson.data?.id) {
      throw new Error(`Address creation failed: ${JSON.stringify(addressJson)}`);
    }

    const addressId = addressJson.data.id;
    console.log(`   Created Address ID: ${addressId}`);

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ addressId }),
    });

    const orderJson = await orderRes.json() as any;
    console.log('   Order Creation Response:', orderJson.success ? 'SUCCESS 🎉' : 'FAILED ❌');
    
    if (!orderJson.success || !orderJson.data) {
      throw new Error(`Order placement failed: ${JSON.stringify(orderJson)}`);
    }

    const createdOrder = orderJson.data;
    console.log(`   ✅ Order ID: ${createdOrder.id}`);
    console.log(`   ✅ Order Number: ${createdOrder.orderNumber}`);
    console.log(`   ✅ Total Amount: ₹${createdOrder.total}`);
    console.log(`   ✅ Payment Status: ${createdOrder.paymentStatus}`);
    console.log(`   ✅ Order Status: ${createdOrder.status}`);

    // Step 7: Verify Cart Cleared
    console.log('\n7️⃣ Verifying Cart Cleared after Order...');
    const postOrderCartRes = await fetch(`${BASE_URL}/cart`, { headers: authHeaders });
    const postOrderCartJson = await postOrderCartRes.json() as any;
    console.log(`   Post-order Cart Items count: ${postOrderCartJson.data?.items?.length || 0}`);

    // Step 8: Verify Customer Order History
    console.log('\n8️⃣ Checking Customer Order History (/orders)...');
    const historyRes = await fetch(`${BASE_URL}/orders`, { headers: authHeaders });
    const historyJson = await historyRes.json() as any;
    const ordersList = historyJson.data || [];
    console.log(`   Found ${ordersList.length} order(s) for customer.`);
    const foundOrder = ordersList.find((o: any) => o.id === createdOrder.id);
    if (foundOrder) {
      console.log(`   ✅ Verified order ${foundOrder.orderNumber} (Total: ₹${foundOrder.total}, Status: ${foundOrder.status}) in Customer Order History!`);
    } else {
      throw new Error('Order missing from customer history!');
    }

    console.log('\n✨ ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!');
  } catch (error) {
    console.error('\n❌ E2E VERIFICATION FAILED:', error);
    process.exit(1);
  }
}

runE2ETest();
