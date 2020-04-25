import React, { useState } from 'react';

import logo from '../../../public/assets/logo.png';

import styles from './CreateWallet.module.scss';

const CreateWallet = (): JSX.Element => {
    const [activeStep, setActiveStep] = useState(1);

    const renderPassphrase = (): JSX.Element => {
        return (
            <>
                <h4 className="mb-2">Passphrase</h4>
                <div className={styles.passphraseContainer}>
                    <p>Some quick example text to build on the card title and make up the bulk of the cad content.</p>
                </div>
                <a href="#" className="card-link mt-1">Copy to clipboard</a>
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

    const renderStep = (): JSX.Element | null => {
        if (activeStep === 0) {
            return renderGenerating();
        } else if (activeStep === 1) {
            return renderPassphrase();
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