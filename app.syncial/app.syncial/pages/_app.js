import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { arcMainnet } from '@/lib/chains';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// STRICT: Arc Mainnet is the ONLY configured chain
const config = getDefaultConfig({
  appName: 'Syncial',
  projectId: 'e789aa4ef8fbaccc12ac0cca7d97b01d',
  chains: [arcMainnet],
  transports: {
    [arcMainnet.id]: http('https://rpc.mainnet.arc.io'),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arcMainnet}
          theme={darkTheme({
            accentColor: '#ED3968',
            accentColorForeground: '#FFFFFF',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <div className="flex flex-col min-h-screen bg-[#09090B] text-[#EDEDED] antialiased">
            <Navbar />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
