import React, { useState, useEffect, useRef, ChangeEvent, useContext } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import BitboxContext from '@contexts/BitboxContext';

import CreateCertificate from '@pages/create-certificate/CreateCertificate';

import { useRouter } from '@hooks/RouterHook';

import { readCertificate, toSignableCertificate, verifyCertificate } from '@utils/certificate/Certificate';
import WalletContext from '@contexts/WalletContext';

export const DashboardIssuer = (): JSX.Element => {
    const [defaultRoute, setDefaultRoute] = useState(true);

    const fileRef = useRef<HTMLInputElement>(null);

    const { bitbox } = useContext(BitboxContext);
    const { wallet } = useContext(WalletContext);

    const router = useRouter();

    useEffect(() => {
        setDefaultRoute(location.pathname === '/dashboard');
    }, [router.location]);

    const onAddCertificate = (): void => {
        fileRef.current!.click();
    };

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            const certificate = await readCertificate(file);
            if (certificate) {
                const signableCertificate = toSignableCertificate(certificate);
                const verified = verifyCertificate({ publicKey: wallet!.account.getPublicKeyBuffer().toString('hex'), signature: certificate.issuer.verification!.signature }, signableCertificate, bitbox);

                if (!verified) {
                    toast.error('The recipient has changed the certificate. Beware !');
                    return;
                }

                router.push('/dashboard/create-certificate', { certificate });
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