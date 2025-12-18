// Price Display Component

import { formatPrice, formatPercent } from '@/lib/cryptoApi';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  change24h: number;
  changePercent24h: number;
  symbol: string;
  isLoading?: boolean;
}

export function PriceDisplay({
  price,
  change24h,
  changePercent24h,
  symbol,
  isLoading,
}: PriceDisplayProps) {
  const isPositive = changePercent24h >= 0;
  
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono text-foreground">
          {formatPrice(price)}
        </span>
        <span className="text-lg text-muted-foreground">{symbol}</span>
      </div>
      
      <div className={cn(
        'flex items-center gap-2 text-sm',
        isPositive ? 'text-profit' : 'text-loss'
      )}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span className="font-mono">
          {isPositive ? '+' : ''}{formatPrice(change24h).replace('$', '')}
        </span>
        <span className="font-semibold">
          ({formatPercent(changePercent24h)})
        </span>
        <span className="text-muted-foreground">24h</span>
      </div>
    </div>
  );
}
