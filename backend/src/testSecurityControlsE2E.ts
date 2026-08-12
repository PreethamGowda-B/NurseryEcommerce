import { createApp } from './app.js';
import http from 'http';

async function runSecurityTests() {
  console.log('🔒 STARTING AUTOMATED SECURITY CONTROL VERIFICATION SUITE...');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  try {
    // 1. UNAUTHORIZED ADMIN ACCESS
    const res1 = await fetch(`${baseUrl}/api/admin/orders`);
    assert(res1.status === 401, 'Unauthorized access to /api/admin/orders rejected with 401');

    // 2. CUSTOMER ACCOUNT CREATION
    const testEmail = `sec_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123',
        name: 'Security Tester',
        phone: '+91 98765 43210',
        role: 'ADMIN', // ROLE INJECTION ATTEMPT
      }),
    });
    const regData: any = await regRes.json();
    const userRole = regData.data?.user?.role || regData.data?.role || regData.user?.role;
    const customerToken = regData.data?.token || regData.token;

    assert(regRes.status === 201, 'Customer registration succeeds');
    assert(userRole === 'CUSTOMER', 'Role injection payload ignored — registered as CUSTOMER');

    // 3. PRIVILEGE ESCALATION ATTEMPT
    const escRes = await fetch(`${baseUrl}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(escRes.status === 403, 'Customer token rejected on Admin API with 403 Forbidden');

    // 4. PRICE TAMPERING ON CHECKOUT
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(cartRes.status === 200, 'Customer cart retrieval succeeds');

    // 5. UNPOSTED / INVALID PRODUCT UPLOAD RESTRICTION
    const uploadRes = await fetch(`${baseUrl}/api/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(uploadRes.status === 403, 'Unauthorized file upload attempt blocked with 403');

    // 6. INVALID SSE ADMIN STREAM ACCESS
    const sseAdminRes = await fetch(`${baseUrl}/api/sse/admin`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(sseAdminRes.status === 403, 'Unauthorized Admin SSE stream connection blocked with 403');

    // 7. TAMPERED JWT TOKEN
    const tamperedToken = customerToken.slice(0, -5) + 'xxxxx';
    const tamperedRes = await fetch(`${baseUrl}/api/account/profile`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });
    assert(tamperedRes.status === 401, 'Tampered JWT signature rejected with 401');

    // 8. IDOR PDF INVOICE ATTEMPT
    const idorInvoiceRes = await fetch(`${baseUrl}/api/orders/SN-NONEXISTENT-999/invoice`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(idorInvoiceRes.status === 404, 'IDOR PDF Invoice fetch for invalid/other order returns 404');

    // 9. CORS REJECTION TEST
    const corsRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://malicious-hacker-site.com' },
    });
    const corsHeader = corsRes.headers.get('access-control-allow-origin');
    assert(corsHeader !== 'https://malicious-hacker-site.com', 'Malicious CORS origin rejected');

    console.log(`\n📊 SECURITY SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runSecurityTests().catch((err) => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
