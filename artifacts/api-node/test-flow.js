async function test() {
  const BASE = 'http://127.0.0.1:5000';
  const results = [];

  const check = async (name, fn) => {
    try {
      await fn();
      results.push({ name, status: 'PASS' });
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
    }
  };

  // 1. Health check
  await check('GET /api/healthz', async () => {
    const r = await fetch(`${BASE}/api/healthz`);
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 2. Login
  let token;
  await check('POST /api/auth/login', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const data = await r.json();
    token = data.token;
  });

  const auth = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 3. GET /api/auth/me
  await check('GET /api/auth/me', async () => {
    const r = await fetch(`${BASE}/api/auth/me`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 4. Create Department
  let deptId;
  await check('POST /api/departments', async () => {
    const r = await fetch(`${BASE}/api/departments`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ name: 'Test Dept ' + Date.now(), code: 'TD' + Date.now(), description: 'Test' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    deptId = d.id;
  });

  // 5. List Departments
  await check('GET /api/departments', async () => {
    const r = await fetch(`${BASE}/api/departments`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 6. Update Department
  await check('PUT /api/departments/:id', async () => {
    const r = await fetch(`${BASE}/api/departments/${deptId}`, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ name: 'Updated Dept', code: 'UD' + Date.now(), description: 'Updated' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 7. Create Role
  let roleId;
  await check('POST /api/roles', async () => {
    const r = await fetch(`${BASE}/api/roles`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ name: 'Test Role ' + Date.now(), code: 'TR' + Date.now(), description: 'Test' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    roleId = d.id;
  });

  // 8. List Roles
  await check('GET /api/roles', async () => {
    const r = await fetch(`${BASE}/api/roles`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 9. Update Role
  await check('PUT /api/roles/:id', async () => {
    const r = await fetch(`${BASE}/api/roles/${roleId}`, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ name: 'Updated Role', code: 'UR' + Date.now(), description: 'Updated' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 10. Create User
  let userId;
  await check('POST /api/users', async () => {
    const r = await fetch(`${BASE}/api/users`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@example.com`, password: 'test123', departmentId: deptId, roleId: roleId })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    userId = d.id;
  });

  // 11. List Users
  await check('GET /api/users', async () => {
    const r = await fetch(`${BASE}/api/users`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 12. Get User
  await check('GET /api/users/:id', async () => {
    const r = await fetch(`${BASE}/api/users/${userId}`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 13. Update User
  await check('PUT /api/users/:id', async () => {
    const r = await fetch(`${BASE}/api/users/${userId}`, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ name: 'Updated User' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 14. Create Document
  let docId;
  await check('POST /api/documents', async () => {
    const r = await fetch(`${BASE}/api/documents`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ subject: 'Test Doc', referenceNumber: 'REF-' + Date.now(), description: 'Test', urgency: 'LOW', classification: 'PUBLIC' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    docId = d.id;
  });

  // 15. List Documents
  await check('GET /api/documents', async () => {
    const r = await fetch(`${BASE}/api/documents`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 16. Get Document
  await check('GET /api/documents/:id', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 17. Update Document
  await check('PUT /api/documents/:id', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}`, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ subject: 'Updated Subject' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 18. Sign Document
  await check('POST /api/documents/:id/sign', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/sign`, {
      method: 'POST', headers: auth, body: '{}'
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 19. Add Minute
  await check('POST /api/documents/:id/minutes', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/minutes`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ text: 'Test minute entry' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 20. List Minutes
  await check('GET /api/documents/:id/minutes', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/minutes`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 21. Forward Document
  await check('POST /api/documents/:id/forward', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/forward`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ toUserId: userId, minuteText: 'Please review' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 22. List Movements
  await check('GET /api/documents/:id/movements', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/movements`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 23. List Attachments
  await check('GET /api/documents/:id/attachments', async () => {
    const r = await fetch(`${BASE}/api/documents/${docId}/attachments`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // 24. Workflow Rules
  let ruleId;
  await check('POST /api/workflow-rules', async () => {
    const r = await fetch(`${BASE}/api/workflow-rules`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ fromDepartmentId: deptId, toDepartmentId: deptId, ruleType: 'AUTO_FORWARD' })
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    ruleId = d.id;
  });

  await check('GET /api/workflow-rules', async () => {
    const r = await fetch(`${BASE}/api/workflow-rules`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  await check('DELETE /api/workflow-rules/:id', async () => {
    const r = await fetch(`${BASE}/api/workflow-rules/${ruleId}`, {
      method: 'DELETE', headers: auth
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  });

  // 25. Audit Logs
  await check('GET /api/audit-logs', async () => {
    const r = await fetch(`${BASE}/api/audit-logs`, { headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // Clean up - delete test user, dept, role
  await check('DELETE /api/users/:id', async () => {
    const r = await fetch(`${BASE}/api/users/${userId}`, { method: 'DELETE', headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  await check('DELETE /api/departments/:id', async () => {
    const r = await fetch(`${BASE}/api/departments/${deptId}`, { method: 'DELETE', headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  await check('DELETE /api/roles/:id', async () => {
    const r = await fetch(`${BASE}/api/roles/${roleId}`, { method: 'DELETE', headers: auth });
    if (!r.ok) throw new Error(`${r.status}`);
  });

  // Summary
  console.log('\n===== API TEST RESULTS =====');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  results.forEach(r => {
    console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}${r.error ? ' - ' + r.error : ''}`);
  });
  console.log(`\n${passed}/${results.length} passed, ${failed} failed`);
}

test();
