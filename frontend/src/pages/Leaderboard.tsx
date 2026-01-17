import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award, TrendingUp, Users, Target, Crown, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { fetchLeaderboard, LeaderboardEntry } from '@/lib/api';
import { toast } from 'sonner';

interface LeaderboardDisplay {
  rank: number;
  name: string;
  profit: number;
  status: string;
  equity: number;
}

const stats = [
  { label: 'Traders actifs', value: '1,234', icon: Users },
  { label: 'Challenges réussis', value: '456', icon: Target },
  { label: 'Taux de réussite', value: '23%', icon: TrendingUp },
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        const formatted = data.map((entry: LeaderboardEntry, index: number) => ({
          rank: index + 1,
          name: entry.user_name || `User #${entry.user_id}`,
          profit: parseFloat(entry.pct.toFixed(2)),
          status: entry.status,
          equity: entry.equity,
        }));
        setLeaderboard(formatted);
      } catch (error) {
        console.error('Erreur lors du chargement du leaderboard:', error);
        toast.error('Impossible de charger le classement');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Top <span className="text-gradient">Traders</span> du Mois
          </h1>
          <p className="text-lg text-muted-foreground">
            Découvrez les meilleurs traders de notre communauté
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
              <div className="col-span-1">Rang</div>
              <div className="col-span-5">Trader</div>
              <div className="col-span-3 text-right">Profit %</div>
              <div className="col-span-3 text-right">Statut</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border/50">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Aucun trader dans le classement</p>
                </div>
              ) : (
                leaderboard.map((trader) => (
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
                            {trader.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-semibold text-foreground">{trader.name}</span>
                        {trader.rank <= 3 && (
                          <Badge variant="outline" className="text-xs">
                            Top 3
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`font-mono font-bold ${trader.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {trader.profit >= 0 ? '+' : ''}{trader.profit}%
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      <Badge variant={trader.status === 'PASSED' ? 'default' : 'outline'}>
                        {trader.status}
                      </Badge>
                    </div>
                  </div>
                )))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Prêt à rejoindre le classement?
          </p>
          <Link to="/pricing">
            <Button className="bg-gradient-primary text-background hover:opacity-90">
              Commencer un Challenge
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 TradeSense. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
