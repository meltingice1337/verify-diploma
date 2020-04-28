import React from 'react';

import logo from '../../../public/assets/logo.png';

const OpenWallet = (): JSX.Element => {
    return (
        <div className="full-page-wrapper">
            <div className="authentication-container p-5">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Create Wallet</h2>
                </div>
                <div className="mt-5 d-flex flex-column ">
                    
                </div>
            </div>
        </div >
    );
};

export default OpenWallet;