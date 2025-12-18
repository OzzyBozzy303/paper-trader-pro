// Speed Selector Component (for Fake Market)

import { Button } from '@/components/ui/button';
import { SpeedMode, SPEED_CONFIG } from '@/types/trading';
import { cn } from '@/lib/utils';

interface SpeedSelectorProps {
  speedMode: SpeedMode;
  onSelectSpeed: (mode: SpeedMode) => void;
  disabled?: boolean;
}

export function SpeedSelector({ speedMode, onSelectSpeed, disabled }: SpeedSelectorProps) {
  const modes: SpeedMode[] = ['fast', 'medium', 'slow'];
  
  return (
    <div className="flex gap-2">
      {modes.map((mode) => {
        const config = SPEED_CONFIG[mode];
        const isSelected = speedMode === mode;
        
        return (
          <Button
            key={mode}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 transition-all',
              isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => onSelectSpeed(mode)}
          >
            <span>{config.icon}</span>
            <span className="font-medium">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
