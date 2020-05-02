import React, { useState, ChangeEvent, useContext } from 'react';
import PinInput from 'react-pin-input';
import { toast } from 'react-toastify';
import { writeStorage } from '@rehooks/local-storage';

import BitboxContext from '@contexts/BitboxContext';
import WalletContext from '@contexts/WalletContext';

import logo from '../../../public/assets/logo.png';

import { AES } from '@utils/Crypto';

const OpenWallet = (): JSX.Element => {
    const [active, setActive] = useState(0);
    const [form, setForm] = useState({ mnemonic: '' });
    const [pin, setPin] = useState<string>();

    const { bitbox } = useContext(BitboxContext);
    const { setWallet } = useContext(WalletContext);

    const onEnterMnemonicClick = (): void => {
        if (form.mnemonic.split(' ').length !== 12) {
            toast.error('The mnemonic should be 12 words long');
            return;
        }

        const validation = bitbox.Mnemonic.validate(form.mnemonic);
        if (validation !== 'Valid mnemonic') {
            toast.error(validation);
        } else {
            setActive(1);
        }
    };

    const onFinishCreating = (): void => {
        const { mnemonic } = form;
        if (pin?.length === 4) {
            const encWallet = AES.encrypt(mnemonic, pin);
            writeStorage('wallet', encWallet);
            setWallet(mnemonic);
        }
    };

    const renderEnterMnemonic = (): JSX.Element => {
        return (
            <>
                <div className="form-group">
                    <label htmlFor="mnemonic">Mnemonic (12 words)</label>
                    <textarea
                        className="form-control"
                        id="mnemonic"
                        required
                        placeholder="Enter your mnemonic ..."
                        value={form.mnemonic}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => setForm({ mnemonic: event.target.value })}
                    />
                </div>
                <p className="mt-2">This is the 12 words string generated that represents your wallet.</p>
                <p className="mb-4">DO NOT SHARE THIS WITH ANYONE AND KEEP IT SAFE !</p>
                <button type="submit" className="btn btn-primary btn-lg" onClick={onEnterMnemonicClick}>Continue</button>
            </>
        );
    };

    const renderPinSetup = (): JSX.Element => {
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
                <p className="mt-4">Enter a pin code for protecting your browser saved wallet. Beware that the wallet will be encrypted so this pin does not have a recovery feature.</p>
                <button className="btn btn-primary btn-lg mt-3" onClick={onFinishCreating}>Continue</button>
            </>
        );
    };
    const renderStep = (): JSX.Element | null => {
        if (active === 0) {
            return renderEnterMnemonic();
        } else if (active === 1) {
            return renderPinSetup();
        }
        return null;
    };

    return (
        <div className="full-page-wrapper">
            <div className="authentication-container p-5">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Create Wallet</h2>
                </div>
                <div className="mt-5 d-flex flex-column ">
                    {renderStep()}
                </div>
            </div>
        </div >
    );
};

export default OpenWallet;