import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('hero.badge')}</span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate("/pricing")}
            >
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://calendly.com/tradesense-ai/demo', '_blank')}
            >
              {t('hero.demo')}
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: "98%", label: "Précision IA" },
              { value: "50K+", label: "Traders Actifs" },
              { value: "24/7", label: "Signaux en Direct" },
              { value: "150+", label: "Cours Premium" },
            ].map((stat, index) => (
              <div key={index} className="glass rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Feature Cards */}
        <div className="absolute left-4 top-1/3 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-sm font-semibold">BTC/USD</div>
              <div className="text-xs text-success">+5.23%</div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 hidden lg:block animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Protection IA</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
