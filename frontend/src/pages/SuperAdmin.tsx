import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, CreditCard, Key, Save, Loader2, CheckCircle, XCircle,
    Users, Plus, Edit, Trash2, Search, TrendingUp, TrendingDown, Activity, Settings, BarChart3, ArrowLeft, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { clearToken, getToken } from '@/lib/api';

// Local imports
import {
    ChallengeRow,
    TopPerformerRow,
    EmptyState,
    PaginationInfo,
    matchesChallengeSearch,
    type ChallengeData,
    type PerformerData
} from './SuperAdmin/components';
import {
    fetchPaypalStatus,
    configurePaypal,
    fetchStats,
    fetchChallenges,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
} from './SuperAdmin/api';

// ============================================================================
// CONSTANTS
// ============================================================================
const ROLE_OPTIONS = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'superadmin', label: 'SuperAdmin' }
];

const CURRENCY_OPTIONS = [
    { value: 'MAD', label: 'MAD' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' }
];

const ITEMS_PER_PAGE = 20;

// ============================================================================
// TYPES
// ============================================================================
interface UserData {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: string;
    currency: string;
    created_at: string;
}

interface Stats {
    users: {
        total: number;
        by_role: { [key: string]: number };
    };
    challenges: {
        total: number;
        by_status: { [key: string]: number };
        by_plan: { [key: string]: number };
    };
    financial: {
        total_equity: number;
        total_starting_balance: number;
        total_profit: number;
        total_loss: number;
        active_challenges: number;
    };
    top_performers: Array<PerformerData>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const SuperAdmin = () => {
    const navigate = useNavigate();

    // ========================================================================
    // STATE
    // ========================================================================
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    // PayPal
    const [paypalConfigured, setPaypalConfigured] = useState(false);
    const [paypalConfig, setPaypalConfig] = useState({
        client_id: '',
        client_secret: '',
        mode: 'sandbox'
    });

    // Stats
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Challenges
    const [challenges, setChallenges] = useState<ChallengeData[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challengeSearchQuery, setChallengeSearchQuery] = useState('');

    // Users
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userForm, setUserForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'user',
        currency: 'MAD'
    });

    // ========================================================================
    // EFFECTS
    // ========================================================================
    useEffect(() => {
        const token = getToken();
        if (!token) {
            toast.error('Veuillez vous connecter');
            navigate('/login');
            return;
        }
        checkPaypalStatus();
        loadUsers();
        loadStats();
        loadChallenges();
    }, []);

    // ========================================================================
    // API CALLS
    // ========================================================================
    const checkPaypalStatus = async () => {
        setCheckingStatus(true);
        try {
            const data = await fetchPaypalStatus();
            setPaypalConfigured(data.configured);
            setPaypalConfig(prev => ({ ...prev, mode: data.mode }));
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Impossible de vérifier le statut PayPal');
            // Check for 403 and redirect
            if ((error as any)?.status === 403) {
                toast.error('Accès interdit - Compte SUPERADMIN requis');
                navigate('/dashboard');
            }
        } finally {
            setCheckingStatus(false);
        }
    };

    const loadStats = async () => {
        setLoadingStats(true);
        try {
            const data = await fetchStats();
            setStats(data);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Impossible de charger les statistiques');
        } finally {
            setLoadingStats(false);
        }
    };

    const loadChallenges = async () => {
        setLoadingChallenges(true);
        try {
            const data = await fetchChallenges();
            setChallenges(data.challenges || []);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Impossible de charger les challenges');
        } finally {
            setLoadingChallenges(false);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await fetchUsers();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Impossible de charger les utilisateurs');
        } finally {
            setLoadingUsers(false);
        }
    };

    // ========================================================================
    // HANDLERS
    // ========================================================================
    const handleSavePaypalConfig = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paypalConfig.client_id || !paypalConfig.client_secret) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            await configurePaypal(paypalConfig);
            toast.success('Configuration PayPal sauvegardée avec succès!');
            setPaypalConfigured(true);
            setPaypalConfig({ client_id: '', client_secret: '', mode: paypalConfig.mode });
        } catch (error: any) {
            console.error('Erreur:', error);
            toast.error(error.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUserDialog = (user?: UserData) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                email: user.email,
                password: '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                role: user.role,
                currency: user.currency
            });
        } else {
            setEditingUser(null);
            setUserForm({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                phone: '',
                role: 'user',
                currency: 'MAD'
            });
        }
        setShowUserDialog(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userForm.email) {
            toast.error('Email requis');
            return;
        }

        if (!editingUser && !userForm.password) {
            toast.error('Mot de passe requis pour créer un utilisateur');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, userForm);
                toast.success('Utilisateur modifié');
            } else {
                await createUser(userForm);
                toast.success('Utilisateur créé');
            }
            setShowUserDialog(false);
            loadUsers();
        } catch (error: any) {
            console.error('Erreur:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await deleteUser(userId);
            toast.success('Utilisateur supprimé');
            loadUsers();
        } catch (error: any) {
            console.error('Erreur:', error);
            toast.error(error.message);
        }
    };

    const handleLogout = () => {
        clearToken();
        navigate('/login');
        toast.success('Déconnexion réussie');
    };

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredActiveChallenges = challenges.filter(c =>
        c.status === 'active' && matchesChallengeSearch(c, challengeSearchQuery)
    );

    const filteredClosedChallenges = challenges.filter(c =>
        (c.status === 'failed' || c.status === 'passed') && matchesChallengeSearch(c, challengeSearchQuery)
    );

    // ========================================================================
    // RENDER
    // ========================================================================
    if (checkingStatus) {
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
                        <Badge variant="default" className="bg-gradient-primary">
                            <Shield className="w-3 h-3 mr-1" />
                            SUPERADMIN
                        </Badge>
                        <ThemeToggle />
                        <Link to="/dashboard">
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                        <Button variant="ghost" onClick={handleLogout}>
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-4xl">
                {/* Back Link */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au Dashboard
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Panneau SUPERADMIN
                    </h1>
                    <p className="text-muted-foreground">
                        Configuration des paramètres système et intégrations
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Tabs pour Statistiques, PayPal et Utilisateurs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="stats" className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Statistiques
                            </TabsTrigger>
                            <TabsTrigger value="paypal" className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                PayPal
                            </TabsTrigger>
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Utilisateurs ({users.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Statistics Tab */}
                        <TabsContent value="stats" className="space-y-6">
                            {loadingStats ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : stats ? (
                                <div className="space-y-8">
                                    {/* Overview Cards */}
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Total Utilisateurs
                                                </CardTitle>
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.users.total}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.users.by_role.user || 0} users, {stats.users.by_role.admin || 0} admins
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Total Challenges
                                                </CardTitle>
                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.challenges.total}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.challenges.by_status.active || 0} actifs
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Profit Total
                                                </CardTitle>
                                                <TrendingUp className="h-4 w-4 text-success" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-success">
                                                    ${stats.financial.total_profit.toFixed(2)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Sur {stats.financial.active_challenges} challenges actifs
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Perte Totale
                                                </CardTitle>
                                                <TrendingDown className="h-4 w-4 text-destructive" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-destructive">
                                                    ${stats.financial.total_loss.toFixed(2)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Équity: ${stats.financial.total_equity.toFixed(2)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Challenges by Status */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Challenges par Statut</CardTitle>
                                            <CardDescription>Répartition des challenges sur la plateforme</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Object.entries(stats.challenges.by_status).map(([status, count]) => (
                                                    <div key={status} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={
                                                                status === 'active' ? 'default' :
                                                                    status === 'passed' ? 'default' :
                                                                        status === 'failed' ? 'destructive' : 'outline'
                                                            }>
                                                                {status}
                                                            </Badge>
                                                        </div>
                                                        <span className="font-semibold">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Accordion for Top Performers and Challenges */}
                                    <Accordion type="multiple" className="w-full space-y-4">
                                        {/* Top Performers */}
                                        <AccordionItem value="top-performers" className="border rounded-lg">
                                            <AccordionTrigger className="hover:no-underline px-6">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-success" />
                                                    <span className="font-semibold text-lg">Top 10 Traders</span>
                                                    <Badge variant="outline" className="ml-2">
                                                        {stats.top_performers.length}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-6">
                                                <div className="rounded-md border mt-2">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Trader</TableHead>
                                                                <TableHead className="text-right">Balance Initiale</TableHead>
                                                                <TableHead className="text-right">Équity</TableHead>
                                                                <TableHead className="text-right">Profit %</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {stats.top_performers.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                                        Aucun trader actif
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                stats.top_performers.map((performer, index) => (
                                                                    <TableRow key={performer.id}>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-2">
                                                                                {index < 3 && (
                                                                                    <Badge variant="outline" className={
                                                                                        index === 0 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500' :
                                                                                            index === 1 ? 'bg-gray-400/10 text-gray-600 border-gray-400' :
                                                                                                'bg-orange-500/10 text-orange-600 border-orange-500'
                                                                                    }>
                                                                                        #{index + 1}
                                                                                    </Badge>
                                                                                )}
                                                                                <span className="font-medium">{performer.name}</span>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono">
                                                                            ${performer.starting_balance.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono">
                                                                            ${performer.equity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Badge variant={performer.profit_pct >= 0 ? 'default' : 'destructive'}>
                                                                                {performer.profit_pct >= 0 ? '+' : ''}{performer.profit_pct.toFixed(2)}%
                                                                            </Badge>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Challenges List */}
                                        <AccordionItem value="challenges-list" className="border rounded-lg">
                                            <AccordionTrigger className="hover:no-underline px-6">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-primary" />
                                                    <span className="font-semibold text-lg">Liste des Challenges</span>
                                                    <Badge variant="outline" className="ml-2">
                                                        {challenges.length}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-6">
                                                <div className="space-y-4">
                                                    {/* Search Bar */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="Rechercher par utilisateur, plan ou ID..."
                                                                value={challengeSearchQuery}
                                                                onChange={(e) => setChallengeSearchQuery(e.target.value)}
                                                                className="pl-10"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Challenges Accordion */}
                                                    {loadingChallenges ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader2 className="w-6 h-6 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        <Accordion type="multiple" className="w-full">
                                                            {/* Active Challenges */}
                                                            <AccordionItem value="active">
                                                                <AccordionTrigger className="hover:no-underline">
                                                                    <div className="flex items-center gap-2">
                                                                        <Activity className="w-4 h-4 text-green-600" />
                                                                        <span>Challenges Actifs</span>
                                                                        <Badge variant="default" className="ml-2">
                                                                            {filteredActiveChallenges.length}
                                                                        </Badge>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="rounded-md border mt-2">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>ID</TableHead>
                                                                                    <TableHead>Utilisateur</TableHead>
                                                                                    <TableHead>Plan</TableHead>
                                                                                    <TableHead className="text-right">Balance</TableHead>
                                                                                    <TableHead className="text-right">Équity</TableHead>
                                                                                    <TableHead className="text-right">P&L</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {filteredActiveChallenges
                                                                                    .slice(0, 20)
                                                                                    .map((challenge) => (
                                                                                        <TableRow key={challenge.id}>
                                                                                            <TableCell className="font-mono text-sm">#{challenge.id}</TableCell>
                                                                                            <TableCell>
                                                                                                <div>
                                                                                                    <div className="font-medium text-sm">
                                                                                                        {challenge.user_name || challenge.user_email || `User #${challenge.user_id}`}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                <Badge variant="outline" className="text-xs">{challenge.plan_name}</Badge>
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right font-mono text-sm">
                                                                                                ${challenge.starting_balance.toFixed(0)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right font-mono text-sm">
                                                                                                ${challenge.equity.toFixed(0)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                <div className="flex flex-col items-end">
                                                                                                    <span className={`font-mono font-semibold text-sm ${challenge.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                                                                        {challenge.profit_loss >= 0 ? '+' : ''}${challenge.profit_loss.toFixed(2)}
                                                                                                    </span>
                                                                                                    <span className={`text-xs ${challenge.profit_loss_pct >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                                                                        {challenge.profit_loss_pct >= 0 ? '+' : ''}{challenge.profit_loss_pct.toFixed(2)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                {filteredActiveChallenges.length === 0 && (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                                                                                            Aucun challenge actif trouvé
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                                {filteredActiveChallenges.length > 20 && (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-2">
                                                                                            Affichage de 20 résultats sur {filteredActiveChallenges.length}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>

                                                            {/* Closed Challenges (Failed + Passed) */}
                                                            <AccordionItem value="closed">
                                                                <AccordionTrigger className="hover:no-underline">
                                                                    <div className="flex items-center gap-2">
                                                                        <XCircle className="w-4 h-4 text-gray-600" />
                                                                        <span>Challenges Fermés</span>
                                                                        <Badge variant="outline" className="ml-2">
                                                                            {filteredClosedChallenges.length}
                                                                        </Badge>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="rounded-md border mt-2">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>ID</TableHead>
                                                                                    <TableHead>Utilisateur</TableHead>
                                                                                    <TableHead>Plan</TableHead>
                                                                                    <TableHead>Statut</TableHead>
                                                                                    <TableHead className="text-right">Balance</TableHead>
                                                                                    <TableHead className="text-right">Équity</TableHead>
                                                                                    <TableHead className="text-right">P&L</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {filteredClosedChallenges
                                                                                    .slice(0, 20)
                                                                                    .map((challenge) => (
                                                                                        <TableRow key={challenge.id}>
                                                                                            <TableCell className="font-mono text-sm">#{challenge.id}</TableCell>
                                                                                            <TableCell>
                                                                                                <div>
                                                                                                    <div className="font-medium text-sm">
                                                                                                        {challenge.user_name || challenge.user_email || `User #${challenge.user_id}`}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                <Badge variant="outline" className="text-xs">{challenge.plan_name}</Badge>
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                <Badge variant={challenge.status === 'passed' ? 'default' : 'destructive'} className="text-xs">
                                                                                                    {challenge.status}
                                                                                                </Badge>
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right font-mono text-sm">
                                                                                                ${challenge.starting_balance.toFixed(0)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right font-mono text-sm">
                                                                                                ${challenge.equity.toFixed(0)}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                <div className="flex flex-col items-end">
                                                                                                    <span className={`font-mono font-semibold text-sm ${challenge.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                                                                        {challenge.profit_loss >= 0 ? '+' : ''}${challenge.profit_loss.toFixed(2)}
                                                                                                    </span>
                                                                                                    <span className={`text-xs ${challenge.profit_loss_pct >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                                                                        {challenge.profit_loss_pct >= 0 ? '+' : ''}{challenge.profit_loss_pct.toFixed(2)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                {filteredClosedChallenges.length === 0 && (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                                                                                            Aucun challenge fermé trouvé
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                                {filteredClosedChallenges.length > 20 && (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-2">
                                                                                            Affichage de 20 résultats sur {filteredClosedChallenges.length}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        Aucune statistique disponible
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* PayPal Tab */}
                        <TabsContent value="paypal" className="space-y-6">
                            {/* PayPal Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Configuration PayPal
                                        {paypalConfigured && (
                                            <Badge variant="default" className="ml-2 bg-success">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Configuré
                                            </Badge>
                                        )}
                                        {!paypalConfigured && (
                                            <Badge variant="destructive" className="ml-2">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Non configuré
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Configurez vos identifiants PayPal pour activer les paiements réels
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSavePaypalConfig} className="space-y-6">
                                        {/* Mode */}
                                        <div className="space-y-2">
                                            <Label>Mode PayPal</Label>
                                            <RadioGroup
                                                value={paypalConfig.mode}
                                                onValueChange={(value) => setPaypalConfig({ ...paypalConfig, mode: value })}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="sandbox" id="sandbox" />
                                                    <Label htmlFor="sandbox" className="cursor-pointer">
                                                        Sandbox (Test)
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="live" id="live" />
                                                    <Label htmlFor="live" className="cursor-pointer">
                                                        Live (Production)
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                            <p className="text-xs text-muted-foreground">
                                                Utilisez le mode Sandbox pour les tests, Live pour la production
                                            </p>
                                        </div>

                                        {/* Client ID */}
                                        <div className="space-y-2">
                                            <Label htmlFor="client_id" className="flex items-center gap-2">
                                                <Key className="w-4 h-4" />
                                                Client ID
                                            </Label>
                                            <Input
                                                id="client_id"
                                                type="text"
                                                placeholder="AeB1234567890abcdefGHIJKLMNOPQRSTUVWXYZ..."
                                                value={paypalConfig.client_id}
                                                onChange={(e) => setPaypalConfig({ ...paypalConfig, client_id: e.target.value })}
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Votre Client ID PayPal (depuis developer.paypal.com)
                                            </p>
                                        </div>

                                        {/* Client Secret */}
                                        <div className="space-y-2">
                                            <Label htmlFor="client_secret" className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Client Secret
                                            </Label>
                                            <Input
                                                id="client_secret"
                                                type="password"
                                                placeholder="EDC9876543210zyxwvutsrqponmlkjihgfed..."
                                                value={paypalConfig.client_secret}
                                                onChange={(e) => setPaypalConfig({ ...paypalConfig, client_secret: e.target.value })}
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Votre Client Secret PayPal (gardez-le confidentiel!)
                                            </p>
                                        </div>

                                        {/* Info Box */}
                                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Comment obtenir vos credentials PayPal ?
                                            </h4>
                                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                                <li>Allez sur <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">developer.paypal.com</a></li>
                                                <li>Connectez-vous avec votre compte PayPal</li>
                                                <li>Créez une application (My Apps & Credentials)</li>
                                                <li>Copiez le Client ID et le Client Secret</li>
                                                <li>Collez-les dans les champs ci-dessus</li>
                                            </ol>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-primary text-background hover:opacity-90"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Sauvegarde en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 mr-2" />
                                                    Sauvegarder la configuration
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Users Tab */}
                        <TabsContent value="users" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Gestion des utilisateurs
                                            </CardTitle>
                                            <CardDescription>
                                                Liste complète des utilisateurs de la plateforme
                                            </CardDescription>
                                        </div>
                                        <Button onClick={() => handleOpenUserDialog()} className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Nouvel utilisateur
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Search Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Rechercher par email ou nom..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Users Table */}
                                    {loadingUsers ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Nom</TableHead>
                                                        <TableHead>Rôle</TableHead>
                                                        <TableHead>Devise</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredUsers.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                                Aucun utilisateur trouvé
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredUsers.map((user) => (
                                                            <TableRow key={user.id}>
                                                                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                                                                <TableCell>{user.email}</TableCell>
                                                                <TableCell>
                                                                    {user.first_name || user.last_name
                                                                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                                        : '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={
                                                                        user.role === 'superadmin' ? 'default' :
                                                                            user.role === 'admin' ? 'secondary' : 'outline'
                                                                    }>
                                                                        {user.role}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{user.currency}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleOpenUserDialog(user)}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Future Settings Cards */}
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Autres paramètres
                                <Badge variant="outline" className="ml-2">Bientôt</Badge>
                            </CardTitle>
                            <CardDescription>
                                Configuration des emails, SMS, et autres intégrations (à venir)
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </main>

            {/* User Create/Edit Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Modifiez les informations de l\'utilisateur'
                                : 'Ajoutez un nouvel utilisateur à la plateforme'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email *</Label>
                            <Input
                                id="user-email"
                                type="email"
                                required
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                placeholder="utilisateur@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-password">
                                Mot de passe {!editingUser && '*'}
                            </Label>
                            <Input
                                id="user-password"
                                type="password"
                                required={!editingUser}
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                placeholder={editingUser ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-firstname">Prénom</Label>
                                <Input
                                    id="user-firstname"
                                    value={userForm.first_name}
                                    onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                                    placeholder="Prénom"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-lastname">Nom</Label>
                                <Input
                                    id="user-lastname"
                                    value={userForm.last_name}
                                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                                    placeholder="Nom"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-phone">Téléphone</Label>
                            <Input
                                id="user-phone"
                                type="tel"
                                value={userForm.phone}
                                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                placeholder="+212 6 XX XX XX XX"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-role">Rôle</Label>
                                <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                                    <SelectTrigger id="user-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-currency">Devise</Label>
                                <Select value={userForm.currency} onValueChange={(value) => setUserForm({ ...userForm, currency: value })}>
                                    <SelectTrigger id="user-currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCY_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowUserDialog(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingUser ? 'Modifier' : 'Créer'}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog >
        </div >
    );
};

export default SuperAdmin;