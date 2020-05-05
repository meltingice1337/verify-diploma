import React, { useState, ChangeEvent } from 'react';
import { toast } from 'react-toastify';

interface CertificateFormData {
    certificateTitle: string;
    certificateSubtitle: string;
    certificateDescription: string;
    recipientName: string;
    recipientEmail: string;
}

export const CertificateDetails = (): JSX.Element => {
    const [form, setForm] = useState<CertificateFormData>({
        certificateTitle: '',
        certificateDescription: '',
        certificateSubtitle: '',
        recipientEmail: '',
        recipientName: ''
    });

    const [certImageFile, setCertImageFile] = useState<File>();
    const [certImageUrl, setCertImageUrl] = useState<string>('');
    const [certImageFileData, setCertImageFileData] = useState<string>();

    const onImageFileUploadChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files?.length > 0) {
            const imageFile = event.target.files[0];
            if (!(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(imageFile.name)) {
                toast.error('The selected file is not an image.');
                return;
            }

            setCertImageFile(imageFile);
            setCertImageUrl('');

            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = (): void => setCertImageFileData(reader.result as string);
        }
    };

    const onImageUrlChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setCertImageFile(undefined);
        setCertImageFileData(undefined);
        setCertImageUrl(event.target.value);
    };

    const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    return (
        <form >
            <h4 className="mb-4">Certificate details</h4>
            <div className="form-group row">
                <label htmlFor="certificate" className="col-sm-2 col-form-label">Title*</label>
                <div className="col-sm-10">
                    <input name="certificateTitle" value={form.certificateTitle} required type="text" className="form-control" id="name" placeholder="Enter title ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="subtitle" className="col-sm-2 col-form-label">Subtitle</label>
                <div className="col-sm-10">
                    <input name="certificateSubtitle" value={form.certificateSubtitle} type="text" className="form-control" id="subtitle" placeholder="Subtitle..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                <div className="col-sm-10">
                    <textarea name="certificateDescription" value={form.certificateDescription} className="form-control" id="description" placeholder="Enter a the certificate's description" onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-sm-2 col-form-label">Image</label>
                <div className="col-sm-10">
                    <div className="custom-file">
                        <input type="file" name="certificateImageUpload" className="custom-file-input" id="certificateImageFile" aria-describedby="certificateImageFileHelp" onChange={onImageFileUploadChange} />
                        <label className="custom-file-label" htmlFor="certificateImageInput">{certImageFile ? certImageFile.name : 'Load a certificate image'}</label>
                    </div>
                    <small id="certificateImageFileHelp" className="form-text text-muted">The image will be base64 encoded in the certificate</small>
                    {certImageFileData && <img src={certImageFileData} className="mb-4" style={{ height: 'auto', width: 'auto', maxWidth: '30rem', maxHeight: '30rem', }} />}
                    <p className="mt-3 mb-3">or</p>
                    <input name="certificateImageUrl" value={certImageUrl} onChange={onImageUrlChange} type="text" className="form-control" aria-describedby="certificateImageUrlHelp" id=" recipientName" placeholder="http(s)://domain.com/image.png" />
                    <small id="certificateImageUrlHelp" className="form-text text-muted">The url must start with http(s)://</small>
                </div>
            </div>
            <h4 className="mb-4">Certificate recipient</h4>
            <div className="form-group row">
                <label htmlFor="recipientName" className="col-sm-2 col-form-label">Name*</label>
                <div className="col-sm-10">
                    <input name="recipientName" value={form.recipientName} required type="text" className="form-control" id="recipientName" placeholder="Enter recipient's name ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="recipientEmail" className="col-sm-2 col-form-label">Email*</label>
                <div className="col-sm-10">
                    <input name="recipientEmail" value={form.recipientEmail} required type="email" className="form-control" id="recipientEmail" placeholder="Enter email ..." onChange={onChange} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="recipientGovId" className="col-sm-2 col-form-label">Government ID</label>
                <div className="col-sm-10">
                    <input name="recipientGovId" type="text" className="form-control" id="recipientGovId" aria-describedby="recipientGovIdHelp" placeholder="Enter the recipient's government identification ..." onChange={onChange} />
                    <small id="recipientGovIdHelp" className="form-text text-muted">This information can range from the social security number to ID`s serial</small>
                </div>
            </div>
        </form>
    );
};