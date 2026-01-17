import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowUpCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { upgradeChallenge, fetchPlans, type Plan, type UserChallenge } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface UpgradeChallengeDialogProps {
  challenge: UserChallenge;
  currentPlanId: number;
  onUpgradeSuccess: () => void;
}

export default function UpgradeChallengeDialog({
  challenge,
  currentPlanId,
  onUpgradeSuccess
}: UpgradeChallengeDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const loadPlans = async () => {
    try {
      const allPlans = await fetchPlans();
      // Filtrer pour afficher seulement les plans supérieurs
      const currentPlan = allPlans.find(p => p.id === currentPlanId);
      const upgradePlans = allPlans.filter(p => p.price_dh > (currentPlan?.price_dh || 0));
      setPlans(upgradePlans);
    } catch (error) {
      toast.error('Erreur lors du chargement des plans');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadPlans();
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlanId) {
      toast.error(t('dashboard.upgradeDialog.selectPlan'));
      return;
    }

    setLoading(true);
    try {
      await upgradeChallenge(challenge.id, selectedPlanId);
      toast.success(t('dashboard.upgradeDialog.success'));
      setOpen(false);
      onUpgradeSuccess();
    } catch (error: any) {
      const errorMsg = error?.data?.error || t('dashboard.upgradeDialog.error');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (challenge.status !== 'active') {
    return null; // Ne pas afficher le bouton pour les challenges non actifs
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpCircle className="w-4 h-4" />
          {t('dashboard.upgrade')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('dashboard.upgradeDialog.title')}</DialogTitle>
          <DialogDescription>
            Passez à un plan supérieur pour augmenter votre capital de trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Challenge actuel */}
          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">{t('dashboard.upgradeDialog.currentPlan')}</p>
            <p className="font-semibold">{challenge.plan_name}</p>
            <p className="text-sm">Capital: {challenge.starting_balance.toLocaleString()} DH</p>
            <p className="text-sm">Equity: {challenge.equity.toLocaleString()} DH</p>
          </div>

          {/* Plans disponibles */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('dashboard.upgradeDialog.selectNewPlan')} :</p>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Vous êtes déjà au plan maximum ! 🎉
              </p>
            ) : (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-all hover:border-primary ${selectedPlanId === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {selectedPlanId === plan.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Capital de départ: {plan.starting_balance.toLocaleString()} DH
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Votre profit actuel sera conservé
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{plan.price_dh} DH</p>
                      <p className="text-xs text-muted-foreground">Frais d'upgrade</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Boutons d'action */}
          {plans.length > 0 && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1"
                disabled={!selectedPlanId || loading}
              >
                {loading ? t('common.loading') : t('dashboard.upgradeDialog.upgrade')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
