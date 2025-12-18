// LocalStorage utilities for persisting trading data

import { Portfolio, Trade, TradingState, AssetType, SpeedMode } from '@/types/trading';

const STORAGE_KEYS = {
  PORTFOLIO: 'paper-trading-portfolio',
  TRADES: 'paper-trading-trades',
  STARTING_CAPITAL: 'paper-trading-starting-capital',
  SELECTED_ASSET: 'paper-trading-selected-asset',
  SPEED_MODE: 'paper-trading-speed-mode',
  IS_INITIALIZED: 'paper-trading-initialized',
} as const;

// Save portfolio to localStorage
export function savePortfolio(portfolio: Portfolio): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Failed to save portfolio:', error);
  }
}

// Load portfolio from localStorage
export function loadPortfolio(): Portfolio | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load portfolio:', error);
    return null;
  }
}

// Save trades to localStorage
export function saveTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  } catch (error) {
    console.error('Failed to save trades:', error);
  }
}

// Load trades from localStorage
export function loadTrades(): Trade[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load trades:', error);
    return [];
  }
}

// Save starting capital
export function saveStartingCapital(capital: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STARTING_CAPITAL, capital.toString());
  } catch (error) {
    console.error('Failed to save starting capital:', error);
  }
}

// Load starting capital
export function loadStartingCapital(): number | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STARTING_CAPITAL);
    return data ? parseFloat(data) : null;
  } catch (error) {
    console.error('Failed to load starting capital:', error);
    return null;
  }
}

// Save selected asset
export function saveSelectedAsset(asset: AssetType): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ASSET, asset);
  } catch (error) {
    console.error('Failed to save selected asset:', error);
  }
}

// Load selected asset
export function loadSelectedAsset(): AssetType | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTED_ASSET);
    return data as AssetType | null;
  } catch (error) {
    console.error('Failed to load selected asset:', error);
    return null;
  }
}

// Save speed mode
export function saveSpeedMode(mode: SpeedMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPEED_MODE, mode);
  } catch (error) {
    console.error('Failed to save speed mode:', error);
  }
}

// Load speed mode
export function loadSpeedMode(): SpeedMode | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPEED_MODE);
    return data as SpeedMode | null;
  } catch (error) {
    console.error('Failed to load speed mode:', error);
    return null;
  }
}

// Mark as initialized
export function setInitialized(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, value.toString());
  } catch (error) {
    console.error('Failed to save initialized state:', error);
  }
}

// Check if initialized
export function isInitialized(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';
  } catch (error) {
    console.error('Failed to check initialized state:', error);
    return false;
  }
}

// Clear all trading data
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

// Load complete trading state
export function loadTradingState(): Partial<TradingState> {
  const portfolio = loadPortfolio();
  const trades = loadTrades();
  const startingCapital = loadStartingCapital();
  const selectedAsset = loadSelectedAsset();
  const speedMode = loadSpeedMode();
  const initialized = isInitialized();

  return {
    portfolio: portfolio || undefined,
    trades,
    startingCapital: startingCapital || 10000,
    selectedAsset: selectedAsset || 'BTC',
    speedMode: speedMode || 'medium',
    isInitialized: initialized,
  };
}
