import React, { useRef, ChangeEvent, useState, useContext } from 'react';

import { Modal } from '@components/modal/Modal';
import { CertificatePreview } from '@components/certificate-preview/CertificatePreview';

import WalletContext from '@contexts/WalletContext';

import { CertificateForRecipient } from '@utils/certificate/Certificate.model';

import { readCertificate, signCertificate, toSignableCertificate, downloadCertificate } from '@utils/certificate/Certificate';

export const DashboardRecipient = (): JSX.Element => {
    const [modalShow, setModalShow] = useState(false);
    const [certificate, setCertificate] = useState<CertificateForRecipient>();

    const fileRef = useRef<HTMLInputElement>(null);

    const { wallet } = useContext(WalletContext);

    const onAddCertificate = (): void => {
        fileRef.current!.click();
    };

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            const certificate = await readCertificate(file);
            if (certificate && (certificate as CertificateForRecipient).draft) {
                setModalShow(true);
                setCertificate(certificate as CertificateForRecipient);
            }
        }

    };

    const onSignCertificate = (): void => {
        if (certificate && wallet) {
            const signableCertificate = toSignableCertificate(certificate);
            const signature = signCertificate(signableCertificate, wallet);
            const publicKey = wallet.account.getPublicKeyBuffer().toString('hex');
            const name = `${signableCertificate.id}-${signableCertificate.recipient.email}-${signableCertificate.recipient.name}-signed`;
            downloadCertificate({ ...certificate, recipient: { ...certificate.recipient, verification: { signature, publicKey } }, draft: false }, name);
        }
    };

    const renderModal = (): JSX.Element => {
        return (
            <Modal className="modal-big" shown={modalShow}>
                <div className="modal-header delimiter">
                    Add certificate
                    <span className="close" onClick={(): void => setModalShow(false)} >&times;</span>
                </div>
                <div className="modal-body">
                    {certificate && <CertificatePreview data={certificate} />}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary btn-lg" onClick={onSignCertificate}>Sign & Save</button>
                </div>
            </Modal>
        );
    };

    return (
        <>
            <div className="d-flex">
                <button className="btn btn-primary" onClick={onAddCertificate}>Add certificate</button>
                <input ref={fileRef} type="file" className="form-control-file" name="" id="" style={{ display: 'none' }} onChange={onFileChange} />
            </div>
            {renderModal()}
        </>
    );
};