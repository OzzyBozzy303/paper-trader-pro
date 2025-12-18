// Candlestick Chart Component

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { CandleData } from '@/types/trading';
import { formatPrice } from '@/lib/cryptoApi';

interface CandlestickChartProps {
  data: CandleData[];
  currentPrice?: number;
}

// Custom candlestick shape
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const fill = isUp ? 'hsl(142, 70%, 45%)' : 'hsl(0, 70%, 50%)';
  const stroke = fill;
  
  // Calculate positions
  const candleX = x + width / 2;
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const priceRange = props.yAxisRange || { min: low, max: high };
  const chartHeight = props.chartHeight || 300;
  
  // Scale function
  const scaleY = (price: number) => {
    const range = priceRange.max - priceRange.min;
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((price - priceRange.min) / range) * chartHeight;
  };
  
  const wickTop = scaleY(high);
  const wickBottom = scaleY(low);
  const bodyTopY = scaleY(bodyBottom);
  const bodyBottomY = scaleY(bodyTop);
  const bodyHeight = Math.max(1, bodyBottomY - bodyTopY);
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={candleX}
        y1={wickTop}
        x2={candleX}
        y2={wickBottom}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + 2}
        y={bodyTopY}
        width={Math.max(width - 4, 2)}
        height={bodyHeight}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  const isUp = data.close >= data.open;
  
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">{data.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">Open:</span>
        <span className="text-right font-mono">{formatPrice(data.open)}</span>
        <span className="text-muted-foreground">High:</span>
        <span className="text-right font-mono">{formatPrice(data.high)}</span>
        <span className="text-muted-foreground">Low:</span>
        <span className="text-right font-mono">{formatPrice(data.low)}</span>
        <span className="text-muted-foreground">Close:</span>
        <span className={`text-right font-mono ${isUp ? 'text-profit' : 'text-loss'}`}>
          {formatPrice(data.close)}
        </span>
      </div>
    </div>
  );
};

export function CandlestickChart({ data, currentPrice }: CandlestickChartProps) {
  // Calculate chart data with proper scaling
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { data: [], domain: [0, 100] };
    
    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.1;
    
    // Transform data for bar chart representation
    const transformedData = data.map((candle, index) => {
      const isUp = candle.close >= candle.open;
      return {
        ...candle,
        index,
        // For the bar, we use the body range
        barValue: Math.abs(candle.close - candle.open) || 0.01,
        barBase: Math.min(candle.open, candle.close),
        isUp,
      };
    });
    
    return {
      data: transformedData,
      domain: [min - padding, max + padding],
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Lade Chart-Daten...
      </div>
    );
  }

  const { data: transformedData, domain } = chartData;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={transformedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={domain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickFormatter={(value) => formatPrice(value).replace('$', '')}
            orientation="right"
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Current price line */}
          {currentPrice && (
            <ReferenceLine
              y={currentPrice}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
          
          {/* Candlestick bars */}
          <Bar
            dataKey="barValue"
            shape={(props: any) => {
              const { x, width, payload, background } = props;
              if (!payload) return null;
              
              const isUp = payload.close >= payload.open;
              const fill = isUp ? 'hsl(142, 70%, 45%)' : 'hsl(0, 70%, 50%)';
              
              // Calculate Y positions based on domain
              const [minDomain, maxDomain] = domain;
              const range = maxDomain - minDomain;
              const chartHeight = background?.height || 280;
              const chartY = background?.y || 10;
              
              const scaleY = (price: number) => {
                return chartY + chartHeight - ((price - minDomain) / range) * chartHeight;
              };
              
              const candleX = x + width / 2;
              const wickTop = scaleY(payload.high);
              const wickBottom = scaleY(payload.low);
              const bodyTop = scaleY(Math.max(payload.open, payload.close));
              const bodyBottom = scaleY(Math.min(payload.open, payload.close));
              const bodyHeight = Math.max(1, bodyBottom - bodyTop);
              
              return (
                <g>
                  {/* Wick */}
                  <line
                    x1={candleX}
                    y1={wickTop}
                    x2={candleX}
                    y2={wickBottom}
                    stroke={fill}
                    strokeWidth={1}
                  />
                  {/* Body */}
                  <rect
                    x={x + 2}
                    y={bodyTop}
                    width={Math.max(width - 4, 3)}
                    height={bodyHeight}
                    fill={fill}
                    rx={1}
                  />
                </g>
              );
            }}
          >
            {transformedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isUp ? 'hsl(142, 70%, 45%)' : 'hsl(0, 70%, 50%)'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
