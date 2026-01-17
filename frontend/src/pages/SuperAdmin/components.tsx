import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';

// ============================================================================
// TYPES
// ============================================================================
export interface ChallengeData {
    id: number;
    user_id: number;
    user_email: string | null;
    user_name: string | null;
    plan_id: number;
    plan_name: string | null;
    status: string;
    starting_balance: number;
    equity: number;
    profit_loss: number;
    profit_loss_pct: number;
    day_start_equity: number;
    created_at: string;
}

export interface PerformerData {
    id: number;
    email: string;
    name: string;
    equity: number;
    starting_balance: number;
    profit_pct: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" => {
    switch (status) {
        case 'active':
        case 'passed':
            return 'default';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export const getRankBadgeClass = (index: number): string => {
    switch (index) {
        case 0: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500';
        case 1: return 'bg-gray-400/10 text-gray-600 border-gray-400';
        case 2: return 'bg-orange-500/10 text-orange-600 border-orange-500';
        default: return '';
    }
};

export const matchesChallengeSearch = (challenge: ChallengeData, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return (
        challenge.id.toString().includes(query) ||
        challenge.user_email?.toLowerCase().includes(lowerQuery) ||
        challenge.user_name?.toLowerCase().includes(lowerQuery) ||
        challenge.plan_name?.toLowerCase().includes(lowerQuery)
    );
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface ChallengeRowProps {
    challenge: ChallengeData;
    showStatus?: boolean;
}

export const ChallengeRow = ({ challenge, showStatus = false }: ChallengeRowProps) => {
    return (
        <TableRow>
            <TableCell className="font-mono text-sm">#{challenge.id}</TableCell>
            <TableCell>
                <div className="font-medium text-sm">
                    {challenge.user_name || challenge.user_email || `User #${challenge.user_id}`}
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="text-xs">{challenge.plan_name}</Badge>
            </TableCell>
            {showStatus && (
                <TableCell>
                    <Badge variant={getStatusBadgeVariant(challenge.status)} className="text-xs">
                        {challenge.status}
                    </Badge>
                </TableCell>
            )}
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
    );
};

interface TopPerformerRowProps {
    performer: PerformerData;
    index: number;
}

export const TopPerformerRow = ({ performer, index }: TopPerformerRowProps) => {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    {index < 3 && (
                        <Badge variant="outline" className={getRankBadgeClass(index)}>
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
    );
};

interface EmptyStateProps {
    colSpan: number;
    message: string;
}

export const EmptyState = ({ colSpan, message }: EmptyStateProps) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-4">
                {message}
            </TableCell>
        </TableRow>
    );
};

interface PaginationInfoProps {
    colSpan: number;
    displayed: number;
    total: number;
}

export const PaginationInfo = ({ colSpan, displayed, total }: PaginationInfoProps) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="text-center text-muted-foreground text-xs py-2">
                Affichage de {displayed} résultats sur {total}
            </TableCell>
        </TableRow>
    );
};
