// hooks/usePyth.js
import { useEffect, useState } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";
import { PRICE_FEEDS } from "@/lib/config2";

// Map Pyth Feed IDs to standard crypto symbols
const FEED_TO_SYMBOL = {
  [PRICE_FEEDS.ETH_USD]: "ETHUSDT",
  [PRICE_FEEDS.BTC_USD]: "BTCUSDT",
  [PRICE_FEEDS.SOL_USD]: "SOLUSDT",
  [PRICE_FEEDS.HBAR_USD]: "HBARUSDT",
};

const SYMBOL_TO_FEED = {
  ETHUSDT: PRICE_FEEDS.ETH_USD,
  BTCUSDT: PRICE_FEEDS.BTC_USD,
  SOLUSDT: PRICE_FEEDS.SOL_USD,
  HBARUSDT: PRICE_FEEDS.HBAR_USD,
};

// Fallback prices in case of network latency
const INITIAL_PRICES = {
  [PRICE_FEEDS.ETH_USD]: { price: 242500000000, expo: -8 },
  [PRICE_FEEDS.BTC_USD]: { price: 8190000000000, expo: -8 },
  [PRICE_FEEDS.SOL_USD]: { price: 10500000000, expo: -8 },
  [PRICE_FEEDS.HBAR_USD]: { price: 8500000, expo: -8 },
};

export const usePyth = () => {
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPythPrices = async () => {
      // 1. Try Pyth Hermes API (authenticated or unauthenticated)
      try {
        const apiKey = process.env.NEXT_PUBLIC_PYTH_API_KEY;
        const options = apiKey
          ? { headers: { Authorization: `Bearer ${apiKey}` } }
          : undefined;

        const connection = new HermesClient("https://hermes.pyth.network", options);
        const priceIds = Object.values(PRICE_FEEDS);
        const updates = await connection.getLatestPriceUpdates(priceIds);

        if (updates && updates.parsed && updates.parsed.length > 0) {
          const priceMap = {};
          priceIds.forEach((feedId, idx) => {
            const parsed = updates.parsed[idx];
            if (parsed && parsed.price) {
              priceMap[feedId] = {
                price: Number(parsed.price.price),
                expo: Number(parsed.price.expo),
                publishTime: parsed.price.publishTime,
              };
            }
          });

          if (isMounted && Object.keys(priceMap).length > 0) {
            setPrices((prev) => ({ ...prev, ...priceMap }));
            setLoading(false);
            return;
          }
        }
      } catch (hermesErr) {
        // Hermes is protected or unavailable; seamlessly fallback to live public market tickers
      }

      // 2. High-reliability public spot price fallback
      try {
        const symbolsParam = encodeURIComponent(
          JSON.stringify(["ETHUSDT", "BTCUSDT", "SOLUSDT", "HBARUSDT"])
        );
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data = await res.json();
          const fallbackMap = {};

          data.forEach((item) => {
            const feedId = SYMBOL_TO_FEED[item.symbol];
            if (feedId) {
              const numericPrice = parseFloat(item.price);
              if (!isNaN(numericPrice) && numericPrice > 0) {
                fallbackMap[feedId] = {
                  price: Math.round(numericPrice * 1e8),
                  expo: -8,
                  publishTime: Math.floor(Date.now() / 1000),
                };
              }
            }
          });

          if (isMounted && Object.keys(fallbackMap).length > 0) {
            setPrices((prev) => ({ ...prev, ...fallbackMap }));
            setLoading(false);
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn("Public ticker fallback error:", fallbackErr);
      }

      // 3. Secondary fallback: Coinbase API
      try {
        const coinMap = {
          ETH: PRICE_FEEDS.ETH_USD,
          BTC: PRICE_FEEDS.BTC_USD,
          SOL: PRICE_FEEDS.SOL_USD,
        };

        const fetches = Object.keys(coinMap).map(async (coin) => {
          const cbRes = await fetch(`https://api.coinbase.com/v2/prices/${coin}-USD/spot`);
          if (cbRes.ok) {
            const cbData = await cbRes.json();
            const val = parseFloat(cbData?.data?.amount);
            if (!isNaN(val) && val > 0) {
              return { feedId: coinMap[coin], price: Math.round(val * 1e8) };
            }
          }
          return null;
        });

        const results = await Promise.all(fetches);
        const cbMap = {};
        results.forEach((r) => {
          if (r) {
            cbMap[r.feedId] = { price: r.price, expo: -8, publishTime: Math.floor(Date.now() / 1000) };
          }
        });

        if (isMounted && Object.keys(cbMap).length > 0) {
          setPrices((prev) => ({ ...prev, ...cbMap }));
          setLoading(false);
        }
      } catch (cbErr) {
        console.warn("Coinbase fallback error:", cbErr);
      }
    };

    fetchPythPrices();
    const interval = setInterval(fetchPythPrices, 8000); // 8s refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getFormattedPrice = (feedId) => {
    const priceData = prices[feedId];
    if (!priceData) return null;

    const price = priceData.price * Math.pow(10, priceData.expo);
    if (isNaN(price)) return null;

    if (price < 1) {
      return price.toFixed(4);
    }
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return {
    prices,
    loading,
    getFormattedPrice,
  };
};
