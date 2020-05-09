import React from 'react';

import { SignableCertificateRecipient, SignableCertificateDetails } from '@utils/certificate/SignableCertificate.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './CertificatePreview.module.scss';
import { CertificateIssuer } from '@utils/certificate/Certificate.model';

export interface CertificatePreviewData {
    recipient: SignableCertificateRecipient;
    details: SignableCertificateDetails;
    issuer: CertificateIssuer;
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

    const renderVerification = (meta: SignableCertificateRecipient | CertificateIssuer): JSX.Element | null => {
        if (meta.verification) {
            return (
                <div className={styles.verificationCheck}>
                    <FontAwesomeIcon icon="check" className={styles.icon} /> Signature Verified
                </div>
            );
        }
        return null;
    };

    const renderGroupInfo = <T extends unknown>(className: string, title: string, object: GroupInfoObject<T>, labelMap: Partial<GroupInfoObject<T>>, textFields: (keyof T)[], imageField?: keyof T): JSX.Element => {
        return (
            <div className={`${className} mb-5`}>
                <div className="d-flex align-items-center mb-4">
                    <h3>{title}</h3>
                    {renderVerification(object as unknown as SignableCertificateRecipient | CertificateIssuer)}
                </div>
                {imageField && object[imageField] && <img src={object[imageField] as string} className="img-fluid mb-4" />}
                {textFields.map((key, i) => renderFieldInfo(i, (labelMap[key] || key) as string, object[key] as string))}
            </div >
        );
    };

    return (
        <div className="row">
            {renderGroupInfo<CertificateIssuer>('col-sm-6', 'Certificate issuer', props.data.issuer, { govRegistration: 'Government Registration' }, ['name', 'govRegistration', 'email', 'url', 'address'], 'imageUrl')}
            {renderGroupInfo<SignableCertificateRecipient>('col-sm-6', 'Certificate recipient', props.data.recipient, { govId: 'Government ID' }, ['name', 'govId', 'email'])}
            {renderGroupInfo<SignableCertificateDetails>('col-sm-6', 'Certificate details', props.data.details, { issuedOn: 'Issued On' }, ['title', 'issuedOn', 'subtitle', 'description'], 'imageUrl')}
        </div>
    );
};