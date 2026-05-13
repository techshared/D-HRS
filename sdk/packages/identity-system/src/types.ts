/**
 * D-HRS Identity System Types
 */

export interface DIDDocument {
  id: string;
  controller: string;
  publicKey: string;
  serviceEndpoint: string;
  created: Date;
  updated: Date;
}

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
}

export interface CredentialSubject {
  id: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface CredentialSchema {
  type: string;
  fields: string[];
}

export type CredentialType = 
  | 'EmploymentCredential'
  | 'PayrollCredential'
  | 'SkillCredential'
  | 'ReviewCredential'
  | 'EducationCredential';

export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  resolutionMetadata: {
    error?: string;
    [key: string]: any;
  };
}
