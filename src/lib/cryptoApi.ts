// CoinGecko API integration for live crypto prices
// Free API - no key required

import { AssetType, CandleData, MarketState } from '@/types/trading';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Map our asset IDs to CoinGecko IDs
const ASSET_TO_COINGECKO: Record<Exclude<AssetType, 'FAKE'>, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
};

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol?: number;
    usd_24h_high?: number;
    usd_24h_low?: number;
  };
}

interface CoinGeckoOHLC {
  // [timestamp, open, high, low, close]
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
}

// Fetch current price for an asset
export async function fetchPrice(asset: Exclude<AssetType, 'FAKE'>): Promise<{
  price: number;
  change24h: number;
  changePercent24h: number;
}> {
  try {
    const coinId = ASSET_TO_COINGECKO[asset];
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: CoinGeckoPrice = await response.json();
    const coinData = data[coinId];
    
    if (!coinData) {
      throw new Error('No data returned');
    }
    
    const price = coinData.usd;
    const changePercent24h = coinData.usd_24h_change || 0;
    const change24h = price * (changePercent24h / 100);
    
    return { price, change24h, changePercent24h };
  } catch (error) {
    console.error(`Failed to fetch price for ${asset}:`, error);
    throw error;
  }
}

// Fetch OHLC candle data
export async function fetchOHLC(asset: Exclude<AssetType, 'FAKE'>, days: number = 1): Promise<CandleData[]> {
  try {
    const coinId = ASSET_TO_COINGECKO[asset];
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: CoinGeckoOHLC[] = await response.json();
    
    return data.map((candle) => ({
      timestamp: candle[0],
      date: new Date(candle[0]).toLocaleTimeString(),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
    }));
  } catch (error) {
    console.error(`Failed to fetch OHLC for ${asset}:`, error);
    throw error;
  }
}

// Fetch complete market data for an asset
export async function fetchMarketData(asset: Exclude<AssetType, 'FAKE'>): Promise<MarketState> {
  try {
    const [priceData, candles] = await Promise.all([
      fetchPrice(asset),
      fetchOHLC(asset, 1),
    ]);
    
    // Calculate high/low from candles
    const high24h = Math.max(...candles.map(c => c.high));
    const low24h = Math.min(...candles.map(c => c.low));
    
    return {
      asset,
      currentPrice: priceData.price,
      change24h: priceData.change24h,
      changePercent24h: priceData.changePercent24h,
      high24h,
      low24h,
      candles,
    };
  } catch (error) {
    console.error(`Failed to fetch market data for ${asset}:`, error);
    throw error;
  }
}

// Format price for display
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  } else {
    return price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  }
}

// Format percentage for display
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// Format large numbers (for volume, etc.)
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}
