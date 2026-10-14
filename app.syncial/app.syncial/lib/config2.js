// Arc Mainnet configuration (Single Chain)

export const PREDICTION_MARKET_ADDRESS = "0xCB35bbf1a3633161092bD324383E9667bAb529C9";
export const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Pyth Network address on Arc Mainnet
export const PYTH_ADDRESSES = {
  5042: "0xACeA761c27A909d4D3895128EBe6370FDE2dF481",
};

// Pyth Price Feed IDs
export const PRICE_FEEDS = {
  ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  BTC_USD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  SOL_USD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  HBAR_USD: "0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd",
};

export const SUPPORTED_CHAINS = [5042]; // Arc Mainnet ONLY
export const DEFAULT_CHAIN_ID = 5042;
export const DEBUG_MODE = process.env.NODE_ENV === 'development';
