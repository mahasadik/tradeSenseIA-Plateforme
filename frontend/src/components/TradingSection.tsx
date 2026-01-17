import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const TradingSection = () => {
  const { t } = useTranslation();

  const getSignalAction = (type: string) => {
    if (type === 'success') return t('trading.buy');
    if (type === 'destructive') return t('trading.sell');
    return t('trading.wait');
  };

  const signals = [
    { pair: "EUR/USD", actionType: "success", confidence: 94, price: "1.0892", change: "+0.32%", type: "success" },
    { pair: "BTC/USD", actionType: "destructive", confidence: 87, price: "67,234", change: "-1.24%", type: "destructive" },
    { pair: "GOLD", actionType: "success", confidence: 91, price: "2,341", change: "+0.56%", type: "success" },
    { pair: "ETH/USD", actionType: "warning", confidence: 72, price: "3,456", change: "+0.12%", type: "warning" },
  ];

  const features = [
    {
      icon: Brain,
      title: t('trading.aiSignalsTitle'),
      description: t('trading.aiSignalsDesc')
    },
    {
      icon: Target,
      title: t('trading.tradePlansTitle'),
      description: t('trading.tradePlansDesc')
    },
    {
      icon: AlertTriangle,
      title: t('trading.riskAlertsTitle'),
      description: t('trading.riskAlertsDesc')
    },
    {
      icon: Zap,
      title: t('trading.smartFilterTitle'),
      description: t('trading.smartFilterDesc')
    },
  ];

  return (
    <section id="trading" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('trading.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t('trading.mainTitle')} <span className="text-gradient">{t('trading.mainTitleHighlight')}</span> {t('trading.mainSubtitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('trading.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Signals Panel */}
          <div className="glass rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">{t('trading.liveSignals')}</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">{t('trading.live')}</span>
              </div>
            </div>

            <div className="space-y-4">
              {signals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${signal.type === "success" ? "bg-success/20" :
                        signal.type === "destructive" ? "bg-destructive/20" : "bg-warning/20"
                      }`}>
                      {signal.type === "success" ? (
                        <TrendingUp className="w-6 h-6 text-success" />
                      ) : signal.type === "destructive" ? (
                        <TrendingDown className="w-6 h-6 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-warning" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{signal.pair}</div>
                      <div className="text-sm text-muted-foreground">${signal.price}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${signal.type === "success" ? "bg-success/20 text-success" :
                        signal.type === "destructive" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                      }`}>
                      {getSignalAction(signal.type)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('trading.confidence')}: {signal.confidence}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" className="w-full mt-6">
              Voir Tous les Signaux
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingSection;
