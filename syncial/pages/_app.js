import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
// import Footer from '../components/Footer';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import { metis } from 'wagmi/chains'
import { getDefaultConfig, } from '@rainbow-me/rainbowkit'


const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '9c17dc69becbe137fe50e55e31598852',
  chains: [metis],
  transports: {
    [metis.id]: http(),
  },
})
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
<WagmiProvider config={config}>
<QueryClientProvider  client={queryClient}>
        <RainbowKitProvider 
        initialChain={4}
        theme={darkTheme({
          accentColor: '#f43f5e',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          modalBorder: '#F33A6A'
        })}
        
      >
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Component {...pageProps} />
            <Analytics />
          </div>
          {/* <Footer /> */}
        </div>
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>

    );
}

export default MyApp;