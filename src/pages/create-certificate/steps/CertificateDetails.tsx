import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

import { UrlRegex } from '@utils/Validation';

import { FormWithErrors } from '../CreateCertificate';
import { imageFileToBase64 } from '@utils/Image';

export interface CertificateDetailsFormData {
    certificateTitle: string;
    certificateSubtitle?: string;
    certificateDescription?: string;
    certificateImageFile?: File;
    certificateImageUrl?: string;
    recipientName: string;
    recipientEmail: string;
    recipientGovId: string;
}

interface CertificateDetailsProps {
    form: FormWithErrors<CertificateDetailsFormData>;
    onFormChange: (issuerForm: FormWithErrors<CertificateDetailsFormData>) => void;
}

export const CertificateDetails = (props: CertificateDetailsProps): JSX.Element => {
    const [certImageFileData, setCertImageFileData] = useState<string>();

    const formRef = useRef<HTMLFormElement>(null);

    const onValidateChange = (form: CertificateDetailsFormData): void => {
        props.onFormChange({ value: form, valid: formRef.current!.checkValidity() });
    };

    useEffect(() => {
        onValidateChange(props.form.value);
    }, []);

    const onChange = async (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> => {
        event.persist();

        let formClone = { ...props.form.value };
        const key = event.target.name as keyof CertificateDetailsFormData;
        if (key !== 'certificateImageFile') {
            formClone = { ...props.form.value, [key]: event.target.value };
            if (key === 'certificateImageUrl') {
                formClone.certificateImageFile = undefined;
                setCertImageFileData(undefined);
            }
        } else {
            const file = await imageFileToBase64((event.target as HTMLInputElement)?.files?.[0]);
            setCertImageFileData(file);
            if (!file) {
                setCertImageFileData(undefined);
                return;
            }
            formClone = { ...props.form.value, certificateImageFile: (event.target as HTMLInputElement)?.files?.[0], certificateImageUrl: '' };
        }

        onValidateChange(formClone);
    };

    return (
        <form ref={formRef} className={props.form.checked ? 'was-validated' : ''}>
            <h4 className="mb-4">Certificate details</h4>
            <div className="form-group row">
                <label htmlFor="certificate" className="col-sm-2 col-form-label">Title*</label>
                <div className="col-sm-10">
                    <input name="certificateTitle" value={props.form.value.certificateTitle} required type="text" className="form-control" id="name" placeholder="Enter title ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="subtitle" className="col-sm-2 col-form-label">Subtitle</label>
                <div className="col-sm-10">
                    <input name="certificateSubtitle" value={props.form.value.certificateSubtitle} type="text" className="form-control" id="subtitle" placeholder="Subtitle..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                <div className="col-sm-10">
                    <textarea name="certificateDescription" value={props.form.value.certificateDescription} className="form-control" id="description" placeholder="Enter a the certificate's description" onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Image</label>
                <div className="col-sm-10">
                    <div className="custom-file">
                        <input type="file" name="certificateImageFile" className="custom-file-input" id="certificateImageFile" aria-describedby="certificateImageFileHelp" onChange={onChange} />
                        <label className="custom-file-label" htmlFor="certificateImageInput">{props.form.value.certificateImageFile ? props.form.value.certificateImageFile.name : 'Load a certificate image'}</label>
                    </div>
                    <small id="certificateImageFileHelp" className="form-text text-muted">The image will be base64 encoded in the certificate</small>
                    {certImageFileData && <img src={certImageFileData} className="mb-4" style={{ height: 'auto', width: 'auto', maxWidth: '30rem', maxHeight: '30rem', }} />}
                    <p className="mt-3 mb-3">or</p>
                    <input pattern={UrlRegex.source} name="certificateImageUrl" value={props.form.value.certificateImageUrl} onChange={onChange} type="text" className="form-control" aria-describedby="certificateImageUrlHelp" id=" recipientName" placeholder="http(s)://domain.com/image.png" />
                    <div className="invalid-feedback">The url must start with http(s)://</div>
                </div>
            </div>
            <h4 className="mb-4">Certificate recipient</h4>
            <div className="form-group row">
                <label htmlFor="recipientName" className="col-sm-2 col-form-label">Name*</label>
                <div className="col-sm-10">
                    <input name="recipientName" value={props.form.value.recipientName} required type="text" className="form-control" id="recipientName" placeholder="Enter recipient's name ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="recipientEmail" className="col-sm-2 col-form-label">Email*</label>
                <div className="col-sm-10">
                    <input name="recipientEmail" value={props.form.value.recipientEmail} required type="email" className="form-control" id="recipientEmail" placeholder="Enter email ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required and it needs to be a correct email address</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="recipientGovId" className="col-sm-2 col-form-label">Government ID</label>
                <div className="col-sm-10">
                    <input required name="recipientGovId" value={props.form.value.recipientGovId} type="text" className="form-control" id="recipientGovId" aria-describedby="recipientGovIdHelp" placeholder="Enter the recipient's government identification ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required</div>
                    <small id="recipientGovIdHelp" className="form-text text-muted">This information can range from the social security number to ID`s serial</small>
                </div>
            </div>
        </form>
    );
};