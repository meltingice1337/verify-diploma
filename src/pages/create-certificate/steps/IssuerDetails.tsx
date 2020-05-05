import React, { useEffect, useState, ChangeEvent } from 'react';
import { validate } from 'validate.js';
import { toast } from 'react-toastify';

import { UrlRegex } from '@utils/Validation';

interface IssuerFormData {
    name: string;
    address: string;
    email: string;
    govRegistration: string;
    url?: string;
}

export const IssuerDetails = (): JSX.Element => {
    const [form, setForm] = useState<IssuerFormData>({
        name: '',
        address: '',
        email: '',
        govRegistration: '',
        url: ''
    });

    const [issuerImageFile, setIssuerImageFile] = useState<File>();
    const [issuerImageUrl, setIssuerImageUrl] = useState<string>('');
    const [issuerImageFileData, setIssuerImageFileData] = useState<string>();

    const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const onImageFileUploadChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files?.length > 0) {
            const imageFile = event.target.files[0];
            if (!(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(imageFile.name)) {
                toast.error('The selected file is not an image.');
                return;
            }

            setIssuerImageFile(imageFile);
            setIssuerImageUrl('');

            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = (): void => setIssuerImageFileData(reader.result as string);
        }
    };

    const onImageUrlChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setIssuerImageFile(undefined);
        setIssuerImageFileData(undefined);
        setIssuerImageUrl(event.target.value);
    };


    useEffect(() => {
        const errors = validate(form, {
            name: { length: { minimum: 1 }, presence: true },
            address: { length: { minimum: 1 } }, presence: true,
            email: { length: { minimum: 1 }, email: true, presence: true },
            govRegistration: { length: { minimum: 1 } },
            url: { format: { pattern: UrlRegex } }
        });
        console.log(errors);
    }, [form]);

    return (
        <form>
            <h4 className="mb-4">Issuer details</h4>
            <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">Title*</label>
                <div className="col-sm-10">
                    <input name="name" type="text" value={form.name} className="form-control" id="name" placeholder="Enter name ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
                <div className="col-sm-10">
                    <input type="email" name="email" value={form.email} required className="form-control" id="email" placeholder="Enter address ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="url" className="col-sm-2 col-form-label">Url</label>
                <div className="col-sm-10">
                    <input type="text" name="url" value={form.url} required className="form-control" id="url" placeholder="Enter address ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="address" className="col-sm-2 col-form-label">Address*</label>
                <div className="col-sm-10">
                    <textarea name="address" value={form.address} required className="form-control" id="address" placeholder="Enter address ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Image</label>
                <div className="col-sm-10">
                    <div className="custom-file">
                        <input type="file" name="certificateImageUpload" className="custom-file-input" id="certificateImageFile" aria-describedby="certificateImageFileHelp" onChange={onImageFileUploadChange} />
                        <label className="custom-file-label" htmlFor="certificateImageInput">{issuerImageFile ? issuerImageFile.name : 'Load a certificate image'}</label>
                    </div>
                    <small id="certificateImageFileHelp" className="form-text text-muted">The image will be base64 encoded in the certificate</small>
                    {issuerImageFileData && <img src={issuerImageFileData} className="mb-4" style={{ height: 'auto', width: 'auto', maxWidth: '30rem', maxHeight: '30rem', }} />}
                    <p className="mt-3 mb-3">or</p>
                    <input name="certificateImageUrl" value={issuerImageUrl} onChange={onImageUrlChange} type="text" className="form-control" aria-describedby="certificateImageUrlHelp" id=" recipientName" placeholder="http(s)://domain.com/image.png" />
                    <small id="certificateImageUrlHelp" className="form-text text-muted">The url must start with http(s)://</small>
                </div>
            </div>
        </form>
    );
};