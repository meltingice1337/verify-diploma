import React, { Suspense } from 'react';
import { RouteComponentProps, Route, RouteProps, Switch } from 'react-router-dom';

import { routes } from './routes';

const App = (): JSX.Element => {

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
            <Switch>
                {renderRoutes()}
            </Switch>
        </Suspense>
    );
};

export default App;