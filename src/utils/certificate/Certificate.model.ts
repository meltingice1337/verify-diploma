export interface CertificateDetails {
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
}

export interface CertificateRecipientVerification {
    publicKey: string;
    signature: string;
}

export interface CertificateRecipient {
    email: string;
    name: string;
    govId: string;
    verification?: CertificateRecipientVerification;
}

export interface CertificateIssuer {
    name: string;
    address: string;
    email: string;
    govRegistration: string;
    url?: string;
    imageUrl?: string;
    verification?: CertificateRecipientVerification;
}

export interface Certificate {
    id: string;
    nonce: string;
    details: CertificateDetails;
    recipient: string;
    issuer: CertificateIssuer;
}
