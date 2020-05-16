import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import BitboxContext from '@contexts/BitboxContext';

import styles from './VerificationHistory.module.scss';

import { toSignableCertificate, verifyCertificate } from '@utils/certificate/Certificate';
import { getTxByCertId, TxCertValidation, validateTxCert, decodeTransaction } from '@utils/certificate/Transaction';
import { Certificate } from '@utils/certificate/Certificate.model';
import { formatDate } from '@utils/Dates';

export interface VerificationHistoryProps {
    certificate: Certificate;
    onFinish: (verificationSteps: [VerificationStepResult, boolean][]) => void;
}

export interface VerificationStepResult {
    message: string;
    valid: boolean;
    key: string;
    timeField?: string;
}

type VerificationStepFnResult = [VerificationStepResult | null, boolean];

export const VerificationHistory = (props: VerificationHistoryProps): JSX.Element => {

    const [verificationSteps, setVerificationSteps] = useState<[VerificationStepResult, boolean][]>([]);
    const [currentVerificationStep, setCurrentVerificationStep] = useState(0);
    const [processing, setProcessing] = useState(true);
    const [txCertValidation, setTxCertValidation] = useState<TxCertValidation>();

    const { bitbox } = useContext(BitboxContext);

    const renderStep = (text: string, valid: boolean, key: string, timeField?: string): JSX.Element => (
        <div className={styles.verificationStep} key={key}>
            <div className={`${styles.verificationStepDetailsWrapper} ${valid ? styles.valid : styles.invalid}`}>
                <FontAwesomeIcon icon={valid ? 'check' : 'times'} className={styles.icon} />
                <div className={styles.text}>
                    {text}
                    {timeField !== undefined && <p className={styles.timeField}>{formatDate(timeField)}</p>}
                </div>

            </div>
        </div>
    );

    const verifyRecipient = async (): Promise<VerificationStepFnResult> => {
        if (props.certificate.recipient.verification) {
            const signableCert = toSignableCertificate(props.certificate);
            const recipientVerification = verifyCertificate(props.certificate.recipient.verification, signableCert, bitbox);
            if (recipientVerification) {
                return [{ message: 'Recipient signature validated', valid: true, key: 'rec-sig-verify' }, true];
            } else {
                return [{ message: 'Recipient signature invalid', valid: false, key: 'rec-sig-verify' }, true];
            }
        }
        return [{ message: 'No recipient signature', valid: false, key: 'rec-sig-verify' }, true];
    };

    const verifyIssuer = async (): Promise<VerificationStepFnResult> => {
        const signableCert = toSignableCertificate(props.certificate, true);
        const recipientVerification = verifyCertificate(props.certificate.issuer.verification, signableCert, bitbox);
        if (recipientVerification) {
            return [{ message: 'Issuer signature validated', valid: true, key: 'iss-sig-verify' }, true];
        } else {
            return [{ message: 'Issuer signature invalid', valid: false, key: 'iss-sig-verify' }, true];
        }
    };

    const findCertTx = async (): Promise<VerificationStepFnResult> => {
        const certTxs = await getTxByCertId(props.certificate.id, props.certificate.issuer.verification?.publicKey);
        const decodedCertTx = certTxs.map(cerTx => decodeTransaction(cerTx, bitbox));
        if (certTxs.length > 0) {
            if (!decodedCertTx.every(dct => dct !== null)) {
                return [{ message: 'Could not decode certificate', valid: false, key: 'cert-tx-created' }, false];
            }

            const txCertValidity = validateTxCert(props.certificate, decodedCertTx);
            if (!txCertValidity.details?.created) {
                return [{ message: 'No certificate tx issue found', valid: false, key: 'cert-tx-created' }, false];
            }

            setTxCertValidation(txCertValidity);
            return [{ message: 'Certificate transaction issued', valid: true, key: 'cert-tx-created', timeField: txCertValidity.details?.creationTime || undefined }, true];
        } else {
            return [{ message: 'Certificate transaction not found', valid: false, key: 'cert-tx-created' }, false];
        }
    };

    const verifyCertTxMatch = async (): Promise<VerificationStepFnResult> => {
        if (txCertValidation!.validated) {
            return [{ message: 'Transaction matches certificate', valid: true, key: 'cert-tx-match' }, true];
        } else {
            return [{ message: 'Transaction does not match the certificate', valid: false, key: 'cert-tx-match' }, false];
        }
    };

    const verifyCertTxIssuer = async (): Promise<VerificationStepFnResult> => {
        if (txCertValidation!.validIssuer) {
            return [{ message: 'Transaction issuer matches', valid: true, key: 'cert-tx-issuer' }, true];
        } else {
            return [{ message: 'Transaction issuer does not match the certificate issuer', valid: false, key: 'cert-tx-issuer' }, false];
        }
    };

    const verifyCertTxRevoke = async (): Promise<VerificationStepFnResult> => {
        if (txCertValidation?.details?.revoked) {
            return [{ message: 'Certificate revoked', valid: false, key: 'cert-tx-revoked', timeField: txCertValidation.details.revocationTime! }, true];
        }

        return [null, true];
    };

    const verificationFns = useMemo(() => [verifyRecipient, verifyIssuer, findCertTx, verifyCertTxIssuer, verifyCertTxMatch, verifyCertTxRevoke], [txCertValidation]);

    const processCurrentStep = async (): Promise<void> => {
        const [result, valid] = await verificationFns[currentVerificationStep]();
        if (result) {
            setVerificationSteps([...verificationSteps, [result, valid]]);
        }

        if (valid) {
            setCurrentVerificationStep(currentVerificationStep + 1);
        } else {
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (currentVerificationStep <= verificationFns.length - 1) {
            processCurrentStep();
        } else {
            setProcessing(false);
        }
    }, [currentVerificationStep]);

    useEffect(() => {
        if (!processing) {
            props.onFinish(verificationSteps);
        }
    }, [processing]);

    const renderPlaceholder = (): JSX.Element | null => {
        return processing ? <div className={styles.verificationStep}><span className={styles.spinner} /></div> : null;
    };

    return (
        <div className={styles.verificationSteps}>
            {verificationSteps.map(vs => renderStep(vs[0].message, vs[0].valid, vs[0].key, vs[0].timeField))}
            {renderPlaceholder()}
        </div>
    );

};
