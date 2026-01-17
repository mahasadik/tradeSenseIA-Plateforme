import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, DollarSign, Phone, Mail, Save, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { fetchUserProfile, updateUserProfile, changePassword, getToken, UserProfile } from '@/lib/api';
import { formatCurrencyLarge, CURRENCIES as CURRENCY_CONFIGS } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

const CURRENCIES = [
    { value: 'USD', label: 'Dollar américain (USD)', symbol: '$' },
    { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { value: 'MAD', label: 'Dirham marocain (MAD)', symbol: 'د.م.' },
    { value: 'GBP', label: 'Livre sterling (GBP)', symbol: '£' },
];

const Settings = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [currency, setCurrency] = useState('MAD');
    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const token = getToken();
        if (!token) {
            toast.error('Veuillez vous connecter');
            navigate('/login');
            return;
        }
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await fetchUserProfile();
            setProfile(data);
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
            setPhone(data.phone || '');
            setCurrency(data.currency || 'USD');
        } catch (error) {
            console.error('Erreur chargement profil:', error);
            toast.error('Impossible de charger le profil');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateUserProfile({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                currency: currency,
            });
            toast.success('Profil mis à jour avec succès');
            loadProfile();
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setSaving(true);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success('Mot de passe modifié avec succès');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Erreur changement mot de passe:', error);
            const msg = error?.data?.error || 'Erreur lors du changement de mot de passe';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

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
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>
                            <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="container max-w-4xl py-8">
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">
                            <User className="w-4 h-4 mr-2" />
                            {t('settings.profile')}
                        </TabsTrigger>
                        <TabsTrigger value="language">
                            <Globe className="w-4 h-4 mr-2" />
                            {t('settings.language')}
                        </TabsTrigger>
                        <TabsTrigger value="currency">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Devise
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Lock className="w-4 h-4 mr-2" />
                            {t('settings.security')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('settings.accountInfo')}</CardTitle>
                                <CardDescription>
                                    {t('settings.profile')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Jean"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Dupont"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('auth.email')}</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={profile?.email || ''}
                                            disabled
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        L'email ne peut pas être modifié
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+212 6XX XXX XXX"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {t('common.save')}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Language Tab */}
                    <TabsContent value="language">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('settings.language')}</CardTitle>
                                <CardDescription>
                                    Choisissez votre langue préférée
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Langue de l'interface</Label>
                                    <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                                            <SelectItem value="en">🇬🇧 English</SelectItem>
                                            <SelectItem value="ar">🇲🇦 العربية</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        L'interface sera automatiquement traduite dans la langue sélectionnée
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Currency Tab */}
                    <TabsContent value="currency">
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences de devise</CardTitle>
                                <CardDescription>
                                    Choisissez la devise d'affichage pour vos soldes et transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Devise préférée</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((curr) => (
                                                <SelectItem key={curr.value} value={curr.value}>
                                                    {curr.symbol} {curr.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Les montants seront affichés dans cette devise
                                    </p>
                                </div>

                                <div className="glass rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Aperçu</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Solde exemple:</span>
                                        <span className="text-2xl font-bold">
                                            {formatCurrencyLarge(5000, currency)}
                                        </span>
                                    </div>
                                </div>

                                <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {t('common.save')}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('settings.changePassword')}</CardTitle>
                                <CardDescription>
                                    Assurez-vous d'utiliser un mot de passe fort et sécurisé
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 6 caractères
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <Button
                                    onClick={handleChangePassword}
                                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                                    className="w-full md:w-auto"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            {t('settings.changePassword')}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Settings;
