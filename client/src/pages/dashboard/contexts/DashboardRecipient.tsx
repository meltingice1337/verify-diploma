import React, { useRef, ChangeEvent, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import useLocalStorage from '@rehooks/local-storage';

import { Modal } from '@components/modal/Modal';
import { CertificatePreview } from '@components/certificate-preview/CertificatePreview';

import WalletContext from '@contexts/WalletContext';
import BitboxContext from '@contexts/BitboxContext';

import { Table, TableRow } from '@components/table/Table';

import { CertificateForRecipient, Certificate } from '@utils/certificate/Certificate.model';

import { readCertificate, signCertificate, toSignableCertificate, downloadCertificate, verifyCertificate } from '@utils/certificate/Certificate';
import { formatDate } from '@utils/Dates';

interface ChallengeForm {
    challenge: string;
    signature: string;
}

export const DashboardRecipient = (): JSX.Element => {
    const [modalShow, setModalShow] = useState(false);
    const [certificate, setCertificate] = useState<CertificateForRecipient | Certificate>();
    const [certificatesTableData, setCertificatesTableData] = useState<TableRow<Certificate>[]>([]);
    const [certsStorage, setCertsStorage] = useLocalStorage<Certificate[]>('recipient-certificates');
    const [showModalChallenge, setShowModalChallenge] = useState(false);
    const [challengeForm, setChallengeForm] = useState({
        challenge: '',
        signature: ''
    });

    const fileRef = useRef<HTMLInputElement>(null);

    const { wallet } = useContext(WalletContext);
    const { bitbox } = useContext(BitboxContext);

    const onAddCertificate = (): void => {
        fileRef.current!.click();
    };

    const mapCertData = (cert: Certificate): TableRow<Certificate> => {
        return { meta: cert, data: [cert.details.title, formatDate(cert.details.issuedOn.toString()), cert.issuer.name, cert.issuer.email] };
    };

    useEffect(() => {
        if (certsStorage) {
            setCertificatesTableData(certsStorage.map(mapCertData));
        }
    }, [certsStorage]);

    useEffect(() => {
        if (showModalChallenge) {
            setChallengeForm({ challenge: '', signature: '' });
        }
    }, [showModalChallenge]);

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            const certificate = await readCertificate(file);
            if (certificatesTableData.find(ctd => ctd.meta.id === certificate!.id) !== undefined) {
                toast.error('Certificate already imported !');
                return;
            }

            if ((certificate as CertificateForRecipient).draft) {
                const signableCertificate = toSignableCertificate(certificate!);
                const verify = verifyCertificate(certificate?.issuer.verification, signableCertificate, bitbox);

                if (!verify) {
                    toast.error('Invalid signature from the issuer');
                    return;
                }
            } else {
                if (certificate?.recipient.verification) {
                    if (wallet?.account.getPublicKeyBuffer().toString('hex') !== certificate.recipient.verification.publicKey) {
                        toast.error('This certificate does not belong to you');
                        return;
                    }

                    const signableCertificate = toSignableCertificate(certificate);
                    const verify = verifyCertificate(certificate.recipient.verification, signableCertificate, bitbox);

                    if (!verify) {
                        toast.error('You`ve singed the certificate but the issuer changed it since then');
                        return;
                    }
                }

                const signableCertificate = toSignableCertificate(certificate!, true);
                const verify = verifyCertificate(certificate?.issuer.verification, signableCertificate, bitbox);

                if (!verify) {
                    toast.error('Invalid signature from the issuer');
                    return;
                }

                setCertificatesTableData([...certificatesTableData, mapCertData(certificate!)]);
                setCertsStorage([...certificatesTableData.map(ctd => ctd.meta), certificate!]);
            }

            setCertificate(certificate as CertificateForRecipient);
            setModalShow(true);
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

    const onRowClick = (cert: Certificate): void => {
        setCertificate(cert);
        setModalShow(true);
    };

    const onChallengeChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const challenge = event.target.value;
        const form: ChallengeForm = {
            challenge,
            signature: ''
        };
        if (challenge.length === 64) {
            const challengeBuffer = Buffer.from(challenge, 'hex');
            const signature = wallet?.account.sign(challengeBuffer).toDER().toString('hex');
            form.signature = signature;
        } else if (challenge !== '') {
            form.signature = 'Invalid signature. Please enter the 64 characters hex challenge received form the challenger !';
        }
        setChallengeForm(form);
    };

    const renderModal = (): JSX.Element => {
        return (
            <Modal className="modal-big" shown={modalShow}>
                <div className="modal-header delimiter">
                    {(certificate as CertificateForRecipient)?.draft ? 'Add certificate' : 'View certificate'}
                    <span className="close" onClick={(): void => setModalShow(false)} >&times;</span>
                </div>
                <div className="modal-body">
                    {certificate && <CertificatePreview data={certificate} />}
                </div>
                {
                    (certificate as CertificateForRecipient)?.draft &&
                    <div className="modal-footer">
                        <button className="btn btn-primary btn-lg" onClick={onSignCertificate}>Sign & Save</button>
                    </div>
                }
            </Modal>
        );
    };

    const renderVerifyChallengeModal = (): JSX.Element => {
        return (
            <Modal className="modal-fluid" shown={showModalChallenge}>
                <div className="modal-header delimiter">
                    Sign challenge
                    <span className="close" onClick={(): void => setShowModalChallenge(false)} >&times;</span>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="challenge">Challenge</label>
                        <input value={challengeForm.challenge} type="text" className="form-control" placeholder="Enter the challenge..." id="challenge" name="challenge" onChange={onChallengeChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signature">Signature</label>
                        <textarea value={challengeForm.signature} className="form-control" placeholder="Enter the challenge first" id="signature" name="signature" readOnly rows={10} />
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <>
            <h2 className="mb-5">My certificates</h2>
            <div className="page-content">
                <div className="d-flex">
                    <button className="btn btn-primary" onClick={onAddCertificate}>Add certificate</button>
                    <input ref={fileRef} type="file" className="form-control-file" name="" id="" style={{ display: 'none' }} onChange={onFileChange} />
                    <button className="btn btn-secondary ml-2" onClick={(): void => setShowModalChallenge(true)}>Verify challenge</button>
                </div>
                <div className="d-flex mt-3">
                    <div className="table-responsive">
                        <Table columns={['Title', 'Issued On', 'Issuer name', 'Issuer email']} data={certificatesTableData} onRowClick={onRowClick} />
                    </div>
                </div>
            </div>
            {renderVerifyChallengeModal()}
            {renderModal()}
        </>
    );
};
