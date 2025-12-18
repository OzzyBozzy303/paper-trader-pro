// Portfolio Overview Component

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Portfolio, Position, AssetType } from '@/types/trading';
import { formatPrice, formatPercent } from '@/lib/cryptoApi';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Coins } from 'lucide-react';

interface PortfolioOverviewProps {
  portfolio: Portfolio;
  startingCapital: number;
}

// Asset icons
const ASSET_ICONS: Record<AssetType, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  FAKE: '🎮',
};

export function PortfolioOverview({ portfolio, startingCapital }: PortfolioOverviewProps) {
  const isPositive = portfolio.totalPnL >= 0;

  return (
    <div className="space-y-4">
      {/* Total Value */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Gesamtwert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">
            {formatPrice(portfolio.totalValue)}
          </div>
          <div className={cn(
            'flex items-center gap-2 mt-1',
            isPositive ? 'text-profit' : 'text-loss'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-mono font-semibold">
              {isPositive ? '+' : ''}{formatPrice(portfolio.totalPnL)}
            </span>
            <span className="text-sm">
              ({formatPercent(portfolio.totalPnLPercent)})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cash & Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <PiggyBank className="w-4 h-4" />
              Bargeld
            </div>
            <div className="text-xl font-bold font-mono">
              {formatPrice(portfolio.cash)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Coins className="w-4 h-4" />
              Startkapital
            </div>
            <div className="text-xl font-bold font-mono">
              {formatPrice(startingCapital)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      {portfolio.positions.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Positionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolio.positions.map((position) => (
              <PositionRow key={position.asset} position={position} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Position Row Component
function PositionRow({ position }: { position: Position }) {
  const value = position.quantity * position.currentPrice;
  const pnl = (position.currentPrice - position.avgBuyPrice) * position.quantity;
  const pnlPercent = ((position.currentPrice - position.avgBuyPrice) / position.avgBuyPrice) * 100;
  const isPositive = pnl >= 0;

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{ASSET_ICONS[position.asset]}</span>
        <div>
          <div className="font-medium">{position.asset}</div>
          <div className="text-sm text-muted-foreground font-mono">
            {position.quantity.toFixed(6)}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-mono font-medium">{formatPrice(value)}</div>
        <div className={cn(
          'text-sm font-mono',
          isPositive ? 'text-profit' : 'text-loss'
        )}>
          {isPositive ? '+' : ''}{formatPrice(pnl)} ({formatPercent(pnlPercent)})
        </div>
      </div>
    </div>
  );
}
