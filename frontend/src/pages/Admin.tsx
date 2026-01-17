import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Shield, Users, CheckCircle, XCircle, ArrowLeft, Search, Filter, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const API_BASE = import.meta.env.VITE_API_URL || '';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from 'sonner';
import { getToken, clearToken } from '@/lib/api';

interface User {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    currency: string;
    created_at: string;
}

interface Challenge {
    id: number;
    user_id: number;
    plan_id: number;
    status: string;
    initial_balance: number;
    current_balance: number;
    created_at: string;
    plan_name?: string;
}

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const token = getToken();
        if (!token) {
            toast.error('Veuillez vous connecter');
            navigate('/login');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Charger les utilisateurs
            const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (usersResponse.status === 403) {
                toast.error('Accès interdit - Compte ADMIN/SUPERADMIN requis');
                navigate('/dashboard');
                return;
            }

            if (!usersResponse.ok) throw new Error('Erreur chargement utilisateurs');
            const usersData = await usersResponse.json();
            setUsers(usersData.users || []);

            // Charger tous les challenges
            const challengesResponse = await fetch(`${API_BASE}/api/admin/challenges`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (challengesResponse.ok) {
                const challengesData = await challengesResponse.json();
                setChallenges(challengesData.challenges || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const updateChallengeStatus = async (challengeId: number, newStatus: 'passed' | 'failed') => {
        try {
            const response = await fetch(`${API_BASE}/api/admin/challenges/${challengeId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            toast.success(`Challenge marqué comme ${newStatus === 'passed' ? 'Réussi' : 'Échoué'}`);
            loadData(); // Recharger les données
        } catch (error: any) {
            console.error('Erreur:', error);
            toast.error(error.message || 'Erreur lors de la mise à jour');
        }
    };

    const handleLogout = () => {
        clearToken();
        navigate('/login');
        toast.success('Déconnexion réussie');
    };

    const filteredChallenges = challenges.filter((challenge) => {
        const user = users.find((u) => u.id === challenge.user_id);
        const matchesSearch = user
            ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
            : false;
        const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                            ADMIN
                        </Badge>
                        <LanguageSelector />
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

            <main className="container py-8 max-w-7xl">
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
                        <Users className="w-8 h-8" />
                        Panneau d'Administration
                    </h1>
                    <p className="text-muted-foreground">
                        Gérer les utilisateurs et leurs challenges
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Utilisateurs</CardDescription>
                            <CardTitle className="text-3xl">{users.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Challenges Actifs</CardDescription>
                            <CardTitle className="text-3xl">
                                {challenges.filter((c) => c.status === 'active').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Challenges Réussis</CardDescription>
                            <CardTitle className="text-3xl text-success">
                                {challenges.filter((c) => c.status === 'passed').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Challenges Échoués</CardDescription>
                            <CardTitle className="text-3xl text-destructive">
                                {challenges.filter((c) => c.status === 'failed').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par email ou nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="active">Actif</SelectItem>
                                    <SelectItem value="passed">Réussi</SelectItem>
                                    <SelectItem value="failed">Échoué</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Challenges Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Challenges des Utilisateurs</CardTitle>
                        <CardDescription>
                            Gérer le statut des challenges (Réussi/Échoué)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Solde Initial</TableHead>
                                    <TableHead>Solde Actuel</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredChallenges.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            Aucun challenge trouvé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredChallenges.map((challenge) => {
                                        const user = users.find((u) => u.id === challenge.user_id);
                                        const userName = user
                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
                                            : `User ${challenge.user_id}`;

                                        return (
                                            <TableRow key={challenge.id}>
                                                <TableCell className="font-mono">#{challenge.id}</TableCell>
                                                <TableCell>{userName}</TableCell>
                                                <TableCell>{challenge.plan_name || `Plan ${challenge.plan_id}`}</TableCell>
                                                <TableCell className="font-mono">
                                                    {(challenge.initial_balance || 0).toLocaleString()} {user?.currency || 'MAD'}
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {(challenge.current_balance || 0).toLocaleString()} {user?.currency || 'MAD'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            challenge.status === 'passed'
                                                                ? 'default'
                                                                : challenge.status === 'failed'
                                                                    ? 'destructive'
                                                                    : challenge.status === 'active'
                                                                        ? 'outline'
                                                                        : 'secondary'
                                                        }
                                                    >
                                                        {challenge.status === 'active' && '🟢 Actif'}
                                                        {challenge.status === 'passed' && '✅ Réussi'}
                                                        {challenge.status === 'failed' && '❌ Échoué'}
                                                        {challenge.status === 'pending' && '⏳ En attente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(challenge.created_at).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {challenge.status === 'active' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-success border-success hover:bg-success/10"
                                                                    onClick={() => updateChallengeStatus(challenge.id, 'passed')}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Réussi
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                                                    onClick={() => updateChallengeStatus(challenge.id, 'failed')}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Échoué
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Admin;
