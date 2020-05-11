import React, { MouseEvent, useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NativeTypes } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { useDrop, DropTargetMonitor } from 'react-dnd';

import logo from '../../../../public/assets/logo.png';

import styles from './Verifier.module.scss';

import { Certificate } from '@utils/certificate/Certificate.model';
import { readCertificate } from '@utils/certificate/Certificate';

export interface VerifierProps {
    onGoToDashboardClick: () => void;
}

export const Verifier = (props: VerifierProps): JSX.Element => {

    const [certificate, setCertificate] = useState<Certificate>();

    const processCertificate = async (file: File): Promise<void> => {
        const cert = await readCertificate(file);
        console.log({ cert });
    };

    const handleFileDrop = useCallback(
        (monitor: DropTargetMonitor) => {
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
        },
        [],
    );

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop(item, monitor) {
            handleFileDrop(monitor);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const onGoToDashboardClick = (event: MouseEvent): void => {
        event.preventDefault();
        props.onGoToDashboardClick();
    };

    const renderHeader = (): JSX.Element => {
        return (
            <nav className="navbar navbar-light bg-white">
                <a className="navbar-brand">
                    <img src={logo} className="mr-2" width="30" height="30" alt="" />
                    Verify Diploma
                </a>
                <div className="navbar-nav">
                    <a href="#" onClick={onGoToDashboardClick}>Go to wallet</a>
                </div>
            </nav>
        );
    };

    const isActive = canDrop && isOver;

    return (
        <>
            {renderHeader()}
            <div className="container-wrapper bg-light">
                <div className="container d-flex align-items-center justify-content-center">
                    <div className={styles.certDropBox} ref={drop}>
                        <div className={`${styles.dropBoxInfoWrapper} ${isActive ? styles.canDrop : ''}`}>
                            <FontAwesomeIcon icon="file-signature" className={styles.icon} />
                            <h2 className={styles.label}>Drop your certificate here</h2>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
