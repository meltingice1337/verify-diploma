import React, { PropsWithChildren, useContext } from 'react';

import { Header } from '@components/header/Header';
import WalletContext from '@contexts/WalletContext';

export const PageContainer = (props: PropsWithChildren<{}>): JSX.Element | null => {
    const { wallet } = useContext(WalletContext);

    if (wallet) {
        return (
            <>
                <Header />
                <div className="container-wrapper bg-light">
                    <div className="container">
                        {props.children}
                    </div>
                </div>
            </>
        );
    }
    return null;
};