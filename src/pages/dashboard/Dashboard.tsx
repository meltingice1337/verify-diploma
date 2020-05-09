import React, { useContext } from 'react';

import { PageContainer } from '@components/page-container/PageContainer';
import DashboardContext from '@contexts/DashboardContext';
import { DashboardRecipient } from './contexts/DashboardRecipient';
import { DashboardIssuer } from './contexts/DashboardIssuer';

const Dashboard = (): JSX.Element => {
    const { context } = useContext(DashboardContext);

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