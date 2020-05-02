import React from 'react';
import logo from '../../../public/assets/logo.png';

export const Header = (): JSX.Element => {
    return (
        <nav className="navbar navbar-light bg-light">
            <a className="navbar-brand">
                <img src={logo} className="mr-2" width="30" height="30" alt="" />
                Verify Diploma
            </a>
            <div className="navbar-nav ml-auto mr-auto flex-row">
                Your address:
        <strong className="ml-2">38ty1qB68gHsiyZ8k3RPeCJ1wYQPrUCPPr</strong>
            </div>
            <div className="navbar-nav"> Balance: 20.20 BCH</div>
        </nav>
    );
};