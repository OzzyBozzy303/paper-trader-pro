// Custom hook for trading state management

import { useState, useEffect, useCallback } from 'react';
import { 
  Portfolio, 
  Trade, 
  Position, 
  AssetType, 
  SpeedMode,
  TradingState,
} from '@/types/trading';
import {
  savePortfolio,
  saveTrades,
  saveSelectedAsset,
  saveSpeedMode,
  saveStartingCapital,
  setInitialized,
  loadTradingState,
  clearAllData,
} from '@/lib/localStorage';

// Generate unique trade ID
function generateTradeId(): string {
  return `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useTrading() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [startingCapital, setStartingCapitalState] = useState(10000);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 10000,
    positions: [],
    totalValue: 10000,
    totalPnL: 0,
    totalPnLPercent: 0,
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedAsset, setSelectedAssetState] = useState<AssetType>('BTC');
  const [speedMode, setSpeedModeState] = useState<SpeedMode>('medium');

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadTradingState();
    
    if (savedState.isInitialized && savedState.portfolio) {
      setIsInitialized(true);
      setStartingCapitalState(savedState.startingCapital || 10000);
      setPortfolio(savedState.portfolio);
      setTrades(savedState.trades || []);
      setSelectedAssetState(savedState.selectedAsset || 'BTC');
      setSpeedModeState(savedState.speedMode || 'medium');
    }
  }, []);

  // Save portfolio whenever it changes
  useEffect(() => {
    if (isInitialized) {
      savePortfolio(portfolio);
    }
  }, [portfolio, isInitialized]);

  // Save trades whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveTrades(trades);
    }
  }, [trades, isInitialized]);

  // Initialize trading session with starting capital
  const initializeTrading = useCallback((capital: number) => {
    const initialPortfolio: Portfolio = {
      cash: capital,
      positions: [],
      totalValue: capital,
      totalPnL: 0,
      totalPnLPercent: 0,
    };

    setStartingCapitalState(capital);
    setPortfolio(initialPortfolio);
    setTrades([]);
    setIsInitialized(true);

    saveStartingCapital(capital);
    savePortfolio(initialPortfolio);
    saveTrades([]);
    setInitialized(true);
  }, []);

  // Update portfolio values with current prices
  const updatePortfolioValues = useCallback((prices: Record<AssetType, number>) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(pos => ({
        ...pos,
        currentPrice: prices[pos.asset] || pos.currentPrice,
      }));

      const positionsValue = updatedPositions.reduce(
        (sum, pos) => sum + pos.quantity * pos.currentPrice,
        0
      );

      const totalValue = prev.cash + positionsValue;
      const totalPnL = totalValue - startingCapital;
      const totalPnLPercent = (totalPnL / startingCapital) * 100;

      return {
        ...prev,
        positions: updatedPositions,
        totalValue,
        totalPnL,
        totalPnLPercent,
      };
    });
  }, [startingCapital]);

  // Execute buy order
  const executeBuy = useCallback((asset: AssetType, quantity: number, price: number) => {
    const total = quantity * price;

    if (total > portfolio.cash) {
      throw new Error('Insufficient funds');
    }

    // Create trade record
    const trade: Trade = {
      id: generateTradeId(),
      asset,
      type: 'buy',
      quantity,
      price,
      total,
      timestamp: Date.now(),
    };

    // Update portfolio
    setPortfolio(prev => {
      const existingPosition = prev.positions.find(p => p.asset === asset);
      let newPositions: Position[];

      if (existingPosition) {
        // Average into existing position
        const newQuantity = existingPosition.quantity + quantity;
        const newAvgPrice = (existingPosition.avgBuyPrice * existingPosition.quantity + total) / newQuantity;
        
        newPositions = prev.positions.map(p =>
          p.asset === asset
            ? { ...p, quantity: newQuantity, avgBuyPrice: newAvgPrice, currentPrice: price }
            : p
        );
      } else {
        // Create new position
        newPositions = [
          ...prev.positions,
          { asset, quantity, avgBuyPrice: price, currentPrice: price },
        ];
      }

      const positionsValue = newPositions.reduce(
        (sum, pos) => sum + pos.quantity * pos.currentPrice,
        0
      );
      const newCash = prev.cash - total;
      const totalValue = newCash + positionsValue;
      const totalPnL = totalValue - startingCapital;
      const totalPnLPercent = (totalPnL / startingCapital) * 100;

      return {
        cash: newCash,
        positions: newPositions,
        totalValue,
        totalPnL,
        totalPnLPercent,
      };
    });

    setTrades(prev => [trade, ...prev]);
    return trade;
  }, [portfolio.cash, startingCapital]);

  // Execute sell order
  const executeSell = useCallback((asset: AssetType, quantity: number, price: number) => {
    const position = portfolio.positions.find(p => p.asset === asset);
    
    if (!position || position.quantity < quantity) {
      throw new Error('Insufficient position');
    }

    const total = quantity * price;
    const pnl = (price - position.avgBuyPrice) * quantity;

    // Create trade record
    const trade: Trade = {
      id: generateTradeId(),
      asset,
      type: 'sell',
      quantity,
      price,
      total,
      timestamp: Date.now(),
      pnl,
    };

    // Update portfolio
    setPortfolio(prev => {
      const newQuantity = position.quantity - quantity;
      let newPositions: Position[];

      if (newQuantity <= 0) {
        // Remove position entirely
        newPositions = prev.positions.filter(p => p.asset !== asset);
      } else {
        // Reduce position
        newPositions = prev.positions.map(p =>
          p.asset === asset
            ? { ...p, quantity: newQuantity }
            : p
        );
      }

      const positionsValue = newPositions.reduce(
        (sum, pos) => sum + pos.quantity * pos.currentPrice,
        0
      );
      const newCash = prev.cash + total;
      const totalValue = newCash + positionsValue;
      const totalPnL = totalValue - startingCapital;
      const totalPnLPercent = (totalPnL / startingCapital) * 100;

      return {
        cash: newCash,
        positions: newPositions,
        totalValue,
        totalPnL,
        totalPnLPercent,
      };
    });

    setTrades(prev => [trade, ...prev]);
    return trade;
  }, [portfolio.positions, startingCapital]);

  // Get position for specific asset
  const getPosition = useCallback((asset: AssetType): Position | undefined => {
    return portfolio.positions.find(p => p.asset === asset);
  }, [portfolio.positions]);

  // Select asset
  const selectAsset = useCallback((asset: AssetType) => {
    setSelectedAssetState(asset);
    saveSelectedAsset(asset);
  }, []);

  // Set speed mode
  const setSpeedMode = useCallback((mode: SpeedMode) => {
    setSpeedModeState(mode);
    saveSpeedMode(mode);
  }, []);

  // Reset all data
  const resetTrading = useCallback(() => {
    clearAllData();
    setIsInitialized(false);
    setPortfolio({
      cash: 10000,
      positions: [],
      totalValue: 10000,
      totalPnL: 0,
      totalPnLPercent: 0,
    });
    setTrades([]);
  }, []);

  return {
    // State
    isInitialized,
    startingCapital,
    portfolio,
    trades,
    selectedAsset,
    speedMode,
    
    // Actions
    initializeTrading,
    updatePortfolioValues,
    executeBuy,
    executeSell,
    getPosition,
    selectAsset,
    setSpeedMode,
    resetTrading,
  };
}
