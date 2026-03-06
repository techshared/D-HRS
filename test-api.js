// D-HRS System Test Script
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

async function testAPI() {
  console.log('\n========== D-HRS API TEST ==========\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('   ✓ Status:', health.data);
  } catch (e) {
    console.log('   ✗ Health check failed:', e.message);
  }

  try {
    // Test 2: Get Contract Addresses
    console.log('\n2. Testing Contract Addresses...');
    const contracts = await axios.get(`${API_BASE}/contracts`);
    console.log('   ✓ Contracts:', JSON.stringify(contracts.data, null, 2));
  } catch (e) {
    console.log('   ✗ Contracts failed:', e.message);
  }

  try {
    // Test 3: Register Employee
    console.log('\n3. Testing Employee Registration...');
    const employee = await axios.post(`${API_BASE}/employees`, {
      wallet_address: '0x1234567890123456789012345678901234567890',
      did: 'did:hrs:test:001',
      personal_info_hash: '0xhash123',
      role: 'Software Engineer',
      department: 'Engineering',
      salary: 100000
    });
    console.log('   ✓ Employee registered:', employee.data);
  } catch (e) {
    console.log('   ✗ Employee registration failed:', e.message);
  }

  try {
    // Test 4: Get Employees
    console.log('\n4. Testing Get Employees...');
    const employees = await axios.get(`${API_BASE}/employees`);
    console.log('   ✓ Employees:', JSON.stringify(employees.data, null, 2));
  } catch (e) {
    console.log('   ✗ Get employees failed:', e.message);
  }

  try {
    // Test 5: Issue Credential
    console.log('\n5. Testing Credential Issuance...');
    const credential = await axios.post(`${API_BASE}/credentials/issue`, {
      subject_did: 'did:hrs:test:001',
      credential_type: 'EmploymentCredential',
      data: { role: 'Software Engineer' },
      expiry_days: 365
    });
    console.log('   ✓ Credential issued:', credential.data);
  } catch (e) {
    console.log('   ✗ Credential issuance failed:', e.message);
  }

  try {
    // Test 6: Create Payroll Run
    console.log('\n6. Testing Payroll Run...');
    const payroll = await axios.post(`${API_BASE}/payroll/run`, {
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      payments: [
        { did: '0x111', wallet: '0xAAAA', gross_amount: 10000, deductions: 3000, net_amount: 7000 }
      ]
    });
    console.log('   ✓ Payroll created:', payroll.data);
  } catch (e) {
    console.log('   ✗ Payroll failed:', e.message);
  }

  try {
    // Test 7: Create Governance Proposal
    console.log('\n7. Testing Governance Proposal...');
    const proposal = await axios.post(`${API_BASE}/governance/proposals`, {
      title: 'Update Remote Work Policy',
      description: 'Allow 4 days remote work per week',
      category: 'policy'
    });
    console.log('   ✓ Proposal created:', proposal.data);
  } catch (e) {
    console.log('   ✗ Proposal failed:', e.message);
  }

  console.log('\n========== TEST COMPLETE ==========\n');
}

testAPI();
