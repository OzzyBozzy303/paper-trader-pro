// Custom hook for market data management

import { useState, useEffect, useCallback, useRef } from 'react';
import { AssetType, SpeedMode, MarketState, CandleData } from '@/types/trading';
import { fetchMarketData, fetchPrice } from '@/lib/cryptoApi';
import { 
  generateCandle, 
  getFakeMarketState, 
  initializeFakeMarket,
  getCurrentFakePrice,
} from '@/lib/fakeMarket';
import { SPEED_CONFIG } from '@/types/trading';

interface UseMarketDataReturn {
  marketData: MarketState | null;
  isLoading: boolean;
  error: string | null;
  currentPrice: number;
  refreshData: () => void;
}

export function useMarketData(
  asset: AssetType,
  speedMode: SpeedMode,
  isActive: boolean = true
): UseMarketDataReturn {
  const [marketData, setMarketData] = useState<MarketState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFake = asset === 'FAKE';

  // Clear interval on cleanup
  const clearUpdateInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Fetch initial data for crypto assets
  const fetchInitialData = useCallback(async () => {
    if (isFake) {
      setIsLoading(true);
      try {
        // Initialize fake market
        const candles = initializeFakeMarket();
        const state = getFakeMarketState();
        
        setMarketData({
          asset: 'FAKE',
          currentPrice: state.price,
          change24h: state.change24h,
          changePercent24h: state.changePercent24h,
          high24h: Math.max(...candles.map(c => c.high)),
          low24h: Math.min(...candles.map(c => c.low)),
          candles,
        });
        setCurrentPrice(state.price);
        setError(null);
      } catch (err) {
        setError('Failed to initialize fake market');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const data = await fetchMarketData(asset);
        setMarketData(data);
        setCurrentPrice(data.currentPrice);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch ${asset} data`);
      } finally {
        setIsLoading(false);
      }
    }
  }, [asset, isFake]);

  // Update data periodically
  const updateData = useCallback(async () => {
    if (isFake) {
      // Generate new candle for fake market
      const candle = generateCandle(speedMode);
      const state = getFakeMarketState();
      
      setMarketData(prev => {
        if (!prev) return null;
        
        const candles = [...prev.candles.slice(-99), candle];
        return {
          ...prev,
          currentPrice: state.price,
          change24h: state.change24h,
          changePercent24h: state.changePercent24h,
          high24h: Math.max(...candles.map(c => c.high)),
          low24h: Math.min(...candles.map(c => c.low)),
          candles,
        };
      });
      setCurrentPrice(state.price);
    } else {
      try {
        const priceData = await fetchPrice(asset);
        setMarketData(prev => {
          if (!prev) return null;
          
          // Add new candle based on current price
          const now = Date.now();
          const lastCandle = prev.candles[prev.candles.length - 1];
          const newCandle: CandleData = {
            timestamp: now,
            date: new Date(now).toLocaleTimeString(),
            open: lastCandle?.close || priceData.price,
            high: Math.max(lastCandle?.close || priceData.price, priceData.price),
            low: Math.min(lastCandle?.close || priceData.price, priceData.price),
            close: priceData.price,
          };
          
          const candles = [...prev.candles.slice(-99), newCandle];
          
          return {
            ...prev,
            currentPrice: priceData.price,
            change24h: priceData.change24h,
            changePercent24h: priceData.changePercent24h,
            candles,
          };
        });
        setCurrentPrice(priceData.price);
      } catch (err) {
        // Silent fail on updates, keep existing data
        console.error('Failed to update price:', err);
      }
    }
  }, [asset, isFake, speedMode]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Set up update interval
  useEffect(() => {
    if (!isActive) {
      clearUpdateInterval();
      return;
    }

    // Fake market updates based on speed mode
    // Crypto updates every 30 seconds (to avoid API rate limits)
    const interval = isFake 
      ? SPEED_CONFIG[speedMode].interval 
      : 30000;

    clearUpdateInterval();
    intervalRef.current = setInterval(updateData, interval);

    return clearUpdateInterval;
  }, [isActive, isFake, speedMode, updateData, clearUpdateInterval]);

  // Refresh function
  const refreshData = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    marketData,
    isLoading,
    error,
    currentPrice,
    refreshData,
  };
}

// Hook to get prices for all assets (for portfolio updates)
export function useAllPrices(
  assets: AssetType[],
  speedMode: SpeedMode
): Record<AssetType, number> {
  const [prices, setPrices] = useState<Record<AssetType, number>>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
    FAKE: 100,
  });

  useEffect(() => {
    const updatePrices = async () => {
      const newPrices: Record<AssetType, number> = { ...prices };

      // Update fake market price
      newPrices.FAKE = getCurrentFakePrice();

      // Update crypto prices
      for (const asset of assets.filter(a => a !== 'FAKE')) {
        try {
          const data = await fetchPrice(asset as Exclude<AssetType, 'FAKE'>);
          newPrices[asset] = data.price;
        } catch (err) {
          // Keep existing price on error
        }
      }

      setPrices(newPrices);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, [assets, speedMode]);

  return prices;
}
