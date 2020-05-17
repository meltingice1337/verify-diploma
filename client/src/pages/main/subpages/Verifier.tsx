import React, { MouseEvent, useState, useMemo, useEffect, ChangeEvent, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NativeTypes } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { useDrop, DropTargetMonitor } from 'react-dnd';


import BitboxContext from '@contexts/BitboxContext';

import logo from '../../../../public/assets/logo.png';

import styles from './Verifier.module.scss';

import { Certificate } from '@utils/certificate/Certificate.model';
import { readCertificate, generateCertUUID } from '@utils/certificate/Certificate';
import { CertificatePreview } from '@components/certificate-preview/CertificatePreview';
import { VerificationHistory, VerificationStepResult } from '@components/verification-history/VerificationHistory';
import { ECDSA } from '@utils/Crypto';

interface VerifierProps {
    onGoToDashboardClick: () => void;
}

interface ChallengeForm {
    challenge: string;
    signature: string;
    valid: boolean | undefined;
}

export const Verifier = (props: VerifierProps): JSX.Element => {
    const [certificate, setCertificate] = useState<Certificate>();
    const [verificationSteps, setVerificationSteps] = useState<[VerificationStepResult, boolean][]>();
    const [challengeForm, setChallengeForm] = useState<ChallengeForm>({
        challenge: '',
        signature: '',
        valid: undefined
    });

    const { bitbox } = useContext(BitboxContext);

    const processCertificate = async (file: File): Promise<void> => {
        const cert = await readCertificate(file);
        if (cert) {
            setCertificate(cert);
        } else {
            toast.error('Cannot read/decode certificate !');
        }
    };

    const handleFileDrop = (monitor: DropTargetMonitor): void => {
        if (monitor) {
            const files = monitor.getItem().files as File[];
            if (files.length > 1) {
                toast.error('You can only upload one certificate at a time !');
                return;
            }

            if (!files[0].name.endsWith('.json')) {
                toast.error('The certificate should be in a json file');
                return;
            }

            processCertificate(files[0]);
        }
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop(_, monitor) {
            handleFileDrop(monitor);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isActive = useMemo(() => canDrop && isOver, [canDrop, isOver]);

    const onGoToDashboardClick = (event: MouseEvent): void => {
        event.preventDefault();
        props.onGoToDashboardClick();
    };

    const renderHeader = (): JSX.Element => {
        return (
            <nav className="navbar navbar-light bg-white p-3">
                <a className="navbar-brand">
                    <img src={logo} className="mr-2" width="40" height="40" alt="" />
                    Verify Diploma
                </a>
                <div className="navbar-nav">
                    <a href="#" onClick={onGoToDashboardClick}>Go to wallet</a>
                </div>
            </nav>
        );
    };

    const renderDropBox = (): JSX.Element | null => {
        if (!certificate) {
            return (
                <div className={styles.certDropBox} ref={drop}>
                    <div className={`${styles.dropBoxInfoWrapper} ${isActive ? styles.canDrop : ''}`}>
                        <FontAwesomeIcon icon="file-signature" className={styles.icon} />
                        <h2 className={styles.label}>Drop your certificate here</h2>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderStatus = (): JSX.Element => {
        if (verificationSteps) {
            const bestVfStep = verificationSteps[verificationSteps.length - 1];
            const valid = bestVfStep[1] && bestVfStep[0].key !== 'cert-tx-revoked';
            return (
                <div className={`page-content mb-4 full ${styles.verificationStatus} ${valid ? styles.valid : styles.invalid}`}>
                    {valid && 'Valid certificate'}
                    {!valid && bestVfStep[0].message}
                </div>
            );
        } else {
            return <div className={`page-content ${styles.verificationStatus} ${styles.processing}`}>Processing</div>;
        }
    };

    useEffect(() => {
        if (certificate) {
            setChallengeForm({ ...challengeForm, challenge: generateCertUUID(certificate, true) });
        }
    }, [certificate]);

    const onFormChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setChallengeForm({ ...challengeForm, [event.target.name]: event.target.value, valid: undefined });
    };

    const onValidateChallenge = (): void => {
        if (challengeForm.challenge === '' || challengeForm.signature === '') {
            return undefined;
        }
        const valid = ECDSA.verifySignature(challengeForm.challenge, challengeForm.signature, certificate!.issuer.verification!.publicKey, bitbox);
        setChallengeForm({ ...challengeForm, valid });
    };

    const renderRecipientChallenge = (): JSX.Element | null => {
        if (certificate && certificate.recipient.verification) {
            return (
                <div className="page-content mt-4 full">
                    <div className="p-3">
                        {
                            challengeForm.valid !== undefined &&
                            <div className="row mb-3">
                                <h3 className={`${styles.challengeValidity} ${challengeForm.valid ? styles.valid : styles.invalid}`}>{challengeForm.valid ? 'Challenge verified' : 'Invalid challenge signature'}</h3>
                            </div>
                        }
                        <div className="row align-items-center">
                            Challenge
                            <form className="col row">
                                <div className="col-sm-4">
                                    <input required type="text" name="challenge" className="form-control" placeholder="Challenge" value={challengeForm.challenge} onChange={onFormChange} />
                                </div>
                                <div className="col-sm-8">
                                    <input required type="text" name="signature" className="form-control" placeholder="Recipient's response" value={challengeForm.signature} onChange={onFormChange} />
                                </div>
                            </form>
                            <button className="btn btn-primary" onClick={onValidateChallenge}>Verify</button>
                        </div>
                        <div className="row mt-3">
                            <p>Send the challenge to the recipient and input the recipient`s response</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCertificateVerification = (): JSX.Element | null => {
        if (certificate) {
            return (
                <>
                    {renderStatus()}
                    <div className="row">
                        <div className="col-sm-8">
                            <div className="page-content">
                                <CertificatePreview data={certificate} previewOnly />
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="page-content">
                                <VerificationHistory certificate={certificate} onFinish={(vs): void => setVerificationSteps(vs)} />
                            </div>
                        </div>
                    </div>
                    {renderRecipientChallenge()}
                </>
            );
        }
        return null;
    };

    return (
        <>
            {renderHeader()}
            <div className="container-wrapper bg-light">
                <div className="container d-flex align-items-center justify-content-center">
                    {renderDropBox()}
                    {renderCertificateVerification()}
                </div>
            </div>
        </>
    );
};
