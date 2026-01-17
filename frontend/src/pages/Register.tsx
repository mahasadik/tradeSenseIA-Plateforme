import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { register as apiRegister, login as apiLogin, setToken } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

const Register = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.invalidCredentials'));
      return;
    }
    if (!formData.acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    // call backend register -> then auto-login
    setLoading(true);
    (async () => {
      try {
        await apiRegister(formData.email, formData.password, formData.firstName, formData.lastName);
        toast.success(t('auth.registerSuccess'));
        // auto-login
        const res = await apiLogin(formData.email, formData.password);
        if (res && (res as any).access_token) {
          setToken((res as any).access_token, true);
          navigate('/dashboard');
        } else {
          toast.success(t('auth.registerSuccess'));
          navigate('/login');
        }
      } catch (err: any) {
        // backend returns { error: '...' } on failure
        const msg = err?.data?.error || err?.data || err?.message || t('common.error');
        toast.error(String(msg));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
        <div className="flex gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.createAccount')}</h1>
            <p className="text-muted-foreground">
              {t('auth.joinUs')}
            </p>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('auth.firstName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('auth.lastName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+212 6XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  J'accepte les{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t('footer.terms')}
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    {t('footer.privacy')}
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 text-background font-semibold" disabled={loading}>
                {loading ? t('common.loading') : t('auth.createAccount')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4">
        <p className="text-sm text-muted-foreground">
          {t('footer.copyright')}
        </p>
      </footer>
    </div>
  );
};

export default Register;
