import { BITBOX, TransactionBuilder } from 'bitbox-sdk';

import { Certificate } from './Certificate.model';
import { WalletData } from '@contexts/WalletContext';

import { hashCertificate } from './Certificate';

export const NETWORK_UUID = '22ab1ed2e6090763dc744f';

export const CERTIFICATE_ACTION_TYPE = {
    create: '0',
    revoke: '1'
};

export const encodeCertTx = (bitbox: BITBOX, certificate: Certificate, type: keyof typeof CERTIFICATE_ACTION_TYPE): Buffer => {
    const id = certificate.id;
    let encoded = `${NETWORK_UUID}${id}${type}`;
    if (type === 'create') {
        const certHash = hashCertificate(certificate);
        encoded += certHash;
    }
    const encodedBuffer = Buffer.from(encoded);
    return bitbox.Script.encodeNullDataOutput(encodedBuffer);
};

export const createCertTx = async (script: Buffer, wallet: WalletData, bitbox: BITBOX): Promise<string | null> => {
    const address = wallet.account.getAddress();
    const utxos = await bitbox.Address.utxo(address);
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
