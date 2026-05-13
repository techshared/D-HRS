/**
 * D-HRS Selective Disclosure
 * Allows proving specific attributes without revealing all
 */

import { VerifiableCredential } from '../types';
import * as crypto from 'crypto';

export interface DisclosureProof {
  revealedFields: string[];
  proof: string;
  timestamp: Date;
}

export class SelectiveDisclosure {
  /**
   * Create a selective disclosure proof
   */
  async createDisclosureProof(
    credential: VerifiableCredential,
    revealedFields: string[]
  ): Promise<DisclosureProof> {
    // Validate fields exist
    const allFields = Object.keys(credential.credentialSubject);
    for (const field of revealedFields) {
      if (!allFields.includes(field) && field !== 'id') {
        throw new Error(`Field ${field} not found in credential`);
      }
    }

    // Create proof with only revealed fields
    const revealedData: Record<string, any> = {};
    for (const field of revealedFields) {
      if (field === 'id') {
        revealedData['id'] = credential.credentialSubject.id;
      } else {
        revealedData[field] = credential.credentialSubject[field];
      }
    }

    // Generate proof
    const proofString = JSON.stringify({
      credential: credential['@context'],
      type: credential.type,
      issuer: credential.issuer,
      revealed: revealedData,
      timestamp: new Date().toISOString()
    });

    const proof = crypto.createHash('sha256').update(proofString).digest('hex');

    return {
      revealedFields,
      proof,
      timestamp: new Date()
    };
  }

  /**
   * Verify a selective disclosure proof
   */
  async verifyDisclosureProof(
    credential: VerifiableCredential,
    disclosureProof: DisclosureProof
  ): Promise<boolean> {
    try {
      // Reconstruct proof
      const revealedData: Record<string, any> = {};
      for (const field of disclosureProof.revealedFields) {
        if (field === 'id') {
          revealedData['id'] = credential.credentialSubject.id;
        } else {
          revealedData[field] = credential.credentialSubject[field];
        }
      }

      const proofString = JSON.stringify({
        credential: credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        revealed: revealedData,
        timestamp: disclosureProof.timestamp.toISOString()
      });

      const expectedProof = crypto.createHash('sha256').update(proofString).digest('hex');

      return expectedProof === disclosureProof.proof;
    } catch {
      return false;
    }
  }

  /**
   * Create range proof (e.g., salary > 100k)
   */
  async createRangeProof(
    credential: VerifiableCredential,
    field: string,
    minValue: number
  ): Promise<DisclosureProof> {
    const value = credential.credentialSubject[field];
    
    if (typeof value !== 'number') {
      throw new Error(`Field ${field} is not a number`);
    }

    if (value < minValue) {
      throw new Error(`Value ${value} is less than minimum ${minValue}`);
    }

    // Create proof that value >= minValue without revealing exact value
    const proofString = JSON.stringify({
      credentialType: credential.type,
      issuer: credential.issuer,
      field,
      condition: 'gte',
      threshold: minValue,
      satisfied: true,
      timestamp: new Date().toISOString()
    });

    const proof = crypto.createHash('sha256').update(proofString).digest('hex');

    return {
      revealedFields: [`${field}:gte:${minValue}`],
      proof,
      timestamp: new Date()
    };
  }
}
