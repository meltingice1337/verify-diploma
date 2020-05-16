import React, { MouseEvent, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NativeTypes } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { useDrop, DropTargetMonitor } from 'react-dnd';

import logo from '../../../../public/assets/logo.png';

import styles from './Verifier.module.scss';

import { Certificate } from '@utils/certificate/Certificate.model';
import { readCertificate } from '@utils/certificate/Certificate';
import { CertificatePreview } from '@components/certificate-preview/CertificatePreview';
import { VerificationHistory } from '@components/verification-history/VerificationHistory';

export interface VerifierProps {
    onGoToDashboardClick: () => void;
}

export const Verifier = (props: VerifierProps): JSX.Element => {

    const [certificate, setCertificate] = useState<Certificate>();


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

    const renderCertificateVerification = (): JSX.Element | null => {
        if (certificate) {
            return (
                <div className="row">
                    <div className="col-sm-8">
                        <div className="page-content">
                            <CertificatePreview data={certificate} previewOnly />
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="page-content">
                            <VerificationHistory certificate={certificate} />
                        </div>
                    </div>
                </div>
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
