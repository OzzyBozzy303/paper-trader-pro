// Trading types and interfaces

export type AssetType = 'BTC' | 'ETH' | 'SOL' | 'FAKE';

export type SpeedMode = 'fast' | 'medium' | 'slow';

export interface Asset {
  id: AssetType;
  name: string;
  symbol: string;
  isFake: boolean;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandleData extends PriceData {
  date: string;
}

export interface Position {
  asset: AssetType;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export interface Trade {
  id: string;
  asset: AssetType;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
  pnl?: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export interface MarketState {
  asset: AssetType;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h?: number;
  candles: CandleData[];
}

export interface TradingState {
  portfolio: Portfolio;
  trades: Trade[];
  currentMarket: MarketState | null;
  selectedAsset: AssetType;
  speedMode: SpeedMode;
  isInitialized: boolean;
  startingCapital: number;
}

// Available assets configuration
export const ASSETS: Asset[] = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', isFake: false },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', isFake: false },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', isFake: false },
  { id: 'FAKE', name: 'Fake Market', symbol: 'FAKE', isFake: true },
];

// Speed configurations (ms between updates)
export const SPEED_CONFIG: Record<SpeedMode, { interval: number; label: string; icon: string }> = {
  fast: { interval: 1000, label: 'Fast', icon: '🏃' },
  medium: { interval: 3000, label: 'Medium', icon: '🚶' },
  slow: { interval: 6000, label: 'Slow', icon: '🐢' },
};
