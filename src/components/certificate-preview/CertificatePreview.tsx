import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DecodeRawTransactionResult, TxnDetailsResult } from 'bitcoin-com-rest';
import { toast } from 'react-toastify';

import BitboxContext from '@contexts/BitboxContext';

import { SignableCertificateRecipient, SignableCertificateDetails } from '@utils/certificate/SignableCertificate.model';
import { CertificateIssuer, Certificate } from '@utils/certificate/Certificate.model';

import styles from './CertificatePreview.module.scss';

import { decodeTransaction, DecodedTransaction } from '@utils/certificate/Transaction';
import { hashCertificate, toSignableCertificate, verifyCertificate } from '@utils/certificate/Certificate';

export interface CertificatePreviewData {
    recipient: SignableCertificateRecipient;
    details: SignableCertificateDetails;
    issuer: CertificateIssuer;
    txid?: string;
    id?: string;
}

interface CertificatePreviewProps {
    data: CertificatePreviewData;
}

type GroupInfoObject<T> = { [key in keyof Exclude<T, object>]: string };

type GroupInfoType = 'issuer' | 'details' | 'recipient';

export const CertificatePreview = (props: CertificatePreviewProps): JSX.Element => {
    const [tx, setTx] = useState<DecodedTransaction>();

    const { bitbox } = useContext(BitboxContext);

    const getTxData = async (txid: string): Promise<void> => {
        const tx = await bitbox.RawTransactions.getRawTransaction(txid, true);
        const decoded = decodeTransaction((tx as unknown as DecodeRawTransactionResult & TxnDetailsResult), bitbox);
        if (decoded) {
            setTx(decoded);
        } else {
            toast.error('Could not decode transaction');
        }
    };

    useEffect(() => {
        if (props.data.txid) {
            getTxData(props.data.txid);
        }
    }, [props.data.txid]);

    const renderFieldInfo = ((i: number, key: string, value?: string): JSX.Element => (
        <div className="row mb-2" key={`${key}-${value}-${i}`}>
            <div className="col-sm-5">
                <p className="font-weight-bold text-capitalize">{key}</p>
            </div>
            <div className="col-sm-7">
                {value?.toString()}
            </div>
        </div>
    ));

    const renderVerification = (type: GroupInfoType): JSX.Element | null => {
        if (type !== 'recipient' && type !== 'issuer') {
            return null;
        }

        const verification = type === 'issuer' ? props.data.issuer.verification : props.data.recipient.verification;

        if (verification) {
            const signableCertificate = toSignableCertificate(props.data as unknown as Certificate, type === 'issuer');
            const verified = verifyCertificate(verification, signableCertificate, bitbox);
            return (
                <div className={`${styles.verificationCheck} ${!verified ? styles.invalid : ''}`}>
                    {verified && <><FontAwesomeIcon icon="check" className={styles.icon} /> Signature Verified</>}
                    {!verified && <><FontAwesomeIcon icon="times" className={styles.icon} /> Signature Invalid</>}
                </div>
            );
        }
        return null;
    };

    const renderTxDetails = (): JSX.Element | null => {
        if (tx) {
            const hash = hashCertificate(toSignableCertificate(props.data as unknown as Certificate, true, true));
            const valid = hash === tx?.certHash;
            return (
                <div className="col-sm-6 mb-5">
                    <div className="d-flex align-items-center mb-4">
                        <h3>Transaction Details</h3>
                        {
                            <div className={`${styles.verificationCheck} ${tx.confirmations === 0 ? styles.pending : ''} ${!valid ? styles.invalid : ''}`}>
                                {valid && tx.confirmations > 0 && <><FontAwesomeIcon icon="check" className={styles.icon} /> Certificate verified</>}
                                {valid && tx.confirmations === 0 && <><FontAwesomeIcon icon="check" className={styles.icon} /> Pending mining</>}
                                {!valid && <><FontAwesomeIcon icon="times" className={styles.icon} />Invalid</>}
                            </div>
                        }
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Transaction Id</p>
                        </div>
                        <div className="col-sm-7">
                            <a href={`https://explorer.bitcoin.com/tbch/tx/${props.data.txid}`} target="_blank" rel="noopener noreferrer">Click to check</a>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Confirmations</p>
                        </div>
                        <div className="col-sm-7">
                            {tx.confirmations}
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Date time</p>
                        </div>
                        <div className="col-sm-7">
                            {tx.blockTime}
                        </div>
                    </div>
                </div >
            );
        }
        return null;
    };

    const renderGroupInfo = <T extends unknown>(type: GroupInfoType, className: string, title: string, object: GroupInfoObject<T>, labelMap: Partial<GroupInfoObject<T>>, textFields: (keyof T)[], imageField?: keyof T): JSX.Element => {
        return (
            <div className={`${className} mb-5`}>
                <div className="d-flex align-items-center mb-4">
                    <h3>{title}</h3>
                    {renderVerification(type)}
                </div>
                {imageField && object[imageField] && <img src={object[imageField] as string} className="img-fluid mb-4" />}
                {textFields.map((key, i) => renderFieldInfo(i, (labelMap[key] || key) as string, object[key] as string))}
            </div >
        );
    };

    return (
        <div className="row">
            {renderGroupInfo<CertificateIssuer>('issuer', 'col-sm-6', 'Certificate issuer', props.data.issuer, { govRegistration: 'Government Registration' }, ['name', 'govRegistration', 'email', 'url', 'address'], 'imageUrl')}
            {renderGroupInfo<SignableCertificateRecipient>('recipient', 'col-sm-6', 'Certificate recipient', props.data.recipient, { govId: 'Government ID' }, ['name', 'govId', 'email'])}
            {renderGroupInfo<SignableCertificateDetails>('details', 'col-sm-6', 'Certificate details', props.data.details, { issuedOn: 'Issued On' }, ['title', 'issuedOn', 'subtitle', 'description'], 'imageUrl')}
            {renderTxDetails()}
        </div>
    );
};