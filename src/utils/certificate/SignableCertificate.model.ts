export interface SignableCertificateDetails {
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    issuedOn?: Date;
}

export interface SignableCertificateRecipient {
    email: string;
    name: string;
    govId: string;
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
