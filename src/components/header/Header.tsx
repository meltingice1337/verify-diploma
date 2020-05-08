import React, { useContext, MouseEvent } from 'react';
import useLocalStorage from '@rehooks/local-storage';
import { useHistory } from 'react-router-dom';

import WalletContext from '@contexts/WalletContext';
import DashboardContext, { DashboardContextType } from '@contexts/DashboardContext';

import logo from '../../../public/assets/logo.png';

import styles from './Header.module.scss';

export const Header = (): JSX.Element => {
    const { wallet } = useContext(WalletContext);
    const { context, setContext } = useContext(DashboardContext);
    const [, setDashboardContextStorage] = useLocalStorage<DashboardContextType>('dashboard-ctx');

    const history = useHistory();

    const onContextChange = (ctx: DashboardContextType, event: MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();
        setContext(ctx);
        setDashboardContextStorage(ctx);
        history.push('/dashboard');
    };

    return (
        <nav className="navbar navbar-light bg-white">
            <a className="navbar-brand">
                <img src={logo} className="mr-2" width="30" height="30" alt="" />
                Verify Diploma
            </a>
            <div className={`navbar-nav flex-row ml-4 ${styles.dashboardContextContainer}`}>
                <a href="#" className={`${context === 'issuer' ? styles.active : ''}`} onClick={onContextChange.bind(null, 'issuer')}>Issuer</a>
                <a href="#" className={`ml-3 ${context === 'recipient' ? styles.active : ''}`} onClick={onContextChange.bind(null, 'recipient')}> Recipient</a>
            </div>
            <div className="navbar-nav ml-auto mr-auto flex-row">
                Your address:
                <strong className="ml-2">{wallet!.account.getAddress()}</strong>
            </div>
            <div className="navbar-nav flex-row">Balance: <strong className="ml-2">{wallet!.addressDetails.balance.toFixed(8)} BCH</strong></div>
        </nav>
    );
};