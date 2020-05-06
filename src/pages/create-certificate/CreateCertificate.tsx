import React, { useState } from 'react';

import { PageContainer } from '@components/page-container/PageContainer';
import { Stepper } from '@components/stepper/Stepper';
import { CertificateDetails, CertificateDetailsFormData } from './steps/CertificateDetails';
import { IssuerDetails, IssuerDetailsFormData } from './steps/IssuerDetails';

export interface FormWithErrors<T> {
    value: T;
    checked?: boolean;
    valid?: boolean;
}

const CreateCertificate = (): JSX.Element => {
    const [activeStep, setActiveStep] = useState(1);

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
            recipientGovId: ''
        }
    });

    const renderStep = (): JSX.Element | null => {
        if (activeStep === 0) {
            return <IssuerDetails form={issuerForm} onFormChange={(form): void => setIssuerForm(form)} />;
        } else if (activeStep === 1) {
            return <CertificateDetails form={detailsForm} onFormChange={(detailsForm): void => setDetailsForm(detailsForm)} />;
        }
        return null;
    };

    const onContinue = (): void => {
        if (activeStep === 0) {
            setIssuerForm({ ...issuerForm, checked: true });
            if (issuerForm.valid) {
                setActiveStep(1);
            }
        } else if (activeStep === 1) {
            console.log({ detailsForm });
            setDetailsForm({ ...detailsForm, checked: true });
        }
    };

    return (
        <PageContainer>
            <h3 className="mb-3">Create a new certificate</h3>
            <Stepper steps={['Issuer Details', 'Certificate Details', 'third step']} activeStep={activeStep} />
            <div className="page-content">
                {renderStep()}
            </div>
            <button type="submit" className="btn btn-primary btn-lg mt-3 ml-auto" onClick={onContinue}>Continue</button>
        </PageContainer>
    );
};

export default CreateCertificate;