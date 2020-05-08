import React, { useContext, useEffect } from 'react';

import { PageContainer } from '@components/page-container/PageContainer';
import DashboardContext from '@contexts/DashboardContext';

const Dashboard = (): JSX.Element => {
    const { context } = useContext(DashboardContext);

    useEffect(() => {
        console.log('test');
    }, [context]);

    return (
        <PageContainer>
            Generate new certificate
        </PageContainer>

    );
};

export default Dashboard;