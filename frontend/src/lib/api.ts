// Helper small API wrapper for frontend
// Use environment variable for API URL or fallback to relative path
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_PROXY || "";

type ApiError = { status: number; data: unknown };

function isApiError(v: unknown): v is ApiError {
  return typeof v === "object" && v !== null && "status" in v && typeof (v as Record<string, unknown>).status === "number";
}

export function setToken(token: string, remember = true) {
  try {
    if (remember) {
      localStorage.setItem("access_token", token);
    } else {
      sessionStorage.setItem("access_token", token);
    }
  } catch (e) {
    // ignore storage errors
    // eslint-disable-next-line no-console
    console.warn("Failed to persist token", e);
  }
}

export function getToken(): string | null {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || null;
}

export function clearToken() {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_first_name");
  localStorage.removeItem("user_last_name");
}

export function setUserEmail(email: string) {
  localStorage.setItem("user_email", email);
}

export function getUserEmail(): string | null {
  return localStorage.getItem("user_email");
}

export function setUserName(firstName: string | null, lastName: string | null) {
  if (firstName) localStorage.setItem("user_first_name", firstName);
  if (lastName) localStorage.setItem("user_last_name", lastName);
}

export function getUserName(): { firstName: string | null; lastName: string | null } {
  return {
    firstName: localStorage.getItem("user_first_name"),
    lastName: localStorage.getItem("user_last_name")
  };
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('[DEBUG] Token added to request:', path, 'Token:', token.substring(0, 20) + '...');
  } else {
    console.log('[DEBUG] No token available for request:', path);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      // Si erreur 401 (Unauthorized), la session a expiré
      if (res.status === 401) {
        console.log('[AUTH] Session expirée, redirection vers login...');
        clearToken();
        // Rediriger vers login seulement si on n'y est pas déjà
        if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/forgot-password')) {
          window.location.href = '/login';
        }
      }
      throw { status: res.status, data } as ApiError;
    }
    return data as T;
  } catch (err) {
    if (isApiError(err)) throw err;
    throw { status: res.status, data: text } as ApiError;
  }
}

export function apiGet<T = unknown>(path: string) {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T = unknown>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

// User type
export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

// Example: auth helper
export async function login(email: string, password: string) {
  return apiPost<{ access_token: string; user: User }>("/api/auth/login", { email, password });
}

export async function register(email: string, password: string, firstName?: string, lastName?: string) {
  return apiPost<{ message?: string; error?: string }>("/api/auth/register", {
    email,
    password,
    first_name: firstName,
    last_name: lastName
  });
}

// Plans API
export interface Plan {
  id: number;
  name: string;
  price_dh: number;
  starting_balance: number;
}

export async function fetchPlans() {
  return apiGet<Plan[]>("/api/plans");
}

// Leaderboard API
export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  user_email: string;
  challenge_id: number;
  status: string;
  equity: number;
  pct: number;
}

export async function fetchLeaderboard() {
  return apiGet<LeaderboardEntry[]>("/api/leaderboard");
}

// Signals API
export interface Signal {
  symbol: string;
  signal: string;
  fast_sma: number;
  slow_sma: number;
  last_price: number;
}

export async function fetchSignals(symbol: string, fast = 5, slow = 20) {
  return apiGet<Signal>(`/api/signals?symbol=${symbol}&fast=${fast}&slow=${slow}`);
}

// Challenges API
export interface UserChallenge {
  id: number;
  plan_id: number;
  plan_name: string;
  status: string;
  starting_balance: number;
  equity: number;
  day_start_equity: number;
  created_at: string;
}

export async function fetchUserChallenges() {
  return apiGet<UserChallenge[]>("/api/challenges");
}

export async function upgradeChallenge(challengeId: number, newPlanId: number) {
  return apiPost<{
    message: string;
    challenge_id: number;
    new_plan: string;
    new_starting_balance: number;
    new_equity: number;
  }>("/api/challenge/upgrade", {
    challenge_id: challengeId,
    new_plan_id: newPlanId
  });
}

export async function checkoutMock(planId: number, paymentMethod: string) {
  return apiPost<{
    message: string;
    method: string;
    challenge_id: number;
  }>("/api/checkout/mock", {
    plan_id: planId,
    method: paymentMethod
  });
}

// Trades API
export interface Trade {
  id: number;
  challenge_id: number;
  symbol: string;
  market: string;
  side: string;
  qty: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

export async function fetchTrades(challengeId?: number) {
  const url = challengeId ? `/api/trades?challenge_id=${challengeId}` : "/api/trades";
  return apiGet<Trade[]>(url);
}

export async function openTrade(challengeId: number, symbol: string, side: string, qty: number, market = "YAHOO") {
  return apiPost<{ trade_id: number; entry_price: number }>("/api/trades/open", {
    challenge_id: challengeId,
    symbol,
    side,
    qty,
    market,
  });
}

export async function closeTrade(tradeId: number) {
  return apiPost<{ trade_id: number; exit_price: number; pnl: number; equity: number; challenge_status: string }>(
    "/api/trades/close",
    { trade_id: tradeId }
  );
}

// Prices API
export interface PricePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PriceHistory {
  ticker: string;
  points: PricePoint[];
}

export async function fetchPriceHistory(ticker: string, period = "1d", interval = "1m", limit = 300) {
  return apiGet<PriceHistory>(`/api/prices/yahoo/history?ticker=${ticker}&period=${period}&interval=${interval}&limit=${limit}`);
}

// BVC Symbols (Moroccan stocks)
const BVC_SYMBOLS = ['IAM', 'ATW', 'BCP', 'GAZ', 'CIH', 'CDM', 'LBL', 'MNG', 'SNI', 'TQM'];

export async function fetchBVCPrice(symbol: string) {
  return apiGet<{ symbol: string; price: number; currency: string }>(`/api/prices/bvc?symbol=${symbol}`);
}

export async function fetchCurrentPrice(ticker: string) {
  // Détection automatique: symboles BVC vs Yahoo Finance
  const isBVC = BVC_SYMBOLS.includes(ticker.toUpperCase());

  if (isBVC) {
    const data = await fetchBVCPrice(ticker);
    return { ticker: data.symbol, price: data.price };
  } else {
    return apiGet<{ ticker: string; price: number }>(`/api/prices/yahoo?ticker=${ticker}`);
  }
}

// User Profile API
export interface UserProfile {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  currency: string;
  role: string;
  created_at: string;
}

export async function fetchUserProfile() {
  return apiGet<UserProfile>("/api/auth/profile");
}

export async function updateUserProfile(data: Partial<UserProfile>) {
  return apiPut<{ message: string }>("/api/auth/profile", data);
}

export function apiPut<T = unknown>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiPut<{ message: string }>("/api/auth/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

// PayPal API
export interface PayPalCreateResponse {
  payment_id: string;
  approval_url: string;
  status: string;
}

export interface PayPalCaptureResponse {
  message: string;
  payment_id: string;
  challenge_id: number;
  status: string;
}

export async function createPayPalPayment(planId: number, returnUrl: string, cancelUrl: string) {
  return apiPost<PayPalCreateResponse>("/api/paypal/create-order", {
    plan_id: planId,
    return_url: returnUrl,
    cancel_url: cancelUrl,
  });
}

export async function capturePayPalPayment(paymentId: string, payerId: string, planId: number) {
  return apiPost<PayPalCaptureResponse>("/api/paypal/capture-order", {
    payment_id: paymentId,
    payer_id: payerId,
    plan_id: planId,
  });
}

