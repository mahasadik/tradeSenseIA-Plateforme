import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Zap, Mail, Lock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { login as apiLogin, setToken, clearToken, setUserEmail, setUserName, User } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "@/components/LanguageSelector";

type LoginResponse = { access_token: string; user: User };
type ApiErrorShape = { status: number; data: unknown };

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Clear any existing token before login
    clearToken();

    try {
      const res = await apiLogin(email, password) as LoginResponse;
      if (res && res.access_token) {
        setToken(res.access_token, rememberMe);
        console.log('[LOGIN] New token saved:', res.access_token.substring(0, 20) + '...');

        // Sauvegarder l'email et le nom de l'utilisateur
        setUserEmail(email);
        if (res.user) {
          setUserName(res.user.first_name || null, res.user.last_name || null);
          console.log('[LOGIN] User info saved:', res.user.first_name, res.user.last_name);
        }

        // Rediriger vers la page de retour ou dashboard
        const returnTo = (location.state as any)?.returnTo || "/dashboard";
        navigate(returnTo);
      } else {
        setError("Token non reçu depuis le serveur");
      }
    } catch (err: unknown) {
      const maybe = err as ApiErrorShape;
      const msg = (maybe && typeof maybe.data === 'object' && maybe.data && (maybe.data as any).error)
        ? (maybe.data as any).error
        : (maybe && (maybe.data as string)) || "Échec de connexion";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-success/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
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

      {/* Login Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('auth.welcomeBack')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('auth.signIn')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary"
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    {t('auth.rememberMe')}
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Submit */}
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.signIn')}
              </Button>

              {error && <div className="text-sm text-destructive text-center">{String(error)}</div>}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou continuer avec</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" className="w-full">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                {/*  <Button type="button" variant="outline" className="w-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>*/}
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-muted-foreground">
        {t('footer.copyright')}
      </footer>
    </div>
  );
};

export default Login;
