import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketTickerProps {
  tickers: TickerData[];
  onSelect?: (symbol: string) => void;
  selectedSymbol?: string;
  currency?: string;
}

const MarketTicker = ({ tickers, onSelect, selectedSymbol, currency = 'MAD' }: MarketTickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tickers.map((ticker) => (
        <button
          key={ticker.symbol}
          onClick={() => onSelect?.(ticker.symbol)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 ${selectedSymbol === ticker.symbol
              ? 'bg-primary/10 border-primary/50'
              : 'bg-card/50 border-border/50 hover:bg-card hover:border-border'
            }`}
        >
          <div className="text-left">
            <div className="font-semibold text-foreground">{ticker.symbol}</div>
            <div className="text-xs text-muted-foreground">{ticker.name}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-semibold text-foreground">
              {formatCurrency(ticker.price, currency)}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium ${ticker.change >= 0 ? 'text-success' : 'text-destructive'
                }`}
            >
              {ticker.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {ticker.change >= 0 ? '+' : ''}
                {ticker.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MarketTicker;
