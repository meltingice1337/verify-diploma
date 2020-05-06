import React from 'react';

import { SignableCertificateIssuer, SignableCertificateRecipient, SignableCertificateDetails } from '@utils/certificate/SignableCertificate.model';
import { generateCertUUID } from '@utils/certificate/Certificate';

export interface CertificateBroadcastData {
    recipient: SignableCertificateRecipient;
    details: SignableCertificateDetails;
    issuer: SignableCertificateIssuer;
}

interface CertificateBroadcastProps {
    data: CertificateBroadcastData;
}

export const CertificateBroadcast = (props: CertificateBroadcastProps): JSX.Element => {

    const renderFieldInfo = ((key: string, value?: string): JSX.Element => (
        <div className="row">
            <div className="col-sm-4">
                <p className="bold">{key}</p>
            </div>
            <div className="col-sm-8">
                {value}
            </div>
        </div>
    ));

    return (
        <div className="row">
            <div className="col-sm-6">
                <h3 className="mb-4">Certificate issuer</h3>
                {Object.keys(props.data?.issuer).map(key => renderFieldInfo(key, props.data.issuer[key as keyof SignableCertificateIssuer]))}
            </div>
        </div>
    );
};