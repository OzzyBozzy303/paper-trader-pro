// Trading Panel Component - Buy/Sell Interface

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetType, Position } from '@/types/trading';
import { formatPrice } from '@/lib/cryptoApi';
import { cn } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Wallet, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingPanelProps {
  asset: AssetType;
  currentPrice: number;
  cash: number;
  position?: Position;
  onBuy: (quantity: number, price: number) => void;
  onSell: (quantity: number, price: number) => void;
}

export function TradingPanel({
  asset,
  currentPrice,
  cash,
  position,
  onBuy,
  onSell,
}: TradingPanelProps) {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const { toast } = useToast();

  // Calculate max quantities
  const maxBuyQuantity = useMemo(() => {
    if (currentPrice <= 0) return 0;
    return cash / currentPrice;
  }, [cash, currentPrice]);

  const maxSellQuantity = position?.quantity || 0;

  // Calculate totals
  const buyQuantity = parseFloat(buyAmount) || 0;
  const sellQuantity = parseFloat(sellAmount) || 0;
  const buyTotal = buyQuantity * currentPrice;
  const sellTotal = sellQuantity * currentPrice;

  // Handle buy
  const handleBuy = () => {
    if (buyQuantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte gib eine gültige Menge ein',
      });
      return;
    }

    if (buyTotal > cash) {
      toast({
        variant: 'destructive',
        title: 'Unzureichendes Guthaben',
        description: `Du hast nur ${formatPrice(cash)} verfügbar`,
      });
      return;
    }

    onBuy(buyQuantity, currentPrice);
    setBuyAmount('');
    toast({
      title: 'Kauf erfolgreich',
      description: `${buyQuantity.toFixed(6)} ${asset} für ${formatPrice(buyTotal)} gekauft`,
    });
  };

  // Handle sell
  const handleSell = () => {
    if (sellQuantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte gib eine gültige Menge ein',
      });
      return;
    }

    if (sellQuantity > maxSellQuantity) {
      toast({
        variant: 'destructive',
        title: 'Unzureichende Position',
        description: `Du hast nur ${maxSellQuantity.toFixed(6)} ${asset}`,
      });
      return;
    }

    onSell(sellQuantity, currentPrice);
    setSellAmount('');
    toast({
      title: 'Verkauf erfolgreich',
      description: `${sellQuantity.toFixed(6)} ${asset} für ${formatPrice(sellTotal)} verkauft`,
    });
  };

  // Quick amount buttons
  const setQuickAmount = (percentage: number, type: 'buy' | 'sell') => {
    if (type === 'buy') {
      const amount = (maxBuyQuantity * percentage).toFixed(6);
      setBuyAmount(amount);
    } else {
      const amount = (maxSellQuantity * percentage).toFixed(6);
      setSellAmount(amount);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Trade {asset}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="buy"
              className="data-[state=active]:bg-profit data-[state=active]:text-profit-foreground"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Kaufen
            </TabsTrigger>
            <TabsTrigger 
              value="sell"
              className="data-[state=active]:bg-loss data-[state=active]:text-loss-foreground"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Verkaufen
            </TabsTrigger>
          </TabsList>

          {/* Buy Tab */}
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Menge ({asset})</Label>
                <span className="text-muted-foreground">
                  Max: {maxBuyQuantity.toFixed(6)}
                </span>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="font-mono"
                step="any"
              />
              <div className="flex gap-2">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setQuickAmount(pct, 'buy')}
                  >
                    {pct * 100}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 p-3 bg-secondary/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preis</span>
                <span className="font-mono">{formatPrice(currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamt</span>
                <span className="font-mono font-semibold">{formatPrice(buyTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verfügbar</span>
                <span className={cn(
                  'font-mono',
                  buyTotal > cash && 'text-loss'
                )}>
                  {formatPrice(cash)}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-profit hover:bg-profit/90 text-profit-foreground"
              size="lg"
              onClick={handleBuy}
              disabled={buyQuantity <= 0 || buyTotal > cash}
            >
              <ArrowUpCircle className="w-5 h-5 mr-2" />
              {asset} kaufen
            </Button>
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell" className="space-y-4">
            {maxSellQuantity > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Menge ({asset})</Label>
                    <span className="text-muted-foreground">
                      Max: {maxSellQuantity.toFixed(6)}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="font-mono"
                    step="any"
                  />
                  <div className="flex gap-2">
                    {[0.25, 0.5, 0.75, 1].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setQuickAmount(pct, 'sell')}
                      >
                        {pct * 100}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preis</span>
                    <span className="font-mono">{formatPrice(currentPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gesamt</span>
                    <span className="font-mono font-semibold">{formatPrice(sellTotal)}</span>
                  </div>
                  {position && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kaufpreis (Ø)</span>
                        <span className="font-mono">{formatPrice(position.avgBuyPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">PnL</span>
                        <span className={cn(
                          'font-mono font-semibold',
                          currentPrice >= position.avgBuyPrice ? 'text-profit' : 'text-loss'
                        )}>
                          {formatPrice((currentPrice - position.avgBuyPrice) * sellQuantity)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  className="w-full bg-loss hover:bg-loss/90 text-loss-foreground"
                  size="lg"
                  onClick={handleSell}
                  disabled={sellQuantity <= 0 || sellQuantity > maxSellQuantity}
                >
                  <ArrowDownCircle className="w-5 h-5 mr-2" />
                  {asset} verkaufen
                </Button>
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Du besitzt kein {asset} zum Verkaufen
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('buy')}
                >
                  Jetzt {asset} kaufen
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
