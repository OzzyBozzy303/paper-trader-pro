// Main Trading Dashboard Component

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssetSelector } from './AssetSelector';
import { SpeedSelector } from './SpeedSelector';
import { PriceDisplay } from './PriceDisplay';
import { CandlestickChart } from './CandlestickChart';
import { TradingPanel } from './TradingPanel';
import { PortfolioOverview } from './PortfolioOverview';
import { TradeHistory } from './TradeHistory';
import { useTrading } from '@/hooks/useTrading';
import { useMarketData, useAllPrices } from '@/hooks/useMarketData';
import { ASSETS, AssetType } from '@/types/trading';
import { RefreshCw, LogOut, BarChart3 } from 'lucide-react';

interface TradingDashboardProps {
  onReset: () => void;
}

export function TradingDashboard({ onReset }: TradingDashboardProps) {
  const {
    portfolio,
    trades,
    selectedAsset,
    speedMode,
    startingCapital,
    selectAsset,
    setSpeedMode,
    executeBuy,
    executeSell,
    getPosition,
    updatePortfolioValues,
  } = useTrading();

  const { marketData, isLoading, currentPrice, refreshData } = useMarketData(
    selectedAsset,
    speedMode,
    true
  );

  // Get prices for all assets to update portfolio values
  const allPrices = useAllPrices(['BTC', 'ETH', 'SOL', 'FAKE'], speedMode);

  // Update portfolio with current prices
  useEffect(() => {
    updatePortfolioValues(allPrices);
  }, [allPrices, updatePortfolioValues]);

  const currentAsset = ASSETS.find(a => a.id === selectedAsset);
  const position = getPosition(selectedAsset);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Paper Trading</h1>
            <p className="text-sm text-muted-foreground">Simulation • Kein Echtgeld</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Aktualisieren
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </header>

      {/* Asset & Speed Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Asset</label>
          <AssetSelector 
            selectedAsset={selectedAsset} 
            onSelectAsset={selectAsset} 
          />
        </div>
        
        {selectedAsset === 'FAKE' && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Geschwindigkeit</label>
            <SpeedSelector
              speedMode={speedMode}
              onSelectSpeed={setSpeedMode}
            />
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Price */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Display */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <PriceDisplay
                price={currentPrice}
                change24h={marketData?.change24h || 0}
                changePercent24h={marketData?.changePercent24h || 0}
                symbol={currentAsset?.symbol || ''}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Candlestick Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <CandlestickChart
                  data={marketData?.candles || []}
                  currentPrice={currentPrice}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trade History (visible on larger screens) */}
          <div className="hidden lg:block">
            <TradeHistory trades={trades} />
          </div>
        </div>

        {/* Right Column - Trading & Portfolio */}
        <div className="space-y-6">
          {/* Trading Panel */}
          <TradingPanel
            asset={selectedAsset}
            currentPrice={currentPrice}
            cash={portfolio.cash}
            position={position}
            onBuy={(qty, price) => executeBuy(selectedAsset, qty, price)}
            onSell={(qty, price) => executeSell(selectedAsset, qty, price)}
          />

          {/* Portfolio Overview */}
          <PortfolioOverview
            portfolio={portfolio}
            startingCapital={startingCapital}
          />

          {/* Trade History (visible on mobile) */}
          <div className="lg:hidden">
            <TradeHistory trades={trades} />
          </div>
        </div>
      </div>
    </div>
  );
}
