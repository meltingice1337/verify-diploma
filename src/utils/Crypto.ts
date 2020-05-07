import crypto from 'crypto';

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

export const AES = { encrypt, decrypt };

export const bufferToHex = (buffer: Buffer): string => buffer.reduce((acc, v) => acc + `${v < 16 ? '0' : ''}${v.toString(16)}`, '');