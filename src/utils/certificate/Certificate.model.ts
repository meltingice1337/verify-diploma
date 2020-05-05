export interface CertificateDetails {
    id?: string;
    name: string;
    subtitle?: string;
    description?: string;
    image?: string;
}

export interface CertificatePartyVerification {
    publicKey: string;
    signature: string;
}

export interface CertificateRecipient {
    email: string;
    name: string;
    verification?: CertificatePartyVerification;
}

export interface CertificateIssuer {
    name: string;
    address: string;
    url?: string;
    email: string;
    govRegistration: string;
    verification?: CertificatePartyVerification;
}

export interface Certificate {
    details: CertificateDetails;
    recipient: string;
    issuer: CertificateIssuer;
}
