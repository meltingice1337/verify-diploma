import { lazy, FunctionComponent } from 'react';
import { RouteProps } from 'react-router-dom';

const Main = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/main/Main'));
const CreateWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/create-wallet/CreateWallet'));
const OpenWallet = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/open-wallet/OpenWallet'));

const Dashboard = lazy((): Promise<{ default: FunctionComponent }> => import('@pages/dashboard/Dashboard'));

export const routes: RouteProps[] = [
    {
        component: Main,
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
    },
];