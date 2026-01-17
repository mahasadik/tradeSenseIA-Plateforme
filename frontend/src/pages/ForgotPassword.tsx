import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    // Simulation d'envoi
    setIsSubmitted(true);
    toast.success('Email de récupération envoyé!');
    console.log('Password reset request for:', email);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            Trade<span className="text-gradient">Sense</span> AI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Mot de passe oublié?</h1>
                <p className="text-muted-foreground">
                  Entrez votre email et nous vous enverrons un lien de récupération
                </p>
              </div>

              {/* Form Card */}
              <div className="glass rounded-2xl p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 text-background font-semibold">
                    Envoyer le lien de récupération
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Email envoyé!</h1>
                <p className="text-muted-foreground mb-8">
                  Nous avons envoyé un lien de récupération à <strong className="text-foreground">{email}</strong>
                </p>

                <div className="glass rounded-2xl p-6 sm:p-8 text-left">
                  <h3 className="font-semibold text-foreground mb-4">Étapes suivantes:</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">1</span>
                      <span>Vérifiez votre boîte de réception (et les spams)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">2</span>
                      <span>Cliquez sur le lien dans l'email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">3</span>
                      <span>Créez un nouveau mot de passe sécurisé</span>
                    </li>
                  </ol>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Pas reçu l'email?{' '}
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          toast.info('Vous pouvez réessayer');
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Réessayer
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4">
        <p className="text-sm text-muted-foreground">
          © 2024 TradeSense. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
