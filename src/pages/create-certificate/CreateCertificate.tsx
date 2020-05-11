import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

import WalletContext from '@contexts/WalletContext';
import BitboxContext from '@contexts/BitboxContext';

import { Stepper } from '@components/stepper/Stepper';

import { useRouter } from '@hooks/RouterHook';

import { CertificateDetails, CertificateDetailsFormData } from './steps/CertificateDetails';
import { IssuerDetails, IssuerDetailsFormData } from './steps/IssuerDetails';
import { CertificatePreviewData, CertificatePreview } from '@components/certificate-preview/CertificatePreview';

import { Certificate, CertificateForRecipient } from '@utils/certificate/Certificate.model';

import { imageFileToBase64 } from '@utils/Image';
import { generateSignCertificate, downloadCertificate, toSignableCertificate, signCertificate } from '@utils/certificate/Certificate';
import { encodeCertTx, createCertTx } from '@utils/certificate/Transaction';

export interface FormWithErrors<T> {
    value: T;
    checked?: boolean;
    valid?: boolean;
}

interface CreateCertificateLocationState {
    certificate: Certificate;
}

const CreateCertificate = (): JSX.Element => {
    const [activeStep, setActiveStep] = useState(0);
    // const [issuerForm, setIssuerForm] = useState<FormWithErrors<IssuerDetailsFormData>>({
    //     value: {
    //         name: 'Politehnica',
    //         address: 'Maslinului nr 1',
    //         email: 'poli@poli.ro',
    //         govRegistration: 'ROG9123KS',
    //         url: 'www.upt.ro',
    //         imageFile: undefined,
    //         imageUrl: 'http://upt.ro/images/universitatea-politehnica-timisoara.jpg'
    //     }
    // });
    // const [detailsForm, setDetailsForm] = useState<FormWithErrors<CertificateDetailsFormData>>({
    //     value: {
    //         certificateTitle: 'JS Engineer',
    //         certificateSubtitle: 'Best engineer in the west',
    //         certificateDescription: 'This is given because of finishing the iures training program',
    //         certificateImageFile: undefined,
    //         certificateImageUrl: 'https://www.mvps.net/docs/wp-content/uploads/2019/10/javascript2.png',
    //         recipientEmail: 'dariuscostolas@yahoo.com',
    //         recipientName: 'Darius Costolas',
    //         recipientGovId: 'ya it`s me from the gov',
    //     }
    // });
    const [issuerForm, setIssuerForm] = useState<FormWithErrors<IssuerDetailsFormData>>({
        value: {
            name: '',
            address: '',
            email: '',
            govRegistration: '',
            url: '',
            imageFile: undefined,
            imageUrl: ''
        }
    });
    const [detailsForm, setDetailsForm] = useState<FormWithErrors<CertificateDetailsFormData>>({
        value: {
            certificateTitle: '',
            certificateSubtitle: '',
            certificateDescription: '',
            certificateImageFile: undefined,
            certificateImageUrl: '',
            recipientEmail: '',
            recipientName: '',
            recipientGovId: '',
        }
    });
    const [transactionData, setTransactionData] = useState<CertificatePreviewData>();
    const [signedCertificate, setSignedCertificate] = useState<Certificate>();

    const router = useRouter<unknown, CreateCertificateLocationState>();

    const { wallet } = useContext(WalletContext);
    const { bitbox } = useContext(BitboxContext);

    useEffect(() => {
        const transformTxData = async (): Promise<CertificatePreviewData> => ({
            id: signedCertificate?.id,
            recipient: {
                name: detailsForm.value.recipientName,
                email: detailsForm.value.recipientEmail,
                govId: detailsForm.value.recipientGovId,
                verification: signedCertificate?.recipient.verification
            },
            details: {
                title: detailsForm.value.certificateTitle,
                subtitle: detailsForm.value.certificateSubtitle,
                description: detailsForm.value.certificateDescription,
                issuedOn: signedCertificate?.details.issuedOn || new Date(),
                imageUrl: detailsForm.value.certificateImageUrl || await imageFileToBase64(detailsForm.value.certificateImageFile)
            },
            issuer: {
                name: issuerForm.value.name,
                address: issuerForm.value.address,
                govRegistration: issuerForm.value.govRegistration,
                email: issuerForm.value.email,
                url: issuerForm.value.url,
                imageUrl: issuerForm.value.imageUrl || await imageFileToBase64(issuerForm.value.imageFile),
                verification: signedCertificate?.issuer.verification
            }
        });

        (async (): Promise<void> => {
            const txData = await transformTxData();
            setTransactionData(txData);
        })();
    }, [issuerForm, detailsForm]);

    useEffect(() => {
        if (router.location.state?.certificate) {
            const { issuer, recipient, details } = router.location.state.certificate;
            setActiveStep(2);
            setIssuerForm({
                value: {
                    name: issuer.name,
                    address: issuer.address,
                    email: issuer.email,
                    govRegistration: issuer.govRegistration,
                    url: issuer.url,
                    imageFile: undefined,
                    imageUrl: issuer.imageUrl

                }
            });

            setDetailsForm({
                value: {
                    certificateTitle: details.title,
                    certificateSubtitle: details.subtitle,
                    certificateDescription: details.description,
                    certificateImageFile: undefined,
                    certificateImageUrl: details.imageUrl,
                    recipientEmail: recipient.email,
                    recipientName: recipient.name,
                    recipientGovId: recipient.govId,
                }
            });

            setSignedCertificate(router.location.state.certificate);
            router.replace(router.location.pathname, undefined);
        }
    }, [router.location]);

    useEffect(() => {
        if (activeStep === 2 && transactionData && wallet && !signedCertificate) {
            const signCertificate = generateSignCertificate(transactionData, wallet);
            setSignedCertificate(signCertificate);
        }
    }, [transactionData, activeStep, wallet]);

    const broadcastCertTx = async (): Promise<void> => {
        let cert: CertificateForRecipient | Certificate = signedCertificate!;
        if (cert?.recipient.verification) {
            const recipientSignedSig = signCertificate(toSignableCertificate(cert, true), wallet!);
            cert = {
                ...cert,
                issuer: {
                    ...cert.issuer,
                    verification: {
                        publicKey: cert.issuer.verification!.publicKey,
                        signature: recipientSignedSig
                    }
                },
                draft: false
            };
        }
        const result = encodeCertTx(bitbox, cert, 'create');
        const tx = await createCertTx(result, wallet!, bitbox);
        if (tx) {
            const txid = await bitbox.RawTransactions.sendRawTransaction(tx);
            cert.txid = txid;
            cert.final = true;
            downloadCertificate(cert);
            toast.success(`The certificate was published, txid: ${txid}`);
            router.push('/dashboard');
        }
    };

    const renderStep = (): JSX.Element | null => {
        if (activeStep === 0) {
            return <IssuerDetails form={issuerForm} onFormChange={(form): void => setIssuerForm(form)} />;
        } else if (activeStep === 1) {
            return <CertificateDetails form={detailsForm} onFormChange={(detailsForm): void => setDetailsForm(detailsForm)} />;
        } else if (activeStep === 2 && transactionData) {
            return <CertificatePreview data={transactionData} />;
        }
        return null;
    };

    const onContinueClick = (): void => {
        if (activeStep === 0) {
            setIssuerForm({ ...issuerForm, checked: true });

            if (issuerForm.valid) {
                setActiveStep(1);
            }
        } else if (activeStep === 1) {
            setDetailsForm({ ...detailsForm, checked: true });

            if (detailsForm.valid) {
                setActiveStep(2);
            }
        } else if (activeStep === 2) {
            broadcastCertTx();
        }
    };

    const onSendToRecipientClick = (): void => {
        const draft: CertificateForRecipient = { ...signedCertificate!, draft: true };
        downloadCertificate(draft, `${draft.id}-${draft.recipient.email}-${draft.recipient.name}-draft`);
    };

    const renderButtons = (): JSX.Element => {
        if (activeStep === 2) {
            return (
                <div className="d-flex">
                    <button type="submit" className="btn btn-primary btn-lg mt-3 mr-auto" onClick={onSendToRecipientClick}>Send to recipient for signing</button>
                    <button type="submit" className="btn btn-success btn-lg mt-3 ml-auto" onClick={onContinueClick}>Publish</button>
                </div>
            );
        } else {
            return <button type="submit" className="btn btn-primary btn-lg mt-3 ml-auto" onClick={onContinueClick}>Continue</button>;
        }
    };

    return (
        <>
            <h3 className="mb-3">Create a new certificate</h3>
            <Stepper steps={['Issuer Details', 'Certificate Details', 'Certificate Preview & Broadcast']} activeStep={activeStep} />
            <div className="page-content">
                {renderStep()}
            </div>
            {renderButtons()}
        </>
    );
};

export default CreateCertificate;