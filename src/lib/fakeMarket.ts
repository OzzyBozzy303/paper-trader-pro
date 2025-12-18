// Fake Market Algorithm - Generates realistic price movements

import { CandleData, SpeedMode } from '@/types/trading';

// Initial fake market price
const INITIAL_PRICE = 100;

// Volatility and trend parameters by speed mode
const MARKET_PARAMS = {
  fast: {
    volatility: 0.02,      // 2% max move per tick
    trendStrength: 0.6,    // Strong trend following
    noiseLevel: 0.4,       // Random noise factor
    meanReversion: 0.001,  // Slight pull to mean
  },
  medium: {
    volatility: 0.015,
    trendStrength: 0.5,
    noiseLevel: 0.5,
    meanReversion: 0.002,
  },
  slow: {
    volatility: 0.01,
    trendStrength: 0.4,
    noiseLevel: 0.6,
    meanReversion: 0.003,
  },
};

// Market state for simulation
interface FakeMarketState {
  price: number;
  trend: number;        // Current trend direction (-1 to 1)
  momentum: number;     // Accumulated momentum
  candles: CandleData[];
  lastUpdate: number;
}

let marketState: FakeMarketState = {
  price: INITIAL_PRICE,
  trend: 0,
  momentum: 0,
  candles: [],
  lastUpdate: Date.now(),
};

// Generate random number with normal distribution (Box-Muller)
function gaussianRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Generate the next price tick
export function generateNextPrice(speedMode: SpeedMode): number {
  const params = MARKET_PARAMS[speedMode];
  
  // Random component (Gaussian noise)
  const noise = gaussianRandom() * params.volatility * params.noiseLevel;
  
  // Trend component - tends to continue in same direction
  const trendChange = (Math.random() - 0.5) * 0.2;
  marketState.trend = Math.max(-1, Math.min(1, 
    marketState.trend * 0.95 + trendChange
  ));
  const trendMove = marketState.trend * params.volatility * params.trendStrength;
  
  // Mean reversion - pulls price back towards initial
  const meanReversionForce = (INITIAL_PRICE - marketState.price) / INITIAL_PRICE * params.meanReversion;
  
  // Momentum - accumulates from recent moves
  const momentumMove = marketState.momentum * 0.1;
  
  // Calculate total price change
  const priceChange = marketState.price * (noise + trendMove + meanReversionForce + momentumMove);
  
  // Update momentum
  marketState.momentum = marketState.momentum * 0.9 + (priceChange / marketState.price);
  
  // Apply change (ensure price stays positive)
  marketState.price = Math.max(1, marketState.price + priceChange);
  
  return marketState.price;
}

// Generate a new candle
export function generateCandle(speedMode: SpeedMode): CandleData {
  const now = Date.now();
  const open = marketState.price;
  
  // Generate 4 intermediate prices for OHLC
  const prices: number[] = [open];
  for (let i = 0; i < 4; i++) {
    generateNextPrice(speedMode);
    prices.push(marketState.price);
  }
  
  const close = marketState.price;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  
  const candle: CandleData = {
    timestamp: now,
    date: new Date(now).toLocaleTimeString(),
    open,
    high,
    low,
    close,
    volume: Math.floor(Math.random() * 1000000) + 100000,
  };
  
  // Keep last 100 candles
  marketState.candles = [...marketState.candles.slice(-99), candle];
  marketState.lastUpdate = now;
  
  return candle;
}

// Get current market state
export function getFakeMarketState(): { 
  price: number; 
  candles: CandleData[];
  change24h: number;
  changePercent24h: number;
} {
  const candles = marketState.candles;
  const currentPrice = marketState.price;
  
  // Calculate 24h change (use first candle as reference)
  const firstCandle = candles[0];
  const referencePrice = firstCandle?.open || INITIAL_PRICE;
  const change24h = currentPrice - referencePrice;
  const changePercent24h = (change24h / referencePrice) * 100;
  
  return {
    price: currentPrice,
    candles,
    change24h,
    changePercent24h,
  };
}

// Initialize fake market with historical data
export function initializeFakeMarket(): CandleData[] {
  // Reset state
  marketState = {
    price: INITIAL_PRICE,
    trend: (Math.random() - 0.5) * 0.4, // Random initial trend
    momentum: 0,
    candles: [],
    lastUpdate: Date.now(),
  };
  
  // Generate 50 historical candles
  const now = Date.now();
  for (let i = 50; i > 0; i--) {
    const candle = generateCandle('medium');
    candle.timestamp = now - i * 60000; // 1 minute apart
    candle.date = new Date(candle.timestamp).toLocaleTimeString();
  }
  
  return marketState.candles;
}

// Reset fake market
export function resetFakeMarket(): void {
  initializeFakeMarket();
}

// Get current price
export function getCurrentFakePrice(): number {
  return marketState.price;
}
