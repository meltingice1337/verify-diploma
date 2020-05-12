import React, { useState, MouseEvent, FormEvent, ChangeEvent, useContext } from 'react';
import PinInput from 'react-pin-input';
import { writeStorage } from '@rehooks/local-storage';
import { toast } from 'react-toastify';

import logo from '../../../public/assets/logo.png';

import BitboxContext from '@contexts/BitboxContext';
import WalletContext from '@contexts/WalletContext';

import { generateRandomBetween } from '@utils/Random';
import { AES } from '@utils/Crypto';

import styles from './CreateWallet.module.scss';

const CreateWallet = (): JSX.Element => {

    const { bitbox } = useContext(BitboxContext);
    const { setWallet } = useContext(WalletContext);

    const [activeStep, setActiveStep] = useState(0);
    const [mnemonic] = useState(bitbox.Mnemonic.generate());
    const [worldNumberVerify] = useState({ first: generateRandomBetween(6, 1), second: generateRandomBetween(12, 6) });
    const [verifyForm, setVerifyForm] = useState({ first: '', second: '' });
    const [pin, setPin] = useState<string>();

    const onCopyPassphraseClick = (event: MouseEvent): void => {
        event.preventDefault();

        const input = document.createElement('input');
        input.type = 'text';
        input.value = mnemonic;
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand('copy');

        input.hidden = true;
    };

    const renderPassphrase = (): JSX.Element => {
        return (
            <>
                <h4 className="mb-2">Passphrase</h4>
                <div className={styles.passphraseContainer}>
                    <p>{mnemonic}</p>
                    <a href="#" className="card-link mt-3" onClick={onCopyPassphraseClick}>Copy to clipboard</a>
                </div>
                <p className="my-3" >Write this down on a piece of paper or save it in the cloud as if this contains your account information and if you loose this you will not be able to recover your wallet</p>
                <button className="btn btn-primary btn-lg" onClick={(): void => setActiveStep(activeStep + 1)}>I HAVE WRITTEN THIS DOWN. Continue</button>
            </>
        );
    };

    const renderGenerating = (): JSX.Element => {
        return (
            <>
                <h4 className="mb-4">You will be generated a new wallet with your own passphrase</h4>
                <p className="mb-5">Keep in mind that for your security, this data will only be saved on the browser so if you don&apos;t save it where will be no possibility for recovering it !</p>
                <button className="btn btn-primary btn-lg" onClick={(): void => setActiveStep(1)}>Generate wallet</button>
            </>
        );
    };

    const onFinishCreating = (): void => {
        if (pin?.length === 4) {
            const encWallet = AES.encrypt(mnemonic, pin);
            writeStorage('wallet', encWallet);
            setWallet(mnemonic);
        }
    };

    const renderVerify = (): JSX.Element => {

        const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
            setVerifyForm({ ...verifyForm, [event.target.name]: event.target.value.trim() });
        };

        const onSubmitVerify = (event: FormEvent<HTMLFormElement>): void => {
            event.preventDefault();

            const mnemonicArray = mnemonic.split(' ');
            if (mnemonicArray[worldNumberVerify.first - 1] === verifyForm.first && mnemonicArray[worldNumberVerify.second - 1] === verifyForm.second) {
                setActiveStep(activeStep + 1);
            } else {
                toast.error('the words don`t match, please check again !');
            }
        };

        return (
            <form onSubmit={onSubmitVerify}>
                <div className="form-group">
                    <label htmlFor="firstWord">Word {worldNumberVerify.first}</label>
                    <input required name="first" className="form-control" id="firstWord" onChange={onInputChange} value={verifyForm.first} placeholder={`Enter word #${worldNumberVerify.first}`} />
                </div>
                <div className="form-group">
                    <label htmlFor="secondWord">Word {worldNumberVerify.second}</label>
                    <input required name="second" className="form-control" id="secondWord" onChange={onInputChange} value={verifyForm.second} placeholder={`Enter word #${worldNumberVerify.second}`} />
                </div>

                <button className="btn btn-primary btn-lg btn-block" type="submit">Continue</button>
            </form>
        );
    };

    const renderPinSetup = (): JSX.Element | null => {
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
        if (activeStep === 0) {
            return renderGenerating();
        } else if (activeStep === 1) {
            return renderPassphrase();
        } else if (activeStep === 2) {
            return renderVerify();
        } else if (activeStep === 3) {
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

export default CreateWallet;