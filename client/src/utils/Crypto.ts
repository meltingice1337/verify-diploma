import crypto from 'crypto';
import bcl, { ECSignature } from 'bitcoincashjs-lib';
import { BITBOX } from 'bitbox-sdk';

import { BCH_NETWORK } from './Constants';

const encryptionAlgorithm = 'aes-256-cbc';
const keySalt = 'cd672ac4433062662d75';

const encrypt = (data: string, passphrase: string): string => {
    const iv = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(passphrase, keySalt, 1000, 32, 'sha256');
    const cipher = crypto.createCipheriv(encryptionAlgorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + encrypted.toString('hex');
};

const decrypt = (encrypted: string, passphrase: string): string | null => {
    const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
    const encryptedData = Buffer.from(encrypted.slice(32), 'hex');
    const key = crypto.pbkdf2Sync(passphrase, keySalt, 1000, 32, 'sha256');
    try {
        const decipher = crypto.createDecipheriv(encryptionAlgorithm, key, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch {
        return null;
    }
};

const verifySignature = (hash: string, signature: string, publicKey: string, bitbox: BITBOX): boolean => {
    try {
        const signatureBuffer = Buffer.from(signature, 'hex');
        const hashBuffer = Buffer.from(hash, 'hex');
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');
        const parsedSignatureBuffer = (bcl as unknown as { ECSignature: { fromDER: (buffer: Buffer) => ECSignature } }).ECSignature.fromDER(signatureBuffer);
        const curvePair = bitbox.ECPair.fromPublicKey(publicKeyBuffer, { compressed: true, network: BCH_NETWORK });
        return curvePair.verify(hashBuffer, parsedSignatureBuffer);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return false;
    }
};

export const AES = { encrypt, decrypt };

export const ECDSA = { verifySignature };
