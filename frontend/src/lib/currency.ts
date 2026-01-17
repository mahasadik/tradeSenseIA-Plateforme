/**
 * Currency formatting utilities with real conversion
 */

export interface CurrencyConfig {
    code: string;
    symbol: string;
    position: 'before' | 'after';
    rate: number; // Taux par rapport à USD
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', position: 'before', rate: 1.0 },
    EUR: { code: 'EUR', symbol: '€', position: 'after', rate: 0.92 },
    MAD: { code: 'MAD', symbol: 'DH', position: 'after', rate: 10.0 },
    GBP: { code: 'GBP', symbol: '£', position: 'before', rate: 0.79 },
};

/**
 * Convert amount from USD to target currency
 * @param amountUSD - Amount in USD
 * @param targetCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(amountUSD: number, targetCurrency: string = 'MAD'): number {
    const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
    return amountUSD * config.rate;
}
/**
 * Format amount with currency symbol and conversion
 * @param amountUSD - The amount in USD
 * @param currency - Currency code (USD, EUR, MAD, GBP)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with converted amount and currency symbol
 */
export function formatCurrency(
    amountUSD: number,
    currency: string = 'MAD',
    decimals: number = 2
): string {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const convertedAmount = convertCurrency(amountUSD, currency);
    const formatted = convertedAmount.toFixed(decimals);
    if (config.position === 'before') {
        return `${config.symbol}${formatted}`;
    } else {
        return `${formatted} ${config.symbol}`;
    }
}

/**
 * Format amount with sign (+ or -) and currency with conversion
 * @param amountUSD - The amount in USD
 * @param currency - Currency code
 * @param decimals - Number of decimal places
 * @returns Formatted string with sign, converted amount and currency
 */
export function formatCurrencyWithSign(
    amountUSD: number,
    currency: string = 'MAD',
    decimals: number = 2
): string {
    const sign = amountUSD >= 0 ? '+' : '';
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const convertedAmount = convertCurrency(amountUSD, currency);
    const formatted = convertedAmount.toFixed(decimals);
    if (config.position === 'before') {
        return `${sign}${config.symbol}${formatted}`;
    } else {
        return `${sign}${formatted} ${config.symbol}`;
    }
}

/**
 * Format large amounts with thousands separator and conversion
 * @param amountUSD - The amount in USD
 * @param currency - Currency code
 * @returns Formatted string with thousands separator, converted amount and currency
 */
export function formatCurrencyLarge(
    amountUSD: number,
    currency: string = 'MAD'
): string {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const convertedAmount = convertCurrency(amountUSD, currency);
    const formatted = convertedAmount.toLocaleString('en-US', {
        maximumFractionDigits: 2,
    });

    if (config.position === 'before') {
        return `${config.symbol}${formatted}`;
    } else {
        return `${formatted} ${config.symbol}`;
    }
}

/**
 * Get currency symbol only
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string = 'MAD'): string {
    return CURRENCIES[currency]?.symbol || '$';
}
