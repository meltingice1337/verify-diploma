import React, { useState, useRef, MouseEvent } from 'react';

import { BITBOX } from 'bitbox-sdk';

import logo from '../../../public/assets/logo.png';

import styles from './CreateWallet.module.scss';

const bitbox = new BITBOX();

const CreateWallet = (): JSX.Element => {
    const [activeStep, setActiveStep] = useState(2);
    const [mnemonic, setMnemonic] = useState(bitbox.Mnemonic.generate());

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

    const renderVerify = (): JSX.Element => {
        const [worldNumberVerify] = useState({ first: (Math.random() * 11) % 11 + 1, second: (Math.random() * 11) % 11 + 1 });

        return (
            <>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Word {worldNumberVerify.first}</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Word {worldNumberVerify.second}</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                </div>     </>
        );
    };

    const renderStep = (): JSX.Element | null => {
        if (activeStep === 0) {
            return renderGenerating();
        } else if (activeStep === 1) {
            return renderPassphrase();
        } else if (activeStep === 2) {
            return renderVerify();
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