import { Users, MessageCircle, Share2, Trophy, Star, ArrowRight, Medal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface LeaderboardEntry {
  rank: number;
  user_name: string;
  equity: number;
  pct: number;
  starting_equity?: number;
  user_id: number;
  status: string;
}

const CommunitySection = () => {
  const { t } = useTranslation();
  const [traders, setTraders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les vrais top traders depuis l'API
    fetch(`${API_BASE}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        // Ajouter le rang et prendre seulement les 4 premiers
        const tradersWithRank = data.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }));
        setTraders(tradersWithRank.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement leaderboard:", err);
        setLoading(false);
      });
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950";
      case 3:
        return "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400 absolute -top-1 -right-1" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600 absolute -top-1 -right-1" />;
    return null;
  };

  const maskName = (name: string) => {
    if (name.length <= 3) return name;
    return name.substring(0, 3) + '*'.repeat(Math.min(name.length - 3, 5));
  };

  const groups = [
    { name: "Crypto Hunters", members: 12453, active: true },
    { name: "Forex Masters", members: 8921, active: true },
    { name: "Day Trading Pro", members: 6782, active: false },
  ];

  return (
    <section id="community" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('community.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t('community.mainTitle')} <span className="text-gradient">{t('community.mainTitleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('community.mainSubtitle')}
          </p>
        </div>

        <div className="space-y-16"> {/*grid lg:grid-cols-2 gap-12*/}
          {/* Top Traders */}
          {/*<div>
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-warning" />
              <h3 className="text-xl font-semibold">Top Traders</h3>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                // Skeleton loading pendant le chargement
                [...Array(4)].map((_, i) => (
                  <div key={i} className="glass rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-6 bg-muted rounded w-20" />
                        <div className="h-4 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : traders.length > 0 ? (
                traders.filter(t => t && t.pct !== undefined).map((trader) => (
                  <div 
                    key={trader.rank}
                    className="glass rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getMedalColor(trader.rank)}`}>
                        #{trader.rank}
                      </div>
                      {getRankBadge(trader.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-lg flex items-center gap-2">
                          {maskName(trader.user_name || `Trader #${trader.rank}`)}
                        {trader.rank <= 3 && (
                          <Trophy className="w-4 h-4 text-warning" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('community.capital')}: ${(trader.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold flex items-center gap-1 ${(trader.pct || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        <TrendingUp className="w-5 h-5" />
                        {(trader.pct || 0) >= 0 ? '+' : ''}{(trader.pct || 0).toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{t('community.performance')}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass rounded-xl">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('community.noTraders')}</p>
                </div>
              )}
            </div>
          </div>*/}

          {/* Groups & Features */}
          <div className="space-y-8">
            {/* Groups */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">{t('community.popularGroups')}</h3>
              </div>

              <div className="space-y-3">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="glass rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-primary transition-colors">{group.name}</div>
                        <div className="text-sm text-muted-foreground">{group.members.toLocaleString()} {t('community.members')}</div>
                      </div>
                    </div>
                    {group.active && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-muted-foreground">{t('community.active')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Community Features */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold mb-4">{t('community.communityFeatures')}</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: MessageCircle, label: t('community.liveChat') },
                  { icon: Share2, label: t('community.shareStrategies') },
                  { icon: Trophy, label: t('community.competitions') },
                  { icon: Star, label: t('community.expertMentoring') },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <feature.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="hero" className="w-1/2 mx-auto flex items-center gap-2">
              {t('community.joinCommunity')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
