import React, { useState } from 'react';

import { PageContainer } from '@components/page-container/PageContainer';
import { Stepper } from '@components/stepper/Stepper';
import { CertificateDetails } from './steps/CertificateDetails';
import { IssuerDetails } from './steps/IssuerDetails';

const CreateCertificate = (): JSX.Element => {
    const [activeStep, setActiveStep] = useState(0);


    const renderStep = (): JSX.Element | null => {
        if (activeStep === 0) {
            return <IssuerDetails />;
        } else if (activeStep === 1) {
            return <CertificateDetails />;
        }
        return null;
    };

    return (
        <PageContainer>
            <h3 className="mb-3">Create a new certificate</h3>
            <Stepper steps={['Issuer Details', 'Certificate Details', 'third step']} activeStep={activeStep} />
            <div className="page-content">
                {renderStep()}
            </div>
            <button type="submit" className="btn btn-primary btn-lg mt-3 ml-auto">Continue</button>
        </PageContainer>
    );
};

export default CreateCertificate;