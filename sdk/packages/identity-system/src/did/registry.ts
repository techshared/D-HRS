/**
 * D-HRS DID Registry
 * Implements did:hrs method
 */

import { DIDDocument, DIDResolutionResult } from '../types';
import * as crypto from 'crypto';

export class DIDRegistry {
  private documents: Map<string, DIDDocument> = new Map();
  private didMethod: string = 'hrs';

  /**
   * Create a new DID
   */
  async createDID(
    controller: string,
    publicKey: string,
    serviceEndpoint: string
  ): Promise<DIDDocument> {
    const id = this.generateDID();
    
    const document: DIDDocument = {
      id,
      controller,
      publicKey,
      serviceEndpoint,
      created: new Date(),
      updated: new Date()
    };

    this.documents.set(id, document);
    return document;
  }

  /**
   * Resolve a DID
   */
  async resolveDID(did: string): Promise<DIDResolutionResult> {
    const document = this.documents.get(did);

    if (!document) {
      return {
        didDocument: null,
        resolutionMetadata: {
          error: 'notFound'
        }
      };
    }

    return {
      didDocument: document,
      resolutionMetadata: {}
    };
  }

  /**
   * Update a DID document
   */
  async updateDID(
    did: string,
    updates: Partial<DIDDocument>
  ): Promise<DIDDocument> {
    const document = this.documents.get(did);
    
    if (!document) {
      throw new Error('DID not found');
    }

    const updatedDocument: DIDDocument = {
      ...document,
      ...updates,
      id: document.id, // ID cannot be changed
      updated: new Date()
    };

    this.documents.set(did, updatedDocument);
    return updatedDocument;
  }

  /**
   * Deactivate a DID
   */
  async deactivateDID(did: string): Promise<boolean> {
    const document = this.documents.get(did);
    
    if (!document) {
      throw new Error('DID not found');
    }

    this.documents.delete(did);
    return true;
  }

  /**
   * Generate a new DID
   */
  private generateDID(): string {
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `did:${this.didMethod}:${randomBytes}`;
  }

  /**
   * Get all DIDs
   */
  async listDIDs(): Promise<DIDDocument[]> {
    return Array.from(this.documents.values());
  }

  /**
   * Check if DID exists
   */
  async exists(did: string): Promise<boolean> {
    return this.documents.has(did);
  }
}
