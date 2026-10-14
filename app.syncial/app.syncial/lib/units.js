import { parseUnits, formatUnits } from 'viem';

export const USDC_DECIMALS = 6;
export const USDC_NATIVE_DECIMALS = 18;

/**
 * Parses user input string into BigInt for standard 6-decimal ERC-20 USDC.
 * e.g. "1" -> 1000000n
 */
export function parseUSDC(amount) {
  if (!amount || isNaN(Number(amount))) {
    return 0n;
  }
  const [whole, fraction = ''] = amount.toString().split('.');
  const trimmed = fraction.slice(0, USDC_DECIMALS);
  const cleanAmount = trimmed ? `${whole}.${trimmed}` : whole;
  return parseUnits(cleanAmount, USDC_DECIMALS);
}

/**
 * Parses user input string into BigInt for Arc's native 18-decimal gas USDC.
 * e.g. "1" -> 1000000000000000000n
 */
export function parseUSDCNative(amount) {
  if (!amount || isNaN(Number(amount))) {
    return 0n;
  }
  const [whole, fraction = ''] = amount.toString().split('.');
  const trimmed = fraction.slice(0, USDC_NATIVE_DECIMALS);
  const cleanAmount = trimmed ? `${whole}.${trimmed}` : whole;
  return parseUnits(cleanAmount, USDC_NATIVE_DECIMALS);
}

/**
 * Formats a BigInt or numeric string from 6 decimals to human-readable USDC string.
 * e.g. 1000000n -> "1.00"
 */
export function formatUSDC(rawAmount, maxDecimals = 2) {
  if (rawAmount === undefined || rawAmount === null) return '0.00';
  try {
    const bigVal = typeof rawAmount === 'bigint' ? rawAmount : BigInt(Math.floor(Number(rawAmount)));
    const formatted = formatUnits(bigVal, USDC_DECIMALS);
    const num = Number(formatted);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: Math.min(2, maxDecimals),
      maximumFractionDigits: maxDecimals,
    });
  } catch (error) {
    return '0.00';
  }
}

/**
 * Formats a raw amount into dollar currency display: "$12.50 USDC"
 */
export function formatUSDCCurrency(rawAmount, includeSymbol = true) {
  const formatted = formatUSDC(rawAmount, 2);
  return includeSymbol ? `$${formatted} USDC` : `$${formatted}`;
}
