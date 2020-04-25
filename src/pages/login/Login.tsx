import React from 'react';

import logo from '../../../public/assets/logo.png';

const Login = (): JSX.Element => {
    return (
        <div className="full-page-wrapper">
            <div className="authentication-container p-5">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Login</h2>
                </div>
                <form className="mt-5 d-flex flex-column ">
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </div >
    );
};

export default Login;