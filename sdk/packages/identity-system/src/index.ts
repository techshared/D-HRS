/**
 * D-HRS Identity System - Main Entry Point
 */

import { DIDRegistry } from './did/registry';
import { CredentialIssuer } from './vc/issuer';
import { SelectiveDisclosure } from './vc/selective-disclosure';

export class DHRIdentity {
  public didRegistry: DIDRegistry;
  public credentialIssuer: CredentialIssuer | undefined;
  public selectiveDisclosure: SelectiveDisclosure;

  constructor(issuerDID?: string, privateKey?: string) {
    this.didRegistry = new DIDRegistry();
    this.selectiveDisclosure = new SelectiveDisclosure();
    
    if (issuerDID && privateKey) {
      this.credentialIssuer = new CredentialIssuer(issuerDID, privateKey);
    }
  }

  /**
   * Create a new DID
   */
  async createDID(controller: string, publicKey: string, serviceEndpoint: string) {
    return await this.didRegistry.createDID(controller, publicKey, serviceEndpoint);
  }

  /**
   * Resolve a DID
   */
  async resolveDID(did: string) {
    return await this.didRegistry.resolveDID(did);
  }

  /**
   * Issue a credential
   */
  async issueCredential(
    subjectDID: string,
    credentialType: any,
    claims: Record<string, any>,
    expirationDate?: Date
  ) {
    if (!this.credentialIssuer) {
      throw new Error('Credential issuer not initialized');
    }
    return await this.credentialIssuer.issueCredential(
      subjectDID,
      credentialType,
      claims,
      expirationDate
    );
  }

  /**
   * Verify a credential
   */
  async verifyCredential(credential: any) {
    if (!this.credentialIssuer) {
      throw new Error('Credential issuer not initialized');
    }
    return await this.credentialIssuer.verifyCredential(credential);
  }

  /**
   * Create selective disclosure
   */
  async createDisclosure(credential: any, revealedFields: string[]) {
    return await this.selectiveDisclosure.createDisclosureProof(
      credential,
      revealedFields
    );
  }

  /**
   * Verify selective disclosure
   */
  async verifyDisclosure(credential: any, proof: any) {
    return await this.selectiveDisclosure.verifyDisclosureProof(
      credential,
      proof
    );
  }

  /**
   * Create range proof
   */
  async createRangeProof(credential: any, field: string, minValue: number) {
    return await this.selectiveDisclosure.createRangeProof(
      credential,
      field,
      minValue
    );
  }
}

// Re-export types and classes
export * from './types';
export { DIDRegistry } from './did/registry';
export { CredentialIssuer } from './vc/issuer';
export { SelectiveDisclosure } from './vc/selective-disclosure';
