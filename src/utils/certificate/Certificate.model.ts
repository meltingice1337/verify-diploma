import { SignableCertificateDetails, SignableCertificateRecipient, SignableCertificateIssuer } from './SignableCertificate.model';

export interface CertificateEntityVerification {
    publicKey: string;
    signature: string;
}

export interface CertificateIssuer extends SignableCertificateIssuer {
    verification: CertificateEntityVerification;
}

export interface CertificateRecipient extends SignableCertificateRecipient {
    verification?: CertificateEntityVerification;
}

export interface Certificate {
    id: string;
    details: SignableCertificateDetails;
    recipient: CertificateRecipient;
    issuer: CertificateIssuer;
}

export interface CertificateForRecipient extends Certificate {
    draft: boolean;
}
