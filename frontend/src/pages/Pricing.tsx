import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { fetchPlans, Plan as ApiPlan } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

interface Plan {
  id: number;
  name: string;
  price: number;
  balance: number;
  icon: React.ElementType;
  features: string[];
  popular?: boolean;
}

const getIconForPlan = (name: string): React.ElementType => {
  if (name.toLowerCase().includes('starter')) return Zap;
  if (name.toLowerCase().includes('pro')) return Crown;
  if (name.toLowerCase().includes('elite')) return Rocket;
  return Zap;
};

const getFeaturesForPlan = (name: string, balance: number): string[] => {
  const baseFeatures = [
    `Solde virtuel de ${balance.toLocaleString()}$`,
    'Objectif de profit: 10%',
    'Perte max journalière: 5%',
    'Perte max totale: 10%',
  ];

  if (name.toLowerCase().includes('starter')) {
    return [...baseFeatures, 'Durée: 30 jours', 'Support par email'];
  } else if (name.toLowerCase().includes('pro')) {
    return [...baseFeatures, 'Durée: 45 jours', 'Signaux IA premium', 'Support prioritaire'];
  } else if (name.toLowerCase().includes('elite')) {
    return [...baseFeatures, 'Durée: 60 jours', 'Signaux IA premium', 'Coaching personnalisé', 'Support VIP 24/7'];
  }
  return baseFeatures;
};

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const apiPlans = await fetchPlans();
        const formattedPlans: Plan[] = apiPlans.map((p: ApiPlan) => ({
          id: p.id,
          name: p.name,
          price: p.price_dh,
          balance: p.starting_balance,
          icon: getIconForPlan(p.name),
          features: getFeaturesForPlan(p.name, p.starting_balance),
          popular: p.name.toLowerCase().includes('pro'),
        }));
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
        toast.error('Impossible de charger les plans');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    toast.success('Plan sélectionné! Redirection vers le paiement...');
    navigate(`/checkout/${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Trade<span className="text-gradient">Sense</span> AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline">{t('auth.signIn')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            {t('pricing.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('pricing.challengeTitle')} <span className="text-gradient">{t('pricing.challengeTitleHighlight')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.challengeSubtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-3 text-center py-20">
              <p className="text-muted-foreground">{t('pricing.noPlans')}</p>
            </div>
          ) : (
            plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative glass rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${plan.popular ? 'ring-2 ring-primary' : ''
                    }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-background">
                      {t('pricing.popular')}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-gradient-primary' : 'bg-primary/10'
                      }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-background' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{t('pricing.challenge')}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-lg text-muted-foreground">DH</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('pricing.balance')}: ${plan.balance.toLocaleString()}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${plan.popular
                      ? 'bg-gradient-primary text-background hover:opacity-90'
                      : 'bg-card hover:bg-card/80'
                      }`}
                  >
                    {t('pricing.startChallenge')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              );
            }))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            {t('pricing.faq.title')}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: t('pricing.faq.q1'),
                a: t('pricing.faq.a1'),
              },
              {
                q: t('pricing.faq.q2'),
                a: t('pricing.faq.a2'),
              },
              {
                q: t('pricing.faq.q3'),
                a: t('pricing.faq.a3'),
              },
            ].map((faq, index) => (
              <div key={index} className="glass rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 TradeSense. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
