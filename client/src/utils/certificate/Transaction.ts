import { BITBOX, TransactionBuilder } from 'bitbox-sdk';

import { Certificate } from './Certificate.model';
import { WalletData } from '@contexts/WalletContext';

import { hashCertificate, toSignableCertificate } from './Certificate';
import { BCH_NETWORK, PROCESSOR_HOST } from '@utils/Constants';

export const NETWORK_UUID = '22ab1ed2e6090763dc744f';

export interface RawTx {
    version: number;
    locktime: number;
    ins: {
        hash: string;
        index: number;
        script: string;
        sequence: string;
    }[];
    outs: {
        value: number;
        script: string;
    }[];
    id: string;
    hash: string;
    blockTime: number;
    blockHeight: number;
    confirmations: number;
}

export const CERTIFICATE_ACTION_TYPE = {
    create: '0',
    revoke: '1'
};

export interface TxCertValidation {
    broadcasted: boolean;
    validIssuer: boolean;
    validated: boolean;
    details?: {
        blockTime: string | null;
        confirmations: number;
        created: boolean;
        revoked: boolean;
        creationTime?: string | null;
        revocationTime?: string | null;
    };
}

export interface DecodedTransaction {
    certHash: string | null;
    certId: string;
    type: typeof CERTIFICATE_ACTION_TYPE[keyof typeof CERTIFICATE_ACTION_TYPE];
    confirmations: number;
    inputPublicKey: string;
    blockTime: string | null;
}

export const encodeCertTx = (bitbox: BITBOX, certificate: Certificate, type: keyof typeof CERTIFICATE_ACTION_TYPE): Buffer => {
    const id = certificate.id;
    let encoded: Buffer = Buffer.concat([Buffer.from(NETWORK_UUID, 'hex'), Buffer.from(id, 'hex'), Buffer.from(CERTIFICATE_ACTION_TYPE[type], 'ascii')]);
    if (type === 'create') {
        const certHash = hashCertificate(toSignableCertificate(certificate, true, true));
        encoded = Buffer.concat([encoded, Buffer.from(certHash, 'hex')]);
    }
    return bitbox.Script.encodeNullDataOutput(encoded);
};

export const createCertTx = async (script: Buffer, wallet: WalletData, bitbox: BITBOX): Promise<string | null> => {
    const address = wallet.account.getAddress();
    const utxos = await fetch(`${PROCESSOR_HOST}/address/${address}/utxos`).then(res => res.json());
    const txBuilder = new bitbox.TransactionBuilder(BCH_NETWORK) as TransactionBuilder;
    if (!Array.isArray(utxos)) {
        const utxo = utxos.utxos?.[0];
        if (utxo) {
            txBuilder.addInput(utxo.txid, utxo.vout);
            const originalAmount = utxo.satoshis;
            const byteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 }) + 8 + script.length;
            const minerFee = Math.floor(byteCount * 1.01);
            const change = originalAmount - minerFee;
            txBuilder.addOutput(script, 0);
            txBuilder.addOutput(address, change);
            txBuilder.sign(0, wallet.account.keyPair, undefined, txBuilder.hashTypes.SIGHASH_ALL, utxo.satoshis);
            const transaction = txBuilder.build().toHex();
            return transaction;
        }
    }
    return null;
};

export const decodeTransaction = (tx: RawTx, bitbox: BITBOX): DecodedTransaction | null => {
    try {
        const inputScript = bitbox.Script.decode(Buffer.from(tx.ins[0].script, 'hex'));
        const publicKey = (inputScript[1] as Buffer).toString('hex');
        if (!bitbox.Script.checkNullDataOutput(Buffer.from(tx.outs[0].script, 'hex'))) {
            throw new Error('Output is not an OP_RETURN script');
        }
        const [, data] = bitbox.Script.decode(Buffer.from(tx.outs[0].script, 'hex')) as Buffer[];
        const networkUUID = data.slice(0, 11).toString('hex');
        if (networkUUID !== NETWORK_UUID) {
            throw new Error('This tx is not party of this system');
        }
        const certId = data.slice(11, 31).toString('hex');
        const type = data.slice(31, 32).toString('ascii');
        let certHash = null;
        if (type === CERTIFICATE_ACTION_TYPE.create) {
            certHash = data.slice(32).toString('hex');
        }

        return {
            inputPublicKey: publicKey,
            confirmations: tx.confirmations,
            certHash,
            certId,
            type,
            blockTime: tx.confirmations > 0 ? new Date(tx.blockTime * 1000).toISOString() : null
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('error while decoding the tx', e);
        return null;
    }
};


export const getTxByCertId = async (certId: string, inputPK?: string): Promise<RawTx[]> => {
    const scriptPart = `${NETWORK_UUID}${certId}`;
    return await fetch(`${PROCESSOR_HOST}/transactions/opreturn/${scriptPart}/${inputPK}`).then(res => res.json());
};

export const validateTxCert = (cert: Certificate, txs: (DecodedTransaction | null)[]): TxCertValidation => {
    if (txs.length === 0) {
        return { broadcasted: !!cert.final, validated: false, validIssuer: false };
    }

    const filteredTxs = txs.filter(f => !!f && f.certId === cert.id) as DecodedTransaction[];

    const creationTx = filteredTxs.find(t => t.type === CERTIFICATE_ACTION_TYPE.create);
    const revocationTx = filteredTxs.find(t => t.type === CERTIFICATE_ACTION_TYPE.revoke);
    const hash = hashCertificate(toSignableCertificate(cert, true, true));
    const validIssuer = creationTx?.inputPublicKey === cert.issuer.verification?.publicKey;

    return {
        broadcasted: true,
        validated: hash === creationTx?.certHash,
        validIssuer,
        details: {
            blockTime: revocationTx ? revocationTx.blockTime : creationTx!.blockTime,
            confirmations: (revocationTx ? revocationTx.confirmations : creationTx?.confirmations) || 0,
            created: creationTx !== undefined,
            creationTime: creationTx?.blockTime,
            revoked: revocationTx !== undefined,
            revocationTime: revocationTx?.blockTime
        }
    };
};
