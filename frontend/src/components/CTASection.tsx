import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-success/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('cta.title')}{" "}
            <span className="text-gradient">{t('cta.titleHighlight')}</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            {t('cta.subtitle')}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { icon: Zap, text: t('cta.aiAdvanced') },
              { icon: Shield, text: t('cta.secure') },
              { icon: TrendingUp, text: t('cta.profitable') },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate("/pricing")}
            >
              {t('cta.startFree')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://calendly.com/tradesense-ai/demo', '_blank')}
            >
              {t('cta.scheduleDemo')}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Aucune carte de crédit requise • Accès instantané • Support 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
