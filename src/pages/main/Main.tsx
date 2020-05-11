import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import useLocalStorage from '@rehooks/local-storage';
import PinInput from 'react-pin-input';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import WalletContext from '@contexts/WalletContext';
import { Verifier } from '@pages/main/subpages/Verifier';

import logo from '../../../public/assets/logo.png';

import { AES } from '@utils/Crypto';

import { useRouter } from '@hooks/RouterHook';

const Main = (): JSX.Element | null => {
    const [active, setActive] = useState(0);
    const [pin, setPin] = useState<string>();
    const [mnemonic] = useLocalStorage('wallet');

    const { setWallet } = useContext(WalletContext);

    const router = useRouter();

    useEffect(() => {
        if (mnemonic && active > 0) {
            setActive(2);
        }
    }, [mnemonic, active]);

    const onEnterClick = (): void => {
        if (pin?.length === 4) {
            const decrypted = AES.decrypt(mnemonic!, pin);

            if (decrypted) {
                setWallet(decrypted);
                router.push('/dashboard');
            } else {
                toast.error('Invalid pin ! Please try again ...');
            }
        }
    };

    const renderAuthSteps = (step: JSX.Element): JSX.Element => {
        return (
            <div className="full-page-wrapper">
                <div className="authentication-container p-5 d-flex flex-column">
                    <div className="d-flex align-items-center">
                        <img className="logo" src={logo} alt="logo" />
                        <h2 className="ml-4">Verify Diploma</h2>
                    </div>
                    <div className="col mt-5 d-flex flex-column justify-content-center">
                        {step}
                    </div>
                </div>
            </div >
        );
    };

    const renderMenu = (): JSX.Element => {
        return (
            <>
                <NavLink to="/wallet/open" className="btn btn-primary btn-block btn-lg">Open wallet</NavLink>
                <NavLink to="/wallet/create" className="btn btn-primary btn-block btn-lg mt-4">Create wallet</NavLink>
            </>
        );
    };

    const renderWalletEnter = (): JSX.Element => {
        return (
            <>
                <h3 className="text-center mb-4">Pin code</h3>
                <div className="d-flex justify-content-center">
                    <PinInput
                        length={4}
                        focus
                        onChange={(pin): void => setPin(pin)}
                        inputStyle={{ borderRadius: '0.4rem', fontSize: '1.6rem' }}
                    />
                </div>
                <p className="mt-4">It looks like you can login to your wallet. Use your pin number in order to login !</p>
                <button className="btn btn-primary mt-3 btn-lg" onClick={onEnterClick}>Enter</button>
            </>
        );
    };

    const renderActive = (): JSX.Element | null => {
        if (active === 0) {
            return (
                <DndProvider backend={HTML5Backend}>
                    <Verifier onGoToDashboardClick={(): void => setActive(1)} />
                </DndProvider>
            );
        } else if (active === 1) {
            return renderAuthSteps(renderMenu());
        } else if (active === 2) {
            return renderAuthSteps(renderWalletEnter());
        }

        return null;
    };

    return renderActive();
};

export default Main;