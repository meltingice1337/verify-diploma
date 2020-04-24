import React from 'react';


import logo from '../../../public/assets/logo.png';

const Authentication = (): JSX.Element => {
    return (
        <div className="full-page-wrapper">
            <div className="authentication-container px-6">
                <div className="d-flex align-items-center">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="ml-4">Login</h2>
                </div>

                <form>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
                    </div>
                    <div className="form-group form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Authentication;