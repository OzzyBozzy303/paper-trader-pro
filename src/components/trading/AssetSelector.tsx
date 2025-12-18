// Asset Selector Component

import { Button } from '@/components/ui/button';
import { AssetType, ASSETS } from '@/types/trading';
import { cn } from '@/lib/utils';

interface AssetSelectorProps {
  selectedAsset: AssetType;
  onSelectAsset: (asset: AssetType) => void;
}

// Asset icons/colors
const ASSET_CONFIG: Record<AssetType, { icon: string; color: string }> = {
  BTC: { icon: '₿', color: 'text-orange-500' },
  ETH: { icon: 'Ξ', color: 'text-blue-400' },
  SOL: { icon: '◎', color: 'text-purple-400' },
  FAKE: { icon: '🎮', color: 'text-green-400' },
};

export function AssetSelector({ selectedAsset, onSelectAsset }: AssetSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ASSETS.map((asset) => {
        const config = ASSET_CONFIG[asset.id];
        const isSelected = selectedAsset === asset.id;
        
        return (
          <Button
            key={asset.id}
            variant={isSelected ? 'default' : 'secondary'}
            size="sm"
            className={cn(
              'flex items-center gap-2 transition-all',
              isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
            onClick={() => onSelectAsset(asset.id)}
          >
            <span className={cn('text-lg', !isSelected && config.color)}>
              {config.icon}
            </span>
            <span className="font-medium">{asset.symbol}</span>
            {asset.isFake && (
              <span className="text-xs opacity-70">(Sim)</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
