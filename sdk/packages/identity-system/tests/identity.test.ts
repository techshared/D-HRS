/**
 * D-HRS Identity System Tests
 */

import { DHRIdentity } from '../src/index';

describe('D-HRS Identity System', () => {
  let identity: DHRIdentity;
  let issuerDID: string;

  beforeEach(async () => {
    issuerDID = 'did:hrs:issuer:test123';
    identity = new DHRIdentity(issuerDID, 'test_private_key');
  });

  describe('DID Registry', () => {
    it('should create a DID', async () => {
      const did = await identity.createDID(
        'did:hrs:controller:123',
        'public_key_123',
        'https://api.d-hrs.com/vc'
      );

      expect(did).toBeDefined();
      expect(did.id).toContain('did:hrs:');
      expect(did.controller).toBe('did:hrs:controller:123');
    });

    it('should resolve a DID', async () => {
      const did = await identity.createDID(
        'controller',
        'publicKey',
        'endpoint'
      );

      const result = await identity.resolveDID(did.id);
      expect(result.didDocument).toBeDefined();
      expect(result.didDocument!.id).toBe(did.id);
    });

    it('should return null for non-existent DID', async () => {
      const result = await identity.resolveDID('did:hrs:nonexistent');
      expect(result.didDocument).toBeNull();
      expect(result.resolutionMetadata.error).toBe('notFound');
    });

    it('should update a DID', async () => {
      const did = await identity.createDID(
        'controller',
        'publicKey',
        'endpoint'
      );

      const updated = await identity.didRegistry.updateDID(did.id, {
        serviceEndpoint: 'https://new-endpoint.com'
      });

      expect(updated.serviceEndpoint).toBe('https://new-endpoint.com');
    });

    it('should list all DIDs', async () => {
      await identity.createDID('c1', 'pk1', 'ep1');
      await identity.createDID('c2', 'pk2', 'ep2');

      const dids = await identity.didRegistry.listDIDs();
      expect(dids.length).toBe(2);
    });
  });

  describe('Verifiable Credentials', () => {
    it('should issue employment credential', async () => {
      const employeeDID = 'did:hrs:employee:123';
      
      const credential = await identity.issueCredential(
        employeeDID,
        'EmploymentCredential',
        {
          employer: 'D-HRS Corp',
          role: 'Software Engineer',
          startDate: '2024-01-01',
          department: 'Engineering'
        }
      );

      expect(credential).toBeDefined();
      expect(credential.type).toContain('EmploymentCredential');
      expect(credential.issuer).toBe(issuerDID);
      expect(credential.credentialSubject.id).toBe(employeeDID);
    });

    it('should issue payroll credential', async () => {
      const employeeDID = 'did:hrs:employee:123';
      
      const credential = await identity.issueCredential(
        employeeDID,
        'PayrollCredential',
        {
          period: '2024-01',
          grossAmount: 10000,
          netAmount: 8000,
          currency: 'USD'
        }
      );

      expect(credential).toBeDefined();
      expect(credential.type).toContain('PayrollCredential');
      expect(credential.credentialSubject.grossAmount).toBe(10000);
    });

    it('should verify valid credential', async () => {
      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        { role: 'Engineer' }
      );

      const isValid = await identity.verifyCredential(credential);
      expect(isValid).toBe(true);
    });

    it('should reject expired credential', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        { role: 'Engineer' },
        pastDate
      );

      const isValid = await identity.verifyCredential(credential);
      expect(isValid).toBe(false);
    });
  });

  describe('Selective Disclosure', () => {
    it('should create disclosure proof', async () => {
      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        {
          employer: 'D-HRS Corp',
          role: 'Engineer',
          salary: 120000,
          department: 'Engineering'
        }
      );

      const proof = await identity.createDisclosure(credential, ['role', 'department']);

      expect(proof).toBeDefined();
      expect(proof.revealedFields).toContain('role');
      expect(proof.revealedFields).toContain('department');
      expect(proof.revealedFields).not.toContain('salary');
    });

    it('should verify disclosure proof', async () => {
      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        {
          employer: 'D-HRS Corp',
          role: 'Engineer',
          salary: 120000
        }
      );

      const proof = await identity.createDisclosure(credential, ['role']);
      const isValid = await identity.verifyDisclosure(credential, proof);

      expect(isValid).toBe(true);
    });

    it('should create range proof', async () => {
      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        { salary: 120000 }
      );

      const proof = await identity.createRangeProof(credential, 'salary', 100000);

      expect(proof).toBeDefined();
      expect(proof.revealedFields[0]).toContain('salary:gte:100000');
    });

    it('should reject range proof if condition not met', async () => {
      const credential = await identity.issueCredential(
        'did:hrs:employee:123',
        'EmploymentCredential',
        { salary: 80000 }
      );

      await expect(
        identity.createRangeProof(credential, 'salary', 100000)
      ).rejects.toThrow('Value 80000 is less than minimum 100000');
    });
  });
});
