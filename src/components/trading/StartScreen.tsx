// Start Screen - Initial capital input

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface StartScreenProps {
  onStart: (capital: number) => void;
}

const PRESET_AMOUNTS = [10000, 50000, 100000, 500000];

export function StartScreen({ onStart }: StartScreenProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');

  const handlePresetClick = (amount: number) => {
    onStart(amount);
  };

  const handleCustomStart = () => {
    const amount = parseFloat(customAmount.replace(/,/g, ''));
    
    if (isNaN(amount) || amount <= 0) {
      setError('Bitte gib einen gültigen Betrag ein');
      return;
    }
    
    if (amount < 100) {
      setError('Mindestbetrag: $100');
      return;
    }
    
    if (amount > 10000000) {
      setError('Maximalbetrag: $10,000,000');
      return;
    }
    
    onStart(amount);
  };

  const formatInputValue = (value: string) => {
    // Remove non-numeric characters except dots
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Prevent multiple dots
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Paper Trading Simulator
          </h1>
          <p className="text-muted-foreground">
            Übe Trading ohne echtes Geld zu riskieren
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5 text-profit" />
              Startkapital wählen
            </CardTitle>
            <CardDescription>
              Wähle einen Betrag oder gib einen eigenen ein
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Preset Amounts */}
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant="secondary"
                  className="h-14 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handlePresetClick(amount)}
                >
                  ${amount.toLocaleString()}
                </Button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  oder
                </span>
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Eigenen Betrag eingeben"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(formatInputValue(e.target.value));
                    setError('');
                  }}
                  className="pl-10 h-14 text-lg bg-secondary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomStart();
                    }
                  }}
                />
              </div>
              
              {error && (
                <p className="text-sm text-loss animate-fade-in">{error}</p>
              )}
              
              <Button 
                className="w-full h-12 text-base font-semibold"
                onClick={handleCustomStart}
                disabled={!customAmount}
              >
                Trading starten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Live Charts</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
              <TrendingUp className="w-5 h-5 text-profit" />
            </div>
            <p className="text-xs text-muted-foreground">Echte Kurse</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground">Kein Risiko</p>
          </div>
        </div>
      </div>
    </div>
  );
}
