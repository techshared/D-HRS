const http = require('http');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: data ? { 'Content-Type': 'application/json' } : {}
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== Testing D-HRS APIs ===\n');
  
  // Test health
  console.log('1. Health check...');
  let res = await testAPI('/api/v1/health');
  console.log(`   Status: ${res.status}, Body: ${res.body}\n`);
  
  // Test auth challenge
  console.log('2. Auth challenge...');
  res = await testAPI('/api/v1/auth/challenge');
  console.log(`   Status: ${res.status}, Body: ${res.body}\n`);
  
  // Test employee registration
  console.log('3. Employee registration...');
  res = await testAPI('/api/v1/employees', 'POST', {
    did: 'did:example:123',
    role: 'developer',
    department: 'engineering'
  });
  console.log(`   Status: ${res.status}, Body: ${res.body}\n`);
  
  // Test credential issuance
  console.log('4. Credential issuance...');
  res = await testAPI('/api/v1/credentials/issue', 'POST', {
    subject_did: 'did:example:123',
    credential_type: 'degree',
    data: { degree: 'BS' }
  });
  console.log(`   Status: ${res.status}, Body: ${res.body}\n`);
  
  console.log('=== Tests Complete ===');
}

runTests().catch(console.error);
