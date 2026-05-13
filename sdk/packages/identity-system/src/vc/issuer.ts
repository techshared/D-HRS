/**
 * D-HRS Verifiable Credential Issuer
 * Implements W3C VC Data Model 2.0
 */

import { VerifiableCredential, CredentialSubject, Proof, CredentialType } from '../types';
import * as crypto from 'crypto';

export class CredentialIssuer {
  private issuerDID: string;
  private privateKey: string;

  constructor(issuerDID: string, privateKey: string) {
    this.issuerDID = issuerDID;
    this.privateKey = privateKey;
  }

  /**
   * Issue a verifiable credential
   */
  async issueCredential(
    subjectDID: string,
    credentialType: CredentialType,
    claims: Record<string, any>,
    expirationDate?: Date
  ): Promise<VerifiableCredential> {
    const credentialSubject: CredentialSubject = {
      id: subjectDID,
      ...claims
    };

    const credential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://d-hrs.com/credentials/v1'
      ],
      type: ['VerifiableCredential', credentialType],
      issuer: this.issuerDID,
      issuanceDate: new Date().toISOString(),
      expirationDate: expirationDate?.toISOString(),
      credentialSubject
    };

    // Sign the credential
    credential.proof = await this.signCredential(credential);

    return credential;
  }

  /**
   * Verify a credential
   */
  async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
    try {
      // Check expiration
      if (credential.expirationDate) {
        const expiration = new Date(credential.expirationDate);
        if (expiration < new Date()) {
          return false;
        }
      }

      // Verify proof
      if (!credential.proof) {
        return false;
      }

      // In production, verify cryptographic signature
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sign a credential
   */
  private async signCredential(credential: VerifiableCredential): Promise<Proof> {
    const credentialString = JSON.stringify(credential);
    const hash = crypto.createHash('sha256').update(credentialString).digest('hex');

    return {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: `${this.issuerDID}#key-1`,
      proofPurpose: 'assertionMethod',
      proofValue: hash // In production, use actual signature
    };
  }

  /**
   * Revoke a credential
   */
  async revokeCredential(credential: VerifiableCredential): Promise<boolean> {
    // In production, add to revocation registry
    return true;
  }

  /**
   * Create employment credential
   */
  async createEmploymentCredential(
    employeeDID: string,
    employment: {
      employer: string;
      role: string;
      startDate: string;
      salary?: number;
      department: string;
    }
  ): Promise<VerifiableCredential> {
    return await this.issueCredential(
      employeeDID,
      'EmploymentCredential',
      employment
    );
  }

  /**
   * Create payroll credential
   */
  async createPayrollCredential(
    employeeDID: string,
    payroll: {
      period: string;
      grossAmount: number;
      netAmount: number;
      currency: string;
    }
  ): Promise<VerifiableCredential> {
    return await this.issueCredential(
      employeeDID,
      'PayrollCredential',
      payroll
    );
  }

  /**
   * Create skill credential
   */
  async createSkillCredential(
    employeeDID: string,
    skills: {
      skillName: string;
      level: string;
      verified: boolean;
    }
  ): Promise<VerifiableCredential> {
    return await this.issueCredential(
      employeeDID,
      'SkillCredential',
      skills
    );
  }
}
