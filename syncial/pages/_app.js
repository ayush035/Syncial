import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
// import Footer from '../components/Footer';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import { metis, sepolia } from 'wagmi/chains'
import { getDefaultConfig, } from '@rainbow-me/rainbowkit'


const config = getDefaultConfig({
  appName: 'Syncial',
  projectId: 'e789aa4ef8fbaccc12ac0cca7d97b01d',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  }
})
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
<WagmiProvider config={config}>
<QueryClientProvider  client={queryClient}>
        <RainbowKitProvider 
        initialChain={4}
        theme={darkTheme({
          accentColor: '#ED3968',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          modalBorder: '#F33A6A'
        })}
        
      >
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Component {...pageProps} />
            <Analytics />
            <SpeedInsights />
          </div>
          {/* <Footer /> */}
        </div>
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>

    );
}

export default MyApp;