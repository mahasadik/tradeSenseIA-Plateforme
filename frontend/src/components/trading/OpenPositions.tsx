import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

interface Position {
  id: number;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}

interface OpenPositionsProps {
  positions: Position[];
  currency?: string;
  onClosePosition?: (id: number, exitPrice: number) => void;
}

const OpenPositions = ({ positions, currency = 'MAD', onClosePosition }: OpenPositionsProps) => {
  const { t } = useTranslation();

  const calculatePnL = (position: Position) => {
    const multiplier = position.action === 'buy' ? 1 : -1;
    return (position.currentPrice - position.entryPrice) * position.quantity * multiplier;
  };

  const handleClose = (position: Position) => {
    onClosePosition?.(position.id, position.currentPrice);
    toast.success(`Position ${position.symbol} fermée`);
  };

  if (positions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{t('dashboard.activePositions')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {positions.map((position) => {
        const pnl = calculatePnL(position);
        const pnlPercent = ((pnl / (position.entryPrice * position.quantity)) * 100);

        return (
          <div key={position.id} className="p-3 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {position.action === 'buy' ? (
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-success" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  </div>
                )}
                <div>
                  <span className="font-semibold text-foreground">{position.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {position.action === 'buy' ? 'LONG' : 'SHORT'}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleClose(position)}
                className="h-8 px-3 text-xs"
              >
                {t('common.close')}
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Qté</span>
                <p className="font-mono text-foreground">{position.quantity}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entrée</span>
                <p className="font-mono text-foreground">{formatCurrency(position.entryPrice, currency)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Actuel</span>
                <p className="font-mono text-foreground">{formatCurrency(position.currentPrice, currency)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">P&L</span>
                <p className={`font-mono font-semibold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrencyWithSign(pnl, currency)}
                  <span className="text-[10px] ml-1">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OpenPositions;
