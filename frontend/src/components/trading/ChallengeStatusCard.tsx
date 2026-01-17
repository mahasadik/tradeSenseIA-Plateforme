import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyLarge, formatCurrencyWithSign } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

interface ChallengeStatusCardProps {
  status: 'active' | 'passed' | 'failed' | 'pending';
  initialBalance: number;
  currentBalance: number;
  dailyStartBalance: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  profitTarget: number;
  currency?: string;
}

const ChallengeStatusCard = ({
  status,
  initialBalance,
  currentBalance,
  dailyStartBalance,
  maxDailyLoss,
  maxTotalLoss,
  profitTarget,
  currency = 'MAD',
}: ChallengeStatusCardProps) => {
  const { t } = useTranslation();

  const totalPnL = currentBalance - initialBalance;
  const totalPnLPercent = (totalPnL / initialBalance) * 100;
  const dailyPnL = currentBalance - dailyStartBalance;
  const dailyPnLPercent = (dailyPnL / dailyStartBalance) * 100;

  const profitProgress = Math.max(0, Math.min(100, (totalPnLPercent / profitTarget) * 100));
  const dailyLossProgress = Math.max(0, Math.min(100, (Math.abs(dailyPnLPercent) / maxDailyLoss) * 100));
  const totalLossProgress = Math.max(0, Math.min(100, (Math.abs(totalPnLPercent) / maxTotalLoss) * 100));

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/20 text-primary border-primary/30">ACTIF</Badge>;
      case 'passed':
        return <Badge className="bg-success/20 text-success border-success/30">RÉUSSI</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">ÉCHOUÉ</Badge>;
      default:
        return <Badge variant="outline">EN ATTENTE</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-8 h-8 text-success" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Target className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-foreground">{t('dashboard.myChallenge')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.realTimePerformance')}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Soldes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">{t('dashboard.initialBalance')}</p>
          <p className="text-xl font-mono font-bold text-foreground">
            {formatCurrencyLarge(initialBalance, currency)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">{t('dashboard.currentBalance')}</p>
          <p className={`text-xl font-mono font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrencyLarge(currentBalance, currency)}
          </p>
        </div>
      </div>

      {/* P&L */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50 mb-6">
        <div className="flex items-center gap-2">
          {totalPnL >= 0 ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-destructive" />
          )}
          <span className="text-muted-foreground">{t('dashboard.totalPnL')}</span>
        </div>
        <div className="text-right">
          <p className={`font-mono font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrencyWithSign(totalPnL, currency)}
          </p>
          <p className={`text-sm ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Règles */}
      <div className="space-y-4">
        {/* Objectif de profit */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">{t('dashboard.profitTarget')} ({profitTarget}%)</span>
            </div>
            <span className="font-mono text-foreground">{totalPnLPercent.toFixed(2)}%</span>
          </div>
          <Progress value={profitProgress} className="h-2 bg-muted" />
        </div>

        {/* Perte max journalière */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">{t('dashboard.maxDailyLoss')} ({maxDailyLoss}%)</span>
            </div>
            <span className={`font-mono ${dailyPnLPercent < 0 ? 'text-warning' : 'text-foreground'}`}>
              {dailyPnLPercent.toFixed(2)}%
            </span>
          </div>
          <Progress
            value={dailyLossProgress}
            className={`h-2 ${dailyLossProgress > 80 ? 'bg-destructive/20' : 'bg-muted'}`}
          />
        </div>

        {/* Perte max totale */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">{t('dashboard.maxTotalLoss')} ({maxTotalLoss}%)</span>
            </div>
            <span className={`font-mono ${totalPnLPercent < -5 ? 'text-destructive' : 'text-foreground'}`}>
              {Math.min(0, totalPnLPercent).toFixed(2)}%
            </span>
          </div>
          <Progress
            value={totalLossProgress}
            className={`h-2 ${totalLossProgress > 80 ? 'bg-destructive/20' : 'bg-muted'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengeStatusCard;
