import { lazy, FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

const Authentication = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/authentication/Authentication'));
const CreateWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/create-wallet/CreateWallet'));
const OpenWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/open-wallet/OpenWallet'));

const Dashboard = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/dashboard/Dashboard'));
const CreateCertificate = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/create-certificate/CreateCertificate'));

export const routes: RouteProps[] = [
    {
        component: Authentication,
        path: '/',
        exact: true
    },
    {
        component: CreateWallet,
        path: '/wallet/create'
    },
    {
        component: OpenWallet,
        path: '/wallet/open'
    },
    {
        component: Dashboard,
        path: '/dashboard',
        exact: true
    },
    {
        component: CreateCertificate,
        path: '/dashboard/create-certificate'
    },
];