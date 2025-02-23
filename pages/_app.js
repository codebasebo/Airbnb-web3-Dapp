import '../styles/globals.css';
import { Provider } from '../context/context';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

// Define the custom Arbitrum Sepolia chain
const arbitrumSepolia = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  network: 'arbitrum-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
    public: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia-explorer.arbitrum.io/',
    },
  },
  testnet: true,
};

// Configure chains and providers
const { chains, provider } = configureChains(
  [arbitrumSepolia], // Use the custom chain definition
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY, priority: 1 }),
    jsonRpcProvider({
      priority: 2,
      rpc: (chain) => {
        if (chain.id === arbitrumSepolia.id) {
          return { http: 'https://sepolia-rollup.arbitrum.io/rpc' };
        }
        return null;
      },
    }),
  ]
);

// Configure connectors
const { connectors } = getDefaultWallets({
  appName: 'Instagram',
  chains,
});

// Create Wagmi client
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

// MyApp component
const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()} coolMode>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </Provider>
  );
};

export default MyApp;