import React, { useContext, useEffect } from 'react';

import DashboardContext from '@contexts/DashboardContext';

import { PageContainer } from '@components/page-container/PageContainer';
import { DashboardRecipient } from './contexts/DashboardRecipient';
import { DashboardIssuer } from './contexts/DashboardIssuer';

import { useRouter } from '@hooks/RouterHook';
import WalletContext from '@contexts/WalletContext';

const Dashboard = (): JSX.Element => {
    const { context } = useContext(DashboardContext);
    const { wallet } = useContext(WalletContext);

    const router = useRouter();

    useEffect(() => {
        if (!wallet) {
            router.push('/');
        }
    }, []);

    const renderDashboardCtx = (): JSX.Element | null => {
        if (context === 'recipient') {
            return <DashboardRecipient />;
        } else if (context === 'issuer') {
            return <DashboardIssuer />;
        }
        return null;
    };

    return (
        <PageContainer>
            {renderDashboardCtx()}
        </PageContainer>

    );
};

export default Dashboard;