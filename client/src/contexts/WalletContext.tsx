import { createContext } from 'react';
import { HDNode } from 'bitcoincashjs-lib';

export interface AddressDetails {
    balance: number;
    satoshis: number;
}

export interface WalletData {
    account: HDNode;
    addressDetails: AddressDetails;
}

interface WalletContextValue {
    wallet: WalletData | undefined;
    setWallet: (mnemonic: string) => void;
}

const WalletContext = createContext<WalletContextValue>({ wallet: undefined, setWallet: () => { void 0; } });

export const WalletProvider = WalletContext.Provider;
export const WalletConsumer = WalletContext.Consumer;
export default WalletContext;
