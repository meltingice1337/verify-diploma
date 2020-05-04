import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { PageContainer } from '@components/page-container/PageContainer';

interface CertificateFormData {
    certificateTitle: string;
    certificateSubtitle: string;
    certificateDescription: string;
    recipientName: string;
    recipientEmail: string;
    certificateImage: FileList | null;
}

const CreateCertificate = (): JSX.Element => {
    const { register, handleSubmit, errors, watch, setValue } = useForm<CertificateFormData>();
    const [certImageData, setCertImageData] = useState<string>();

    const certImage = watch('certificateImage');

    const onSubmit = handleSubmit((data): void => {
        console.log({ errors });
        console.log({ data });
    });

    useEffect(() => {
        if (certImage && certImage?.length > 0) {
            if (!(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(certImage[0].name)) {
                setValue('certificateImage', null);
                toast.error('The selected file is not an image.');
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(certImage[0]);
            reader.onload = (): void => setCertImageData(reader.result as string);
        }
    }, [certImage]);

    return (
        <PageContainer>
            <h2 className="mb-3">Create a new certificate</h2>
            <div className="page-content">
                <form onSubmit={onSubmit}>
                    <h4 className="mb-4">Certificate details</h4>
                    <div className="form-group row">
                        <label htmlFor="certificate" className="col-sm-2 col-form-label">Title*</label>
                        <div className="col-sm-10">
                            <input name="certificateTitle" required ref={register} type="text" className="form-control" id="name" placeholder="Enter title ..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="subtitle" className="col-sm-2 col-form-label">Subtitle</label>
                        <div className="col-sm-10">
                            <input name="certificateSubtitle" ref={register} type="text" className="form-control" id="subtitle" placeholder="Subtitle..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                        <div className="col-sm-10">
                            <textarea name="certificateDescription" ref={register} className="form-control" id="description" placeholder="Enter a the certificate's description" />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="description" className="col-sm-2 col-form-label">Image</label>
                        <div className="col-sm-10">
                            <div className="custom-file">
                                <input ref={register} type="file" name="certificateImage" className="custom-file-input" id="certificateImageInput" aria-describedby="certificateImageInputHelp" />
                                <label className="custom-file-label" htmlFor="certificateImageInput">{certImage && certImage?.length > 0 ? `${certImage?.[0]?.name} loaded` : 'Load a certificate image'}</label>
                            </div>
                            <small id="emailHelp" className="form-text text-muted">The image will be base64 encoded in the certificate</small>
                            {certImageData && <img src={certImageData} className="mb-4" style={{ height: 'auto', width: 'auto', maxWidth: '30rem', maxHeight: '30rem', }} />}
                        </div>
                    </div>
                    <h4 className="mb-4">Certificate recipient</h4>
                    <div className="form-group row">
                        <label htmlFor="recipientName" className="col-sm-2 col-form-label">Name*</label>
                        <div className="col-sm-10">
                            <input name="recipientName" required ref={register} type="text" className="form-control" id="recipientName" placeholder="Enter recipient's name ..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="recipientEmail" className="col-sm-2 col-form-label">Email*</label>
                        <div className="col-sm-10">
                            <input name="recipientEmail" required ref={register} type="email" className="form-control" id="recipientEmail" placeholder="Enter email ..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="recipientGovId" className="col-sm-2 col-form-label">Government ID</label>
                        <div className="col-sm-10">
                            <input name="recipientGovId" ref={register} type="text" className="form-control" id="recipientGovId" aria-describedby="recipientGovIdHelp" placeholder="Enter the recipient's government identification ..." />
                            <small id="recipientGovIdHelp" className="form-text text-muted">This information can range from the social security number to ID`s serial</small>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg mt-auto ml-auto">Continue</button>
                </form>
            </div>
        </PageContainer>
    );
};

export default CreateCertificate;