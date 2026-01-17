import { Newspaper, Clock, TrendingUp, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const NewsSection = () => {
  const { t } = useTranslation();
  const news = [
    {
      category: "Crypto",
      title: "Bitcoin atteint un nouveau sommet historique après l'approbation des ETF",
      time: "Il y a 2h",
      impact: "high",
    },
    {
      category: "Forex",
      title: "La Fed maintient ses taux, le dollar s'affaiblit face à l'euro",
      time: "Il y a 4h",
      impact: "medium",
    },
    {
      category: "Actions",
      title: "Apple annonce des résultats supérieurs aux attentes du marché",
      time: "Il y a 6h",
      impact: "high",
    },
    {
      category: "Commodités",
      title: "Le pétrole en hausse suite aux tensions au Moyen-Orient",
      time: "Il y a 8h",
      impact: "medium",
    },
  ];

  const aiSummary = {
    sentiment: "Haussier",
    confidence: 78,
    keyPoints: [
      "Les marchés crypto montrent une forte dynamique haussière",
      "Le dollar reste sous pression face aux principales devises",
      "Les indices boursiers américains atteignent de nouveaux records"
    ]
  };

  return (
    <section id="news" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Newspaper className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('news.title')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Restez <span className="text-gradient">Informé</span> en Temps Réel
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('news.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AI Summary Card */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 shadow-card sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Résumé IA</h3>
                  <p className="text-xs text-muted-foreground">Mis à jour il y a 5 min</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Sentiment Global</span>
                  <span className="text-success font-semibold">{aiSummary.sentiment}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${aiSummary.confidence}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  Confiance: {aiSummary.confidence}%
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Points Clés</h4>
                {aiSummary.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-foreground/80">{point}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-6">
                Analyse Complète
              </Button>
            </div>
          </div>

          {/* News Feed */}
          <div className="lg:col-span-2 space-y-4">
            {news.map((item, index) => (
              <article
                key={index}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.category === "Crypto" ? "bg-primary/20 text-primary" :
                          item.category === "Forex" ? "bg-success/20 text-success" :
                            item.category === "Actions" ? "bg-warning/20 text-warning" :
                              "bg-destructive/20 text-destructive"
                        }`}>
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{item.time}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${item.impact === "high" ? "bg-success animate-pulse" : "bg-warning"
                    }`} />
                </div>
              </article>
            ))}

            <Button variant="glass" className="w-full">
              <Globe className="w-4 h-4" />
              Voir Plus d'Actualités
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
