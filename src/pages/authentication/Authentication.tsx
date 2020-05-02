import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import useLocalStorage from '@rehooks/local-storage';
import PinInput from 'react-pin-input';

import WalletContext from '@contexts/WalletContext';

import logo from '../../../public/assets/logo.png';

import { AES } from '@utils/Crypto';

const Authentication = (): JSX.Element => {
    const [active, setActive] = useState(0);
    const [pin, setPin] = useState<string>();
    const [mnemonic] = useLocalStorage('wallet');

    const { setWallet } = useContext(WalletContext);

    useEffect(() => {
        if (mnemonic) {
            setActive(1);
        }
    }, [mnemonic]);

    const onEnterClick = (): void => {
        if (pin?.length === 4) {
            const decrypted = AES.decrypt(mnemonic!, pin);

            if (decrypted) {
                setWallet(decrypted);
                console.log({ decrypted });
            } else {
                toast.error('Invalid pin ! Please try again ...');
            }
        }
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
            return renderMenu();
        } else if (active === 1) {
            return renderWalletEnter();
        }

        return null;
    };

    return (
        <div className="full-page-wrapper">
            <div className="authentication-container p-5 d-flex flex-column">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Verify Diploma</h2>
                </div>
                <div className="col mt-5 d-flex flex-column justify-content-center">
                    {renderActive()}
                </div>
            </div>
        </div >
    );
};

export default Authentication;