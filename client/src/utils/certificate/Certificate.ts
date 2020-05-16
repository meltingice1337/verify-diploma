import crypto from 'crypto';
import bcl, { ECSignature } from 'bitcoincashjs-lib';
import { BITBOX } from 'bitbox-sdk';

import { WalletData } from '@contexts/WalletContext';

import { SignableCertificate } from './SignableCertificate.model';
import { Certificate, CertificateForRecipient, CertificateEntityVerification } from './Certificate.model';

import { readFile } from '@utils/File';
import { extractProperties } from '@utils/Objects';

export const generateCertUUID = (cert: Partial<SignableCertificate>): string => {
    const random = crypto.randomBytes(32).toString('hex');
    const certStr = JSON.stringify(cert);
    return crypto.createHash('ripemd160').update(random + certStr).digest('hex');
};

export const toNormalizedJSONCertObj = <T extends object>(obj: T): string => {
    if (typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date)) {
        return Object.keys(obj as object)
            .filter(k => (obj)[k as keyof T] !== undefined && obj[k as keyof T] !== null && (obj[k as keyof T] as unknown) !== '')
            .sort((key1, key2) => key1 > key2 ? 1 : -1)
            .reduce((acc, key, i, iArr): string => acc.concat(`${JSON.stringify(key)}:${toNormalizedJSONCertObj(obj[key as keyof T] as unknown as object)}${i === iArr.length - 1 ? '}' : ','}`), '{');
    } else if (Array.isArray(obj)) {
        return obj.reduce((acc, value, i, iArr): string => acc.concat(`${toNormalizedJSONCertObj(value)}${i === iArr.length - 1 ? ']' : ','}`), '[');
    } else {
        return JSON.stringify(obj);
    }
};

export const signCertificate = (signableCertificate: SignableCertificate, wallet: WalletData): string => {
    const normalizedCert = toNormalizedJSONCertObj(signableCertificate);
    const certHash = crypto.createHash('sha256').update(normalizedCert).digest();
    const signature = wallet.account.sign(certHash).toDER().toString('hex');
    return signature;
};

export const toSignableCertificate = (certificate: Certificate | CertificateForRecipient, includeRecipientSig = false, includeIssuerSig = false): SignableCertificate => {
    const { recipient, details, issuer, id } = certificate;
    const signableCertificate: Certificate = {
        id: id,
        issuer: extractProperties(issuer, ['name', 'address', 'email', 'govRegistration', 'url', 'imageUrl']),
        recipient: extractProperties(recipient, ['name', 'email', 'govId']),
        details: { ...extractProperties(details, ['title', 'subtitle', 'description', 'imageUrl']), issuedOn: details.issuedOn },
    };

    if (includeRecipientSig) {
        signableCertificate.recipient.verification = certificate.recipient.verification;
    }

    if (includeIssuerSig) {
        signableCertificate.issuer.verification = certificate.issuer.verification;
    }

    return signableCertificate;
};

export const hashCertificate = (certificate: Certificate): string => {
    const normalizedCert = toNormalizedJSONCertObj(certificate);
    const certHash = crypto.createHash('sha256').update(normalizedCert).digest('hex');
    return certHash;
};

export const generateSignCertificate = (signableCertificate: Omit<SignableCertificate, 'id'>, wallet: WalletData): Certificate => {
    const id = generateCertUUID(signableCertificate);
    const signature = signCertificate({ ...signableCertificate, id }, wallet);
    const publicKey = wallet.account.getPublicKeyBuffer().toString('hex');
    return { ...signableCertificate, id, issuer: { ...signableCertificate.issuer, verification: { publicKey, signature } } };
};

export const downloadCertificate = (cert: SignableCertificate | Certificate | CertificateForRecipient, name = `${cert.id}-${cert.recipient.name}`): void => {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(cert))}`;
    const normalizedName = name.replace(/\s+/, '_').toLowerCase();
    const anchorNode = document.createElement('a');
    anchorNode.setAttribute('href', data);
    anchorNode.setAttribute('download', `${normalizedName}.json`);
    anchorNode.style.display = 'none';
    document.body.appendChild(anchorNode);
    anchorNode.click();
    anchorNode.remove();
};

export const verifyCertificate = (verification: CertificateEntityVerification | undefined, cert: SignableCertificate | Certificate, bitbox: BITBOX): boolean => {
    if (!verification?.signature || !verification?.publicKey) {
        return false;
    }

    try {
        const publicKeyBuffer = Buffer.from(verification.publicKey, 'hex');
        const signatureBuffer = Buffer.from(verification.signature, 'hex');
        const parsedSignatureBuffer = (bcl as unknown as { ECSignature: { fromDER: (buffer: Buffer) => ECSignature } }).ECSignature.fromDER(signatureBuffer);
        const curvePair = bitbox.ECPair.fromPublicKey(publicKeyBuffer, { compressed: true, network: 'testnet' });
        const normalizedCert = toNormalizedJSONCertObj(cert);
        const certHash = crypto.createHash('sha256').update(normalizedCert).digest();
        return curvePair.verify(certHash, parsedSignatureBuffer);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('error while verifying', e);
        return false;
    }
};

export const readCertificate = async (file: File): Promise<Certificate | CertificateForRecipient | null> => {
    const json = await readFile(file);
    if (json) {
        const obj = JSON.parse(json);
        return obj;
    }
    return null;
};

// export const verifySignature = (cert: Certificate): boolean => {

// };
