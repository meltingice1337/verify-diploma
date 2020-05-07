import { CertificateEntityVerification } from './Certificate.model';

export interface SignableCertificateDetails {
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
}

export interface SignableCertificateRecipient {
    email: string;
    name: string;
    govId: string;
    verification?: CertificateEntityVerification;
}

export interface SignableCertificateIssuer {
    name: string;
    address: string;
    email: string;
    govRegistration: string;
    url?: string;
    imageUrl?: string;
}

export interface SignableCertificate {
    id: string;
    details: SignableCertificateDetails;
    recipient: SignableCertificateRecipient;
    issuer: SignableCertificateIssuer;
}
