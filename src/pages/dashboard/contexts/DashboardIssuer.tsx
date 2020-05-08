import React, { useState, useEffect, useRef, ChangeEvent, useContext } from 'react';
import { Switch, Route, Link, useLocation } from 'react-router-dom';

import CreateCertificate from '@pages/create-certificate/CreateCertificate';

import BitboxContext from '@contexts/BitboxContext';

import { readCertificate, toSignableCertificate, verifyCertificate, signCertificate } from '@utils/certificate/Certificate';
import WalletContext from '@contexts/WalletContext';

export const DashboardIssuer = (): JSX.Element => {
    const [defaultRoute, setDefaultRoute] = useState(true);

    const fileRef = useRef<HTMLInputElement>(null);

    const { wallet } = useContext(WalletContext);
    const { bitbox } = useContext(BitboxContext);

    const location = useLocation();

    useEffect(() => {
        setDefaultRoute(location.pathname === '/dashboard');
    }, [location]);

    const onAddCertificate = (): void => {
        fileRef.current!.click();
    };

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            const certificate = await readCertificate(file);
            console.log(certificate);
            if (certificate) {
                const signableCertificate = toSignableCertificate(certificate);
                const verify = verifyCertificate(certificate.issuer.verification.signature, certificate.issuer.verification.publicKey, signableCertificate, bitbox);
                console.log('certificate sig', verify);
            }
        }
    };

    const renderDefault = (): JSX.Element | null => {
        if (!defaultRoute) {
            return null;
        }

        return (
            <div className="d-flex">
                <Link to="/dashboard/create-certificate" className="btn btn-primary mr-3">Add new</Link>
                <button className="btn btn-primary" onClick={onAddCertificate}>Upload certificate</button>
                <input ref={fileRef} type="file" className="form-control-file" name="" id="" style={{ display: 'none' }} onChange={onFileChange} />
            </div>
        );
    };

    return (
        <>
            {renderDefault()}
            <Switch>
                <Route component={CreateCertificate} path="/dashboard/create-certificate" />
            </Switch>
        </>

    );
};