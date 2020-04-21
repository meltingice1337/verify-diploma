import { lazy, FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

const Authentication = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/authentication/Authentication'));


export const routes: RouteProps[] = [
    {
        component: Authentication,
        path: '/'
    }
];