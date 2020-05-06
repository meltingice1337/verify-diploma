import React from 'react';

import { CertificateRecipient, CertificateDetails, CertificateIssuer } from '@utils/certificate/Certificate.model';

export interface CertificateBroadcastData {
    recipient: CertificateRecipient;
    details: CertificateDetails;
    issuer: CertificateIssuer;
}

interface CertificateBroadcastProps {
    data: CertificateBroadcastData;
}

export const CertificateBroadcast = (props: CertificateBroadcastProps): JSX.Element => {
    console.log({ props });
    return (
        <div className="row">
            <div className="col-sm-6">
                {}
            </div>
        </div>
    );
};