import { TrendingUp, TrendingDown, Minus, Brain, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

interface Signal {
  id: number;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  reasoning: string;
  timestamp: string;
}

interface AISignalsPanelProps {
  signals: Signal[];
  currency?: string;
}

const AISignalsPanel = ({ signals, currency = 'MAD' }: AISignalsPanelProps) => {
  const { t } = useTranslation();

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalBadge = (type: string) => {
    switch (type) {
      case 'buy':
        return <Badge className="bg-success/20 text-success border-success/30">{t('dashboard.buy')}</Badge>;
      case 'sell':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">{t('dashboard.sell')}</Badge>;
      default:
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">{t('common.loading')}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('dashboard.aiSignals')}</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          Live
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucun signal actif</p>
          </div>
        ) : (
          signals.map((signal) => (
            <div
              key={signal.id}
              className="p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSignalIcon(signal.type)}
                  <span className="font-semibold text-foreground">{signal.symbol}</span>
                </div>
                {getSignalBadge(signal.type)}
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t('dashboard.trading.price')}</span>
                <span className="font-mono text-foreground">{formatCurrency(signal.price, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Confiance</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-foreground">{signal.confidence}%</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{signal.reasoning}</p>

              <div className="text-xs text-muted-foreground/60 mt-2">
                {new Date(signal.timestamp).toLocaleTimeString('fr-FR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AISignalsPanel;
