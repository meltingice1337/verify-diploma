export interface CertificateDetails {
    id?: string;
    name: string;
    subtitle?: string;
    description?: string;
    image?: string;
}

export interface CertificateRecipient {
    email: string;
    name: string;
    verification?: string;
}

export interface CertificateRecipientVerification {
    publicKey: string;
    signature: string;
}

export interface Certificate {
    details: CertificateDetails;
    recipient: string;
}