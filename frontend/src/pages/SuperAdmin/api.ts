// ============================================================================
// API UTILITIES FOR SUPERADMIN
// ============================================================================

import { getToken } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ============================================================================
// API CALLS
// ============================================================================

export const fetchPaypalStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/paypal/status`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la vérification du statut PayPal');
    }

    return response.json();
};

export const configurePaypal = async (config: { client_id: string; client_secret: string; mode: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/paypal/configure`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(config)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
    }

    return response.json();
};

export const fetchStats = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
    }

    return response.json();
};

export const fetchChallenges = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/challenges`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des challenges');
    }

    return response.json();
};

export const fetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
    }

    return response.json();
};

export const createUser = async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
    }

    return response.json();
};

export const updateUser = async (userId: number, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
    }

    return response.json();
};

export const deleteUser = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
    }

    return response.json();
};
