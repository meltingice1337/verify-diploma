import { SignableCertificateDetails, SignableCertificateRecipient, SignableCertificateIssuer } from './SignableCertificate.model';

export interface CertificateEntityVerification {
    publicKey: string;
    signature: string;
}

export interface CertificateIssuer extends SignableCertificateIssuer {
    verification?: CertificateEntityVerification;
}

export interface Certificate {
    id: string;
    nonce: string;
    details: SignableCertificateDetails;
    recipient: SignableCertificateRecipient;
    issuer: CertificateIssuer;
}