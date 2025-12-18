// Trade History Component

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trade, AssetType } from '@/types/trading';
import { formatPrice } from '@/lib/cryptoApi';
import { cn } from '@/lib/utils';
import { History, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
}

// Asset icons
const ASSET_ICONS: Record<AssetType, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  FAKE: '🎮',
};

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <History className="w-4 h-4" />
            Trade-Historie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Noch keine Trades</p>
            <p className="text-sm">Deine Trades werden hier angezeigt</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <History className="w-4 h-4" />
          Trade-Historie ({trades.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-2">
            {trades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Trade Row Component
function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.type === 'buy';
  const date = new Date(trade.timestamp);
  const timeString = date.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const dateString = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isBuy ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
        )}>
          {isBuy ? (
            <ArrowUpCircle className="w-5 h-5" />
          ) : (
            <ArrowDownCircle className="w-5 h-5" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{ASSET_ICONS[trade.asset]}</span>
            <span className="font-medium">
              {isBuy ? 'Kauf' : 'Verkauf'} {trade.asset}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {dateString} • {timeString}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-mono text-sm">
          {trade.quantity.toFixed(6)} @ {formatPrice(trade.price)}
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className={cn(
            'font-mono font-medium',
            isBuy ? 'text-loss' : 'text-profit'
          )}>
            {isBuy ? '-' : '+'}{formatPrice(trade.total)}
          </span>
          {trade.pnl !== undefined && (
            <span className={cn(
              'text-xs font-mono',
              trade.pnl >= 0 ? 'text-profit' : 'text-loss'
            )}>
              ({trade.pnl >= 0 ? '+' : ''}{formatPrice(trade.pnl)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
