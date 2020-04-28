import { lazy, FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

const Authentication = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/authentication/Authentication'));
const Login = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/login/Login'));
const CreateWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/create-wallet/CreateWallet'));
const OpenWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/open-wallet/OpenWallet'));

export const routes: RouteProps[] = [
    {
        component: Authentication,
        path: '/',
        exact: true
    },
    {
        component: Login,
        path: '/login'
    },
    {
        component: CreateWallet,
        path: '/wallet/create'
    },
    {
        component: OpenWallet,
        path: '/wallet/open'
    }
];