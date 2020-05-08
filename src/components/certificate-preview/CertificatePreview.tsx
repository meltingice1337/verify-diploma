import React from 'react';

import { SignableCertificateIssuer, SignableCertificateRecipient, SignableCertificateDetails } from '@utils/certificate/SignableCertificate.model';

export interface CertificatePreviewData {
    recipient: SignableCertificateRecipient;
    details: SignableCertificateDetails;
    issuer: SignableCertificateIssuer;
}

interface CertificatePreviewProps {
    data: CertificatePreviewData;
}

type GroupInfoObject<T> = { [key in keyof Exclude<T, object>]: string };

export const CertificatePreview = (props: CertificatePreviewProps): JSX.Element => {
    const renderFieldInfo = ((i: number, key: string, value?: string): JSX.Element => (
        <div className="row mb-2" key={`${key}-${value}-${i}`}>
            <div className="col-sm-5">
                <p className="font-weight-bold text-capitalize">{key}</p>
            </div>
            <div className="col-sm-7">
                {value?.toString()}
            </div>
        </div>
    ));

    const renderGroupInfo = <T extends unknown>(className: string, title: string, object: GroupInfoObject<T>, labelMap: Partial<GroupInfoObject<T>>, textFields: (keyof T)[], imageField?: keyof T): JSX.Element => {
        return (
            <div className={`${className} mb-5`}>
                <h3 className="mb-4">{title}</h3>
                {imageField && object[imageField] && <img src={object[imageField] as string} className="img-fluid mb-4" />}
                {textFields.map((key, i) => renderFieldInfo(i, (labelMap[key] || key) as string, object[key] as string))}
            </div>
        );
    };

    return (
        <div className="row">
            {renderGroupInfo<SignableCertificateIssuer>('col-sm-6', 'Certificate issuer', props.data.issuer, { govRegistration: 'Government Registration' }, ['name', 'govRegistration', 'email', 'url', 'address'], 'imageUrl')}
            {renderGroupInfo<SignableCertificateRecipient>('col-sm-6', 'Certificate recipient', props.data.recipient, { govId: 'Government ID' }, ['name', 'govId', 'email'])}
            {renderGroupInfo<SignableCertificateDetails>('col-sm-6', 'Certificate details', props.data.details, { issuedOn: 'Issued On' }, ['title', 'issuedOn', 'subtitle', 'description'], 'imageUrl')}
        </div>
    );
};