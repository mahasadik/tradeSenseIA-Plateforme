import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Bitcoin, Shield, ArrowLeft, Check, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { checkoutMock, fetchPlans, Plan, createPayPalPayment, getToken } from '@/lib/api';

const Checkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cmi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = getToken();
    if (!token) {
      toast.error('Veuillez vous connecter pour continuer');
      navigate('/login', { state: { returnTo: `/checkout/${planId}` } });
      return;
    }

    const loadPlans = async () => {
      try {
        const plansData = await fetchPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
        toast.error('Erreur lors du chargement des plans');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [navigate, planId]);

  const plan = plans.find((p) => p.id === Number(planId)) || plans[0];

  const handlePayment = async () => {
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setIsProcessing(true);

    try {
      // Si PayPal est sélectionné, utiliser l'API PayPal réelle
      if (paymentMethod === 'paypal') {
        const token = getToken();
        if (!token) {
          toast.error('Veuillez vous connecter');
          navigate('/login');
          return;
        }

        const returnUrl = `${window.location.origin}/checkout/paypal/success?plan_id=${plan.id}`;
        const cancelUrl = `${window.location.origin}/checkout/paypal/cancel`;

        try {
          const paypalResponse = await createPayPalPayment(plan.id, returnUrl, cancelUrl);

          // Rediriger vers PayPal pour approbation
          window.location.href = paypalResponse.approval_url;
          return;
        } catch (error: any) {
          console.error('Erreur PayPal:', error);

          // Si PayPal n'est pas configuré, utiliser le mock
          if (error.message && error.message.includes('not configured')) {
            toast.error('PayPal n\'est pas encore configuré. Utilisation du paiement de test...');
            // Continuer avec le mock
          } else {
            toast.error('Erreur lors de la création du paiement PayPal');
            setIsProcessing(false);
            return;
          }
        }
      }

      // Pour CMI et Crypto (ou PayPal en fallback), utiliser le mock
      const response = await checkoutMock(plan.id, paymentMethod);

      toast.success('Paiement réussi! Votre challenge est activé.');
      console.log('Challenge créé:', response.challenge_id);

      // Redirection vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
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
          <ThemeToggle />
        </div>
      </header>

      {loading || !plan ? (
        <main className="container py-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      ) : (
        <main className="container py-8 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux tarifs
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Récapitulatif</h2>

              <div className="p-4 rounded-xl bg-card/50 border border-border/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Challenge {plan.name}</span>
                  <span className="font-mono font-bold text-foreground">{plan.price_dh} DH</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Solde virtuel</span>
                    <span className="font-mono">${plan.starting_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Objectif de profit</span>
                    <span className="font-mono">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perte max journalière</span>
                    <span className="font-mono">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perte max totale</span>
                    <span className="font-mono">10%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-mono text-foreground">{plan.price_dh} DH</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="font-mono text-primary">{plan.price_dh} DH</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 mt-6 p-4 rounded-xl bg-success/10 border border-success/20">
                <Shield className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Paiement sécurisé</p>
                  <p className="text-xs text-muted-foreground">
                    Vos données sont protégées par un chiffrement SSL 256-bit
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Méthode de paiement</h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Payment Methods */}
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* PayPal */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <RadioGroupItem value="paypal" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center">
                          <span className="text-xs font-bold text-white">PP</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">PayPal</p>
                          <p className="text-xs text-muted-foreground">Paiement sécurisé</p>
                        </div>
                      </div>
                      <Check
                        className={`w-5 h-5 ${paymentMethod === 'paypal' ? 'text-primary' : 'text-transparent'}`}
                      />
                    </label>

                    {/* CMI (Mock) */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cmi'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <RadioGroupItem value="cmi" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">CMI (Carte bancaire)</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                        </div>
                      </div>
                      <Check
                        className={`w-5 h-5 ${paymentMethod === 'cmi' ? 'text-primary' : 'text-transparent'}`}
                      />
                    </label>

                    {/* Crypto (Mock) */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'crypto'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <RadioGroupItem value="crypto" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                          <Bitcoin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Crypto</p>
                          <p className="text-xs text-muted-foreground">Bitcoin, USDT</p>
                        </div>
                      </div>
                      <Check
                        className={`w-5 h-5 ${paymentMethod === 'crypto' ? 'text-primary' : 'text-transparent'}`}
                      />
                    </label>
                  </div>
                </RadioGroup>

                {/* Submit Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 bg-gradient-primary text-background hover:opacity-90 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      Payer {plan.price_dh} DH
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En cliquant sur "Payer", vous acceptez nos{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    conditions d'utilisation
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Checkout;
