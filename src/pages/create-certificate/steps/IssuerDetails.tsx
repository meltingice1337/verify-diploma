import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { validate } from 'validate.js';
import { toast } from 'react-toastify';

import { UrlRegex } from '@utils/Validation';

import { FormWithErrors } from '../CreateCertificate';
import { imageFileToBase64 } from '@utils/Image';

export interface IssuerDetailsFormData {
    name: string;
    address: string;
    email: string;
    govRegistration: string;
    url?: string;
    imageFile?: File;
    imageUrl?: string;
}

interface IssuerDetailsProps {
    form: FormWithErrors<IssuerDetailsFormData>;
    onFormChange: (issuerForm: FormWithErrors<IssuerDetailsFormData>) => void;
}

export const IssuerDetails = (props: IssuerDetailsProps): JSX.Element => {
    const [issuerImageFileData, setIssuerImageFileData] = useState<string>();

    const formRef = useRef<HTMLFormElement>(null);

    const onValidateChange = (form: IssuerDetailsFormData): void => {
        props.onFormChange({ value: form, valid: formRef.current!.checkValidity() });
    };

    useEffect(() => {
        onValidateChange(props.form.value);
    }, []);

    const onChange = async (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> => {
        event.persist();

        let formClone = { ...props.form.value };
        const key = event.target.name as keyof IssuerDetailsFormData;
        if (key !== 'imageFile') {
            formClone = { ...props.form.value, [key]: event.target.value };
            if (key === 'imageUrl') {
                formClone.imageFile = undefined;
                setIssuerImageFileData(undefined);
            }
        } else {
            const file = await imageFileToBase64((event.target as HTMLInputElement)?.files?.[0]);
            setIssuerImageFileData(file);
            if (!file) {
                setIssuerImageFileData(undefined);
                return;
            }
            formClone = { ...props.form.value, imageFile: (event.target as HTMLInputElement)?.files?.[0], imageUrl: '' };
        }

        onValidateChange(formClone);
    };

    return (
        <form ref={formRef} className={props.form.checked ? 'was-validated' : ''}>
            <h4 className="mb-4">Issuer details</h4>
            <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">Name*</label>
                <div className="col-sm-10">
                    <input required name="name" type="text" value={props.form.value.name} className="form-control" id="name" placeholder="Enter name ..." onChange={onChange} />
                    <div className="invalid-feedback">Enter the name of the issuing entity</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="govRegistration" className="col-sm-2 col-form-label">Government Registration*</label>
                <div className="col-sm-10">
                    <input required name="govRegistration" type="text" value={props.form.value.govRegistration} className="form-control" id="govRegistration" aria-describedby="govRegistrationHelp" placeholder=" Enter gov id ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required</div>
                    <small id="govRegistrationHelp" className="form-text text-muted">This field should contain info to find the entity on the official gov link. For e.g the registration number from the registry of commerce</small>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="email" className="col-sm-2 col-form-label">Email*</label>
                <div className="col-sm-10">
                    <input required type="email" name="email" value={props.form.value.email} className="form-control" id="email" placeholder="Enter email ..." onChange={onChange} />
                    <div className="invalid-feedback">This field is required and it needs to be a correct email address</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="url" className="col-sm-2 col-form-label">Url</label>
                <div className="col-sm-10">
                    <input pattern={UrlRegex.source} type="text" name="url" value={props.form.value.url} className="form-control" id="url" placeholder="Enter url ..." onChange={onChange} />
                    <div className="invalid-feedback">The url must start with http(s)://</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="address" className="col-sm-2 col-form-label">Address*</label>
                <div className="col-sm-10">
                    <textarea required name="address" value={props.form.value.address} className="form-control" id="address" placeholder="Enter address ..." onChange={onChange} />
                    <div className="invalid-feedback">Enter the address of the issuing entity</div>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Image</label>
                <div className="col-sm-10">
                    <div className="custom-file">
                        <input type="file" name="imageFile" className="custom-file-input" id="certificateImageFile" aria-describedby="certificateImageFileHelp" onChange={onChange} />
                        <label className="custom-file-label" htmlFor="certificateImageInput">{props.form.value.imageFile ? props.form.value.imageFile.name : 'Load a certificate image'}</label>
                    </div>
                    <small id="certificateImageFileHelp" className="form-text text-muted">The image will be base64 encoded in the certificate</small>
                    {issuerImageFileData && <img src={issuerImageFileData} className="mb-4" style={{ height: 'auto', width: 'auto', maxWidth: '30rem', maxHeight: '30rem', }} />}
                    <p className="mt-3 mb-3">or</p>
                    <input pattern={UrlRegex.source} name="imageUrl" value={props.form.value.imageUrl} onChange={onChange} type="text" className="form-control" aria-describedby="certificateImageUrlHelp" id=" recipientName" placeholder="http(s)://domain.com/image.png" />
                    <div className="invalid-feedback">The url must start with http(s)://</div>
                </div>
            </div>
        </form>
    );
};