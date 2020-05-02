import React from 'react';

import logo from '../../../public/assets/logo.png';

const Dashboard = (): JSX.Element => {
    return (
        <>
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
        </>
        // <div className="full-page-wrapper">
        //     <div className="authentication-container p-5 d-flex flex-column">
        //         <div className="d-flex align-items-center">
        //             <h2 className="ml-4">Verify Diploma</h2>
        //         </div>
        //         <div className="col mt-5 d-flex flex-column justify-content-center">
        //         </div>
        //     </div>
        // </div >
    );
};

export default Dashboard;