import { BITBOX, TransactionBuilder } from 'bitbox-sdk';

import { Certificate } from './Certificate.model';
import { WalletData } from '@contexts/WalletContext';

import { hashCertificate, toSignableCertificate } from './Certificate';
import { DecodeRawTransactionResult, TxnDetailsResult } from 'bitcoin-com-rest';

export const NETWORK_UUID = '22ab1ed2e6090763dc744f';

export const CERTIFICATE_ACTION_TYPE = {
    create: '0',
    revoke: '1'
};

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
    const utxos = await fetch(`http://localhost:44523/address/${address}/utxos`).then(res => res.json());
    const txBuilder = new bitbox.TransactionBuilder('testnet') as TransactionBuilder;
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

export const decodeTransaction = (tx: DecodeRawTransactionResult & TxnDetailsResult, bitbox: BITBOX): DecodedTransaction | null => {
    try {
        const inputScript = bitbox.Script.decode(bitbox.Script.fromASM(tx.vin[0].scriptSig.asm));
        const publicKey = (inputScript[1] as Buffer).toString('hex');
        const outputScript = bitbox.Script.fromASM(tx.vout[0].scriptPubKey.asm);
        if (!bitbox.Script.checkNullDataOutput(outputScript)) {
            throw new Error('Output is not an OP_RETURN script');
        }
        const data = bitbox.Script.decodeNullDataOutput(outputScript);
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
            blockTime: tx.confirmations > 0 ? new Date(tx.blocktime * 1000).toISOString() : null
        };
    } catch (e) {
        console.error('error while decoding the tx', e);
        return null;
    }
};
