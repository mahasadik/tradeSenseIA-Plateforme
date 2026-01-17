import { Trophy, TrendingUp, ArrowRight, Medal, Award, Users, Target, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const LeaderboardPreview = () => {
    const { t } = useTranslation();
    const [traders, setTraders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const stats = [
        { label: t('leaderboard.stats.users'), value: '1,234', icon: Users },
        { label: t('leaderboard.stats.challenges'), value: '456', icon: Target },
        { label: t('leaderboard.stats.successRate'), value: '23%', icon: TrendingUp },
    ];

    useEffect(() => {
        fetch(`${API_BASE}/api/leaderboard`)
            .then((res) => res.json())
            .then((data) => {
                // Ajouter le rang
                const tradersWithRank = data.map((entry: any, index: number) => ({
                    ...entry,
                    rank: index + 1
                }));
                setTraders(tradersWithRank);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement leaderboard:", err);
                setLoading(false);
            });
    }, []);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-400" />;
            case 3:
                return <Award className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-500/10 border-yellow-500/30';
            case 2:
                return 'bg-gray-400/10 border-gray-400/30';
            case 3:
                return 'bg-amber-600/10 border-amber-600/30';
            default:
                return 'bg-card/50 border-border/50';
        }
    };

    const maskName = (name: string) => {
        if (name.length <= 3) return name;
        return name.substring(0, 3) + '*'.repeat(Math.min(name.length - 3, 5));
    };

    return (
        <section id="leaderboard" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-20" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Crown className="w-4 h-4 text-warning" />
                        <span className="text-sm text-muted-foreground">{t('leaderboard.title')}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Top <span className="text-gradient">{t('leaderboard.trader')}</span> du Mois
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Découvrez les performances réelles de nos traders les plus performants
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="glass rounded-xl p-6 text-center">
                                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Leaderboard Table */}
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-card/50 text-sm font-medium text-muted-foreground">
                            <div className="col-span-1">{t('leaderboard.rank')}</div>
                            <div className="col-span-5">{t('leaderboard.trader')}</div>
                            <div className="col-span-3 text-right">Profit %</div>
                            <div className="col-span-3 text-right">Statut</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-border/50">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : traders.length === 0 ? (
                                <div className="text-center py-20">
                                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Aucun trader dans le classement</p>
                                </div>
                            ) : (
                                traders.map((trader) => (
                                    <div
                                        key={trader.rank}
                                        className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-card/50 ${getRankBg(trader.rank)} border-l-4`}
                                    >
                                        <div className="col-span-1">
                                            {getRankIcon(trader.rank)}
                                        </div>
                                        <div className="col-span-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                                    <span className="text-background font-bold">
                                                        {trader.user_name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-foreground">{maskName(trader.user_name)}</span>
                                                {trader.rank <= 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Top 3
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <span className={`font-mono font-bold ${trader.pct >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {trader.pct >= 0 ? '+' : ''}{trader.pct.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <Badge variant={trader.status === 'PASSED' ? 'default' : 'outline'}>
                                                {trader.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <p className="text-muted-foreground mb-4">
                            {t('leaderboard.joinChallenge')}
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-primary text-background hover:opacity-90"
                            onClick={() => navigate("/pricing")}
                        >
                            {t('leaderboard.joinChallenge')}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeaderboardPreview;
