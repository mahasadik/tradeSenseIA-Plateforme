import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Time } from 'lightweight-charts';
import { Bell, Settings, LogOut, Menu, X, RefreshCw, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import TradingChart from '@/components/trading/TradingChart';
import MarketTicker from '@/components/trading/MarketTicker';
import AISignalsPanel from '@/components/trading/AISignalsPanel';
import TradeExecutionPanel from '@/components/trading/TradeExecutionPanel';
import ChallengeStatusCard from '@/components/trading/ChallengeStatusCard';
import OpenPositions from '@/components/trading/OpenPositions';
import UpgradeChallengeDialog from '@/components/trading/UpgradeChallengeDialog';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import {
  fetchUserChallenges,
  fetchTrades,
  fetchPriceHistory,
  fetchSignals,
  fetchCurrentPrice,
  fetchUserProfile,
  openTrade,
  closeTrade,
  getToken,
  clearToken,
  getUserEmail,
  getUserName,
  UserChallenge,
  Trade as ApiTrade
} from '@/lib/api';
import { toast } from 'sonner';

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Signal {
  id: number;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  reasoning: string;
  timestamp: string;
}

interface Position {
  id: number;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}

const defaultTickers: Ticker[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 0, change: 0, changePercent: 0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0 },
  { symbol: 'IAM', name: 'Maroc Telecom', price: 0, change: 0, changePercent: 0 },
  { symbol: 'ATW', name: 'Attijariwafa Bank', price: 0, change: 0, changePercent: 0 },
  { symbol: 'BCP', name: 'Banque Centrale Populaire', price: 0, change: 0, changePercent: 0 },
];

