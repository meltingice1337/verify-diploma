import { createContext } from 'react';

import { BITBOX } from 'bitbox-sdk';

interface BitboxContextValue {
    bitbox: BITBOX;
}

const BitboxContext = createContext<BitboxContextValue>({ bitbox: new BITBOX() });

export const BitboxProvider = BitboxContext.Provider;
export const BitboxConsumer = BitboxContext.Consumer;
export default BitboxContext;