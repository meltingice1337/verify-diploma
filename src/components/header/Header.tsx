import React, { useContext } from 'react';

import WalletContext from '@contexts/WalletContext';

import logo from '../../../public/assets/logo.png';

export const Header = (): JSX.Element => {
    const { wallet } = useContext(WalletContext);

    return (
        <nav className="navbar navbar-light bg-light">
            <a className="navbar-brand">
                <img src={logo} className="mr-2" width="30" height="30" alt="" />
                Verify Diploma
            </a>
            <div className="navbar-nav ml-auto mr-auto flex-row">
                Your address:
                <strong className="ml-2">{wallet!.account.getAddress()}</strong>
            </div>
            <div className="navbar-nav flex-row">Balance: <strong className="ml-2">{wallet!.addressDetails.balance.toFixed(8)} BCH</strong></div>
        </nav>
    );
};