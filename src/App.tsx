import React, { Suspense, useState } from 'react';
import { RouteComponentProps, Route, RouteProps, Switch } from 'react-router-dom';
import { BITBOX, TREST_URL } from 'bitbox-sdk';

import { routes } from './routes';

import { BitboxProvider } from '@contexts/BitboxContext';
import { WalletProvider, WalletData } from '@contexts/WalletContext';

const App = (): JSX.Element => {
    const [walletData, setWalletData] = useState<WalletData>();
    const [bitbox] = useState(new BITBOX({ restURL: TREST_URL }));

    const setWallet = (mnemonic: string): void => {
        const seed = bitbox.Mnemonic.toSeed(mnemonic);
        const masterNode = bitbox.HDNode.fromSeed(seed, 'testnet');
        setWalletData({ masterNode });
    };

    const renderRouteWithProps = (
        Component: React.ComponentClass,
        routeProps: RouteComponentProps
    ): JSX.Element => {
        return (
            <main>
                <Component
                    {...routeProps}
                />
            </main >
        );
    };

    const renderRoutes = (): JSX.Element[] => {
        return routes.map((props: RouteProps, index: number, componentsArray: RouteProps[]): JSX.Element => {
            const Component = componentsArray[index].component;
            const propsClone = { ...{}, ...props };
            delete propsClone.component;

            return (
                <Route
                    {...propsClone}
                    key={index}
                    render={renderRouteWithProps.bind(null, Component)}
                />
            );

        });
    };

    return (
        <Suspense fallback={<div>Loading</div>}>
            <BitboxProvider value={{ bitbox }} >
                <WalletProvider value={{ wallet: walletData, setWallet }}>
                    <Switch>
                        {renderRoutes()}
                    </Switch>
                </WalletProvider>
            </BitboxProvider>
        </Suspense>
    );
};

export default App;