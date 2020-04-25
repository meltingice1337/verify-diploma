import React from 'react';

import logo from '../../../public/assets/logo.png';

const Authentication = (): JSX.Element => {
    return (
        <div className="full-page-wrapper">
            <div className="authentication-container p-5 d-flex flex-column">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Verify Diploma</h2>
                </div>
                <div className="col mt-5 d-flex flex-column justify-content-center">
                  <button className="btn btn-primary btn-block btn-lg">Login wallet</button>
                  <button className="btn btn-primary btn-block btn-lg mt-4">Create wallet</button>
                </div>
            </div>
        </div >
    );
};

export default Authentication;