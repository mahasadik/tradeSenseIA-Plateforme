import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

interface TradeExecutionPanelProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  currency?: string;
  onTrade?: (action: 'buy' | 'sell', quantity: number, price: number) => void;
}

const TradeExecutionPanel = ({ symbol, currentPrice, balance, currency = 'MAD', onTrade }: TradeExecutionPanelProps) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('market');

  const handleTrade = (action: 'buy' | 'sell') => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    const totalCost = qty * currentPrice;
    if (action === 'buy' && totalCost > balance) {
      toast.error('Solde insuffisant pour cette opération');
      return;
    }

    onTrade?.(action, qty, currentPrice);
    toast.success(`Ordre ${action === 'buy' ? "d'achat" : 'de vente'} exécuté`);
    setQuantity('');
  };

  const totalValue = parseFloat(quantity) * currentPrice || 0;

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{symbol}</h3>
          <p className="text-2xl font-mono font-bold text-foreground">
            {formatCurrency(currentPrice, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t('dashboard.balance')}</p>
          <p className="font-mono font-semibold text-foreground">{formatCurrency(balance, currency)}</p>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="market" onClick={() => setOrderType('market')}>
            {t('dashboard.market')}
          </TabsTrigger>
          <TabsTrigger value="limit" onClick={() => setOrderType('limit')}>
            Limite
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div>
            <Label htmlFor="quantity" className="text-muted-foreground">
              {t('dashboard.quantity')}
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono mt-1"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valeur totale</span>
            <span className="font-mono text-foreground">{formatCurrency(totalValue, currency)}</span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-xs text-warning">
              Ordre au prix du marché. Exécution immédiate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleTrade('buy')}
              className="bg-success hover:bg-success/90 text-success-foreground"
              disabled={!quantity || parseFloat(quantity) <= 0}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('dashboard.buy')}
            </Button>
            <Button
              onClick={() => handleTrade('sell')}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={!quantity || parseFloat(quantity) <= 0}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              {t('dashboard.sell')}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4">
          <div>
            <Label htmlFor="limit-price" className="text-muted-foreground">
              Prix limite
            </Label>
            <Input
              id="limit-price"
              type="number"
              placeholder={currentPrice.toFixed(2)}
              className="font-mono mt-1"
            />
          </div>

          <div>
            <Label htmlFor="limit-quantity" className="text-muted-foreground">
              Quantité
            </Label>
            <Input
              id="limit-quantity"
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground"
              disabled={!quantity}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Acheter
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={!quantity}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Vendre
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradeExecutionPanel;
