import crypto from 'crypto';

import { SignableCertificate } from './SignableCertificate.model';

export const generateCertUUID = (cert: Partial<SignableCertificate>): string => {
    const randomArr = crypto.randomBytes(32);
    const randomStr = randomArr.reduce((str: string, value: number): string => str.concat(value.toString(16)), '');
    const certStr = JSON.stringify(cert);

    return crypto.createHash('ripemd160').update(randomStr + certStr).digest('hex');
};