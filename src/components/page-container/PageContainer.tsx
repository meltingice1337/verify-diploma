import React, { PropsWithChildren } from 'react';

import { Header } from '@components/header/Header';

export const PageContainer = (props: PropsWithChildren<{}>): JSX.Element => {
    return (
        <>
            <Header />
            <div className="container-fluid">
                {props.children}
            </div>
        </>
    );
};