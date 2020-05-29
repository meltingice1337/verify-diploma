import React, { useState, useEffect, useRef, ChangeEvent, useContext, MouseEvent } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useLocalStorage from '@rehooks/local-storage';

import BitboxContext from '@contexts/BitboxContext';
import WalletContext from '@contexts/WalletContext';

import CreateCertificate from '@pages/create-certificate/CreateCertificate';
import { Modal } from '@components/modal/Modal';
import { TableRow, Table } from '@components/table/Table';
import { CertificatePreview } from '@components/certificate-preview/CertificatePreview';

import { useRouter } from '@hooks/RouterHook';

import { readCertificate, toSignableCertificate, verifyCertificate } from '@utils/certificate/Certificate';
import { Certificate } from '@utils/certificate/Certificate.model';
import { encodeCertTx, createCertTx } from '@utils/certificate/Transaction';
import { formatDate } from '@utils/Dates';
import { PROCESSOR_HOST } from '@utils/Constants';

export const DashboardIssuer = (): JSX.Element => {
    const [modalShow, setModalShow] = useState(false);
    const [defaultRoute, setDefaultRoute] = useState(true);
    const [certificate, setCertificate] = useState<Certificate>();
    const [certificatesTableData, setCertificatesTableData] = useState<TableRow<Certificate>[]>([]);
    const [certsStorage, setCertsStorage] = useLocalStorage<Certificate[]>('issuer-certificates');

    const fileRef = useRef<HTMLInputElement>(null);

    const { bitbox } = useContext(BitboxContext);
    const { wallet } = useContext(WalletContext);

    const router = useRouter();

    useEffect(() => {
        setDefaultRoute(location.pathname === '/dashboard');
    }, [router.location]);

    const onAddCertificate = (): void => {
        fileRef.current!.click();
    };

    const mapCertData = (cert: Certificate): TableRow<Certificate> => {
        return { meta: cert, data: [cert.details.title, formatDate(cert.details.issuedOn.toString()), cert.recipient.name, cert.recipient.email] };
    };

    useEffect(() => {
        if (certsStorage) {
            setCertificatesTableData(certsStorage.map(mapCertData));
        }
    }, [certsStorage]);

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            const certificate = await readCertificate(file);
            if (certificatesTableData.find(ctd => ctd.meta.id === certificate!.id) !== undefined) {
                toast.error('Certificate already imported !');
                return;
            }

            if (certificate) {
                if (!certificate.final) {
                    const signableCertificate = toSignableCertificate(certificate);
                    const verified = verifyCertificate({ publicKey: wallet!.account.getPublicKeyBuffer().toString('hex'), signature: certificate.issuer.verification!.signature }, signableCertificate, bitbox);

                    if (!verified) {
                        toast.error('The recipient has changed the certificate. Beware !');
                        return;
                    }

                    router.push('/dashboard/create-certificate', { certificate });
                } else {
                    const signableCertificate = toSignableCertificate(certificate, true);
                    const verified = verifyCertificate({ publicKey: wallet!.account.getPublicKeyBuffer().toString('hex'), signature: certificate.issuer.verification!.signature }, signableCertificate, bitbox);

                    if (!verified) {
                        toast.error('You did not issue this certificate !');
                        return;
                    }
                    setCertificate(certificate);
                    setCertsStorage([...certificatesTableData.map(ctd => ctd.meta), certificate]);
                    setModalShow(true);
                }
            }
        }
    };

    const onRowClick = (cert: Certificate): void => {
        setCertificate(cert);
        setModalShow(true);
    };

    const onRevokeCertificate = async (cert: Certificate, event: MouseEvent): Promise<void> => {
        event.stopPropagation();

        const encoded = encodeCertTx(bitbox, cert, 'revoke');
        const tx = await createCertTx(encoded, wallet!, bitbox);
        const txid = await fetch(`${PROCESSOR_HOST}/rawtransactions/sendRawTransaction/${tx}`, { method: 'POST' }).then(r => r.json());

        if (txid) {
            toast.success('Certificate revoked successfully !');
        }
    };

    const renderRevoke = (row: TableRow<Certificate>): JSX.Element => {
        return <button className="btn btn-danger" onClick={onRevokeCertificate.bind(null, row.meta)}>Revoke</button>;
    };

    const renderDefault = (): JSX.Element | null => {
        if (!defaultRoute) {
            return null;
        }

        return (
            <>
                <h2 className="mb-5">Issued certificates</h2>
                <div className="page-content">
                    <div className="d-flex">
                        <Link to="/dashboard/create-certificate" className="btn btn-primary mr-3">Add new</Link>
                        <button className="btn btn-primary" onClick={onAddCertificate}>Upload certificate</button>
                        <input ref={fileRef} type="file" className="form-control-file" name="" id="" style={{ display: 'none' }} onChange={onFileChange} />
                    </div>
                    <div className="d-flex mt-3">
                        <div className="table-responsive">
                            <Table
                                customRenders={[{ index: 4, render: renderRevoke }]}
                                columns={['Title', 'Issued On', 'Recipient name', 'Recipient email', '']}
                                emptyLabel="You have not issued certificates yet"
                                data={certificatesTableData}
                                onRowClick={onRowClick}
                            />
                        </div>
                    </div>
                </div>

            </>
        );
    };

    const renderModal = (): JSX.Element => {
        return (
            <Modal className="modal-big" shown={modalShow}>
                <div className="modal-header delimiter">
                    View certificate
                    <span className="close" onClick={(): void => setModalShow(false)} >&times;</span>
                </div>
                <div className="modal-body">
                    {certificate && <CertificatePreview data={certificate} />}
                </div>
            </Modal>
        );
    };

    return (
        <>
            {renderDefault()}
            <Switch>
                <Route component={CreateCertificate} path="/dashboard/create-certificate" />
            </Switch>
            {renderModal()}
        </>

    );
};
