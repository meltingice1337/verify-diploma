import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import BitboxContext from '@contexts/BitboxContext';

import { SignableCertificateRecipient, SignableCertificateDetails } from '@utils/certificate/SignableCertificate.model';
import { CertificateIssuer, Certificate, CertificateEntityVerification } from '@utils/certificate/Certificate.model';

import styles from './CertificatePreview.module.scss';

import { decodeTransaction, getTxByCertId, validateTxCert, TxCertValidation } from '@utils/certificate/Transaction';
import { toSignableCertificate, verifyCertificate } from '@utils/certificate/Certificate';
import { formatDate } from '@utils/Dates';

export interface CertificatePreviewData {
    recipient: SignableCertificateRecipient;
    details: SignableCertificateDetails;
    issuer: CertificateIssuer;
    txid?: string;
    id?: string;
    final?: boolean;
}

interface CertificatePreviewProps {
    data: CertificatePreviewData;
    previewOnly?: boolean;
}

type GroupInfoObject<T> = { [key in keyof Exclude<T, object>]: string };

type GroupInfoTransformer<T> = { [key in keyof Exclude<T, object>]: { label: string; format: <T extends unknown>(value: T) => string } }

type GroupInfoType = 'issuer' | 'details' | 'recipient';

export const CertificatePreview = (props: CertificatePreviewProps): JSX.Element => {
    const [txValidation, setTxValidation] = useState<TxCertValidation>();

    const { bitbox } = useContext(BitboxContext);

    const getTxData = async (cetId: string): Promise<void> => {
        const txs = await getTxByCertId(cetId, props.data.issuer.verification?.publicKey);
        const decodedTxs = txs.map((tx) => decodeTransaction(tx, bitbox));
        setTxValidation(validateTxCert(props.data as unknown as Certificate, decodedTxs));
    };

    useEffect(() => {
        if (props.data.final, props.data.id) {
            getTxData(props.data.id);
        }
    }, [props.data.final, props.data.id]);

    const renderFieldInfo = ((i: number, key: string, value?: string): JSX.Element | null => {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        return (
            <div className="row mb-3" key={`${key}-${value}-${i}`}>
                <div className="col-sm-5">
                    <p className="font-weight-bold text-capitalize">{key}</p>
                </div>
                <div className="col-sm-7 text-break">
                    {value?.toString()}
                </div>
            </div>
        );
    });

    const renderVerification = (type: GroupInfoType): JSX.Element | null => {
        if ((type !== 'recipient' && type !== 'issuer') || props.previewOnly) {
            return null;
        }

        const verification = type === 'issuer' ? props.data.issuer.verification : props.data.recipient.verification;

        if (verification) {
            const signableCertificate = toSignableCertificate(props.data as unknown as Certificate, type === 'issuer' && !!props.data.final);
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
        if (txValidation && !props.previewOnly) {
            const renderValidationTag = (): JSX.Element => {
                if (txValidation.broadcasted && !txValidation.details?.confirmations) {
                    return (
                        <div className={`${styles.verificationCheck} ${styles.pending}`}>
                            <FontAwesomeIcon icon="clock" className={styles.icon} /> Pending mining
                        </div>
                    );
                }

                if (txValidation.validated && txValidation.validIssuer) {
                    if (txValidation.details?.revoked) {
                        return (
                            <div className={`${styles.verificationCheck} ${styles.invalid}`}>
                                <FontAwesomeIcon icon="times" className={styles.icon} />Certificate revoked
                            </div>
                        );
                    } else {
                        return (
                            <div className={`${styles.verificationCheck}`}>
                                <FontAwesomeIcon icon="check" className={styles.icon} /> Certificate verified
                            </div>);
                    }
                } else {
                    return (
                        <div className={`${styles.verificationCheck} ${styles.invalid}`}>
                            <FontAwesomeIcon icon="times" className={styles.icon} />Invalid sigs or issuer
                        </div>
                    );
                }
            };

            if (!txValidation.broadcasted) {
                return (
                    <div className="col-sm-6 mb-5">
                        <div className="d-flex align-items-center mb-4">
                            <h3>Transaction Details</h3>
                        </div>
                        <p> Transaction not broadcasted yet</p>
                    </div>
                );
            }

            return (
                <div className="col-sm-6 mb-5">
                    <div className="d-flex align-items-center mb-4">
                        <h3>Transaction Details</h3>
                        {renderValidationTag()}
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Transaction Id</p>
                        </div>
                        <div className="col-sm-7 text-break">
                            {props.data.txid}
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Confirmations</p>
                        </div>
                        <div className="col-sm-7">
                            {txValidation.details?.confirmations || 'Unconfirmed'}
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-sm-5">
                            <p className="font-weight-bold text-capitalize">Date time</p>
                        </div>
                        <div className="col-sm-7">
                            {formatDate(txValidation.details?.blockTime || '')}
                        </div>
                    </div>
                </div >
            );
        }
        return null;
    };

    const renderGroupInfo = <T extends unknown>(
        type: GroupInfoType,
        className: string,
        title: string,
        object: GroupInfoObject<T>,
        transformers: GroupInfoTransformer<T>,
        textFields: (keyof T)[],
        imageField?: keyof T
    ): JSX.Element => {
        return (
            <div className={`${className} mb-5`}>
                <div className="d-flex align-items-center mb-4">
                    <h3>{title}</h3>
                    {renderVerification(type)}
                </div>
                {imageField && object[imageField] && <img src={object[imageField] as string} className="img-fluid mb-4" />}
                {
                    textFields.map(
                        (key, i) => renderFieldInfo(
                            i,
                            (transformers?.[key]?.label || key) as string,
                            (transformers?.[key]?.format && object[key]) ? transformers[key].format(object[key]) : object[key] as string
                        )
                    )
                }
            </div >
        );
    };

    return (
        <div className="row">
            {renderGroupInfo<CertificateIssuer>('issuer', 'col-sm-6', 'Certificate issuer', props.data.issuer, { govRegistration: { label: 'Government Registration' }, verification: { label: 'Public Key', format: ((v: CertificateEntityVerification): string => v.publicKey) } }, ['verification', 'name', 'govRegistration', 'email', 'url', 'address'], 'imageUrl')}
            {renderGroupInfo<SignableCertificateRecipient>('recipient', 'col-sm-6', 'Certificate recipient', props.data.recipient, { govId: { label: 'Government ID' }, verification: { label: 'Public Key', format: ((v: CertificateEntityVerification): string => v.publicKey) } }, ['verification', 'name', 'govId', 'email'])}
            {renderGroupInfo<SignableCertificateDetails>('details', 'col-sm-6', 'Certificate details', props.data.details, { issuedOn: { label: 'Issued On', format: formatDate } }, ['title', 'issuedOn', 'subtitle', 'description'], 'imageUrl')}
            {renderTxDetails()}
        </div>
    );
};