// BVC Symbols (Moroccan stocks) - déclaration unique
const BVC_SYMBOLS = ['IAM', 'ATW', 'BCP', 'GAZ', 'CIH', 'CDM', 'LBL', 'MNG', 'SNI', 'TQM'];

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [chartData, setChartData] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for API data
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<UserChallenge | null>(null);
  const [trades, setTrades] = useState<ApiTrade[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>(defaultTickers);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [symbolPrices, setSymbolPrices] = useState<Record<string, number>>({});
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userCurrency, setUserCurrency] = useState<string>('MAD');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const email = getUserEmail();
    if (email) setUserEmail(email);

    const { firstName, lastName } = getUserName();
    if (firstName || lastName) {
      setUserName([firstName, lastName].filter(Boolean).join(' '));
      console.log('User name set to:', [firstName, lastName].filter(Boolean).join(' '));
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error('Veuillez vous connecter');
      navigate('/login');
      return;
    }
    console.log('Token found, loading dashboard data...');
    loadUserProfile();
    loadDashboardData();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      setUserCurrency(profile.currency || 'USD');
      setUserRole(profile.role || 'user');
    } catch (error: any) {
      console.error('Erreur chargement profil:', error);
      if (error?.status === 401) {
        clearToken();
        toast.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      setUserCurrency('USD');
    }
  };

  useEffect(() => {
    if (selectedSymbol) {
      loadChartData(selectedSymbol);
      loadSignals(selectedSymbol);
      loadCurrentPrice(selectedSymbol);

      // Rafraîchir automatiquement le chart toutes les 10 secondes
      const interval = setInterval(() => {
        loadChartData(selectedSymbol);
        loadCurrentPrice(selectedSymbol);
        loadSignals(selectedSymbol);
        loadPositionPrices(trades);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedSymbol, trades]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Fetching user challenges...');
      // Load challenges
      const challengesData = await fetchUserChallenges();
      console.log('Challenges loaded:', challengesData);
      setChallenges(challengesData);

      // Set active challenge
      const activeChallenge = challengesData.find(ch => ch.status === 'active') || challengesData[0];
      setCurrentChallenge(activeChallenge || null);

      // Load trades for active challenge
      if (activeChallenge) {
        const tradesData = await fetchTrades(activeChallenge.id);
        setTrades(tradesData);

        // Charger les prix pour toutes les positions ouvertes
        await loadPositionPrices(tradesData);
      }

      // Load ticker prices
      await loadTickerPrices();
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      if (error?.status === 401) {
        clearToken();
        toast.error('Session expirée, veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadTickerPrices = async () => {
    const updatedTickers = await Promise.all(
      defaultTickers.map(async (ticker) => {
        try {
          const data = await fetchCurrentPrice(ticker.symbol);
          console.log(`Prix chargé pour ${ticker.symbol}:`, data.price);
          return { ...ticker, price: data.price, change: 0, changePercent: 0 };
        } catch (error) {
          console.error(`Erreur chargement prix ${ticker.symbol}:`, error);
          return ticker;
        }
      })
    );
    setTickers(updatedTickers);
  };

  const loadPositionPrices = async (tradesData: ApiTrade[]) => {
    const openTrades = tradesData.filter(t => t.status === 'OPEN');
    const uniqueSymbols = [...new Set(openTrades.map(t => t.symbol))];

    const prices: Record<string, number> = {};
    await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        try {
          const data = await fetchCurrentPrice(symbol);
          prices[symbol] = data.price;
        } catch (error) {
          console.error(`Erreur chargement prix pour ${symbol}:`, error);
        }
      })
    );

    setSymbolPrices(prices);
  };

  const loadChartData = async (symbol: string) => {
    try {
      // Vérifier si c'est un symbole BVC (pas d'historique disponible)
      if (BVC_SYMBOLS.includes(symbol.toUpperCase())) {
        console.log(`Symbole BVC ${symbol}: génération historique simulé réaliste`);
        // Générer un historique simulé avec le prix actuel
        const currentData = await fetchCurrentPrice(symbol);
        const basePrice = currentData.price;
        const now = Math.floor(Date.now() / 1000);
        const simulatedData = [];

        // Générer 100 points (8h20min d'historique avec intervalles de 5 min)
        let previousClose = basePrice * 0.98; // Commencer légèrement en dessous

        for (let i = 99; i >= 0; i--) {
          const timeOffset = i * 5 * 60; // 5 minutes par point

          // Tendance progressive vers le prix actuel
          const targetPrice = i === 0 ? basePrice : previousClose + (basePrice - previousClose) / (i + 1);

          // Variation intraday réaliste (±0.5%)
          const randomWalk = (Math.random() - 0.5) * 0.01 * basePrice;
          const close = targetPrice + randomWalk;

          // Calculer OHLC cohérent
          const volatility = basePrice * 0.003; // 0.3% de volatilité par bougie
          const high = close + Math.random() * volatility;
          const low = close - Math.random() * volatility;
          const open = previousClose;

          simulatedData.push({
            time: (now - timeOffset) as Time,
            open: Math.max(low, Math.min(high, open)),
            high: Math.max(open, close, high),
            low: Math.min(open, close, low),
            close: close,
          });

          previousClose = close;
        }

        setChartData(simulatedData);
        return;
      }

      const data = await fetchPriceHistory(symbol, '1d', '5m', 100);
      const formattedData = data.points.map(point => ({
        time: point.time as Time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error('Erreur chargement graphique:', error);
      setChartData([]);
    }
  };

  const loadSignals = async (symbol: string) => {
    try {
      // Vérifier si c'est un symbole BVC (pas de signaux IA disponibles)
      if (BVC_SYMBOLS.includes(symbol.toUpperCase())) {
        console.log(`Symbole BVC ${symbol}: signaux IA non disponibles`);
        const currentData = await fetchCurrentPrice(symbol);
        const signal: Signal = {
          id: Date.now(),
          symbol: symbol,
          type: 'hold',
          confidence: 50,
          price: currentData.price,
          reasoning: 'Analyse IA non disponible pour les actions BVC',
          timestamp: new Date().toISOString(),
        };
        setSignals([signal]);
        return;
      }

      const data = await fetchSignals(symbol);
      const signal: Signal = {
        id: Date.now(),
        symbol: data.symbol,
        type: data.signal === 'BUY' ? 'buy' : data.signal === 'SELL' ? 'sell' : 'hold',
        confidence: 75,
        price: data.last_price,
        reasoning: `SMA ${data.fast_sma.toFixed(2)} vs ${data.slow_sma.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      };
      setSignals([signal]);
    } catch (error) {
      console.error('Erreur chargement signaux:', error);
      setSignals([]);
    }
  };

  const loadCurrentPrice = async (symbol: string) => {
    try {
      const data = await fetchCurrentPrice(symbol);
      setCurrentPrice(data.price);
    } catch (error) {
      console.error('Erreur chargement prix:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      loadDashboardData(),
      loadChartData(selectedSymbol),
      loadSignals(selectedSymbol),
      loadPositionPrices(trades),
    ]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 1000);
    });
  };

  const handleTrade = async (action: 'buy' | 'sell', quantity: number, price: number) => {
    if (!currentChallenge) {
      toast.error('Aucun challenge actif');
      return;
    }

    try {
      const side = action.toUpperCase();
      const result = await openTrade(currentChallenge.id, selectedSymbol, side, quantity);

      toast.success(`Trade ${action === 'buy' ? 'achat' : 'vente'} exécuté avec succès!`);
      console.log('Trade créé:', result.trade_id, 'Prix:', result.entry_price);

      // Recharger les trades et le challenge
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors du trade:', error);
      toast.error('Erreur lors de l\'exécution du trade');
    }
  };

  const handleClosePosition = async (tradeId: number, exitPrice: number) => {
    try {
      const result = await closeTrade(tradeId);

      toast.success(`Position fermée! P&L: ${result.pnl >= 0 ? '+' : ''}${result.pnl.toFixed(2)}`);
      console.log('Trade fermé:', result.trade_id, 'Prix de sortie:', result.exit_price, 'P&L:', result.pnl);

      // Recharger les trades et le challenge
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      toast.error('Erreur lors de la fermeture de la position');
    }
  };

  const handleLogout = () => {
    clearToken();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const currentTicker = tickers.find(t => t.symbol === selectedSymbol) || tickers[0];
  const openPositions: Position[] = trades
    .filter(t => t.status === 'OPEN')
    .map(t => ({
      id: t.id,
      symbol: t.symbol,
      action: t.side.toLowerCase() as 'buy' | 'sell',
      quantity: t.qty,
      entryPrice: t.entry_price,
      currentPrice: symbolPrices[t.symbol] || t.entry_price,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold hidden sm:block">
                Trade<span className="text-gradient">Sense</span> AI
              </span>
            </Link>
          </div>

          {(userName || userEmail) && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('dashboard.welcome')},</span>
              <span className="font-semibold text-foreground">
                {userName || userEmail.split('@')[0]}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className={isRefreshing ? 'animate-spin' : ''}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <LanguageSelector />
            <ThemeToggle />
            {userRole === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            {userRole === 'superadmin' && (
              <Link to="/superadmin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">SuperAdmin</span>
                </Button>
              </Link>
            )}
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - AI Signals */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-80 border-r border-border bg-background transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          <div className="h-full flex flex-col">
            <AISignalsPanel signals={signals} currency={userCurrency} />
            {currentChallenge && (
              <TradeExecutionPanel
                symbol={selectedSymbol}
                currentPrice={currentPrice || currentTicker.price}
                balance={currentChallenge.equity}
                currency={userCurrency}
                onTrade={handleTrade}
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
          {/* Market Tickers */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Marchés en direct</h2>
            <MarketTicker
              tickers={tickers}
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
              currency={userCurrency}
            />
          </div>

          {/* Chart */}
          <div className="glass rounded-xl overflow-hidden">
            <TradingChart data={chartData} symbol={selectedSymbol} className="h-[500px]" />
          </div>

          {/* Bottom Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Challenge Status */}
            {currentChallenge ? (
              <div className="space-y-4">
                <ChallengeStatusCard
                  status={currentChallenge.status as 'active' | 'passed' | 'failed'}
                  initialBalance={currentChallenge.starting_balance}
                  currentBalance={currentChallenge.equity}
                  dailyStartBalance={currentChallenge.day_start_equity}
                  maxDailyLoss={5}
                  maxTotalLoss={10}
                  profitTarget={10}
                  currency={userCurrency}
                />
                {currentChallenge.status === 'active' && (
                  <div className="flex justify-center">
                    <UpgradeChallengeDialog
                      challenge={currentChallenge}
                      currentPlanId={currentChallenge.plan_id}
                      onUpgradeSuccess={loadDashboardData}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-4">Aucun challenge actif</p>
                <Link to="/pricing">
                  <Button>Commencer un Challenge</Button>
                </Link>
              </div>
            )}

            {/* Open Positions */}
            <div className="glass rounded-xl">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Positions Ouvertes</h3>
              </div>
              <OpenPositions
                positions={openPositions}
                currency={userCurrency}
                onClosePosition={handleClosePosition}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
