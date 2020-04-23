import React from 'react';


import logo from '../../../public/assets/logo.png';

const Authentication = (): JSX.Element => {
    return (
        <div className="full-page-wrapper">
            <div className="authentication-container">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Login</h2>
                </div>
            </div>
        </div>
    );
};

export default Authentication;