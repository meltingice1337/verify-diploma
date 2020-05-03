import React, { Suspense, useState, useEffect } from 'react';
import { RouteComponentProps, Route, RouteProps, Switch } from 'react-router-dom';
import { BITBOX, TREST_URL } from 'bitbox-sdk';
import { HDNode } from 'bitcoincashjs-lib';
import { AddressDetailsResult } from 'bitcoin-com-rest';

import { routes } from './routes';

import { LoadingProvider } from '@contexts/LoadingContext';
import { BitboxProvider } from '@contexts/BitboxContext';
import { WalletProvider, WalletData } from '@contexts/WalletContext';

import { Spinner } from '@components/spinner/Spinner';

const App = (): JSX.Element => {
    const [walletData, setWalletData] = useState<WalletData>();
    const [bitbox] = useState(new BITBOX({ restURL: TREST_URL }));
    const [isLoading, setIsLoading] = useState(false);

    const setWallet = async (mnemonic: string): Promise<void> => {
        setIsLoading(true);
        const seed = bitbox.Mnemonic.toSeed(mnemonic);
        const masterNode = bitbox.HDNode.fromSeed(seed, 'testnet');
        const account = masterNode.derivePath('m/44\'/1\'/0\'/0/0') as HDNode;

        const addressDetails = await bitbox.Address.details(account.getAddress()) as AddressDetailsResult;
        setWalletData({ account, addressDetails });
        setIsLoading(false);
    };

    // TODO Change this temporary measure
    useEffect(() => {
        setWallet('hint lens spread combine guide heart taxi curious oxygen lock advice aerobic');
    }, []);

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
        <Suspense fallback={<Spinner />}>
            {isLoading && <Spinner />}
            <BitboxProvider value={{ bitbox }} >
                <WalletProvider value={{ wallet: walletData, setWallet }}>
                    <LoadingProvider value={{ setIsLoading }}>
                        <Switch>
                            {renderRoutes()}
                        </Switch>
                    </LoadingProvider>
                </WalletProvider>
            </BitboxProvider>
        </Suspense >
    );
};

export default App;