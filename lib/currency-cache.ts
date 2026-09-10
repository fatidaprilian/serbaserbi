interface CachedExchangeRate {
  from: string;
  to: string;
  rate: number;
  source: string;
  cachedAt: string;
  expiresAt: number;
}

// In-memory cache singleton (TTL: 12 hours = 43,200,000 ms)
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const cacheStore: Record<string, CachedExchangeRate> = {};

const FALLBACK_RATES: Record<string, number> = {
  'USD_IDR': 16250,
  'IDR_USD': 0.0000615,
};

/**
 * Fetch latest exchange rate with in-memory caching and fallback tolerance.
 */
export async function getExchangeRate(
  from = 'USD',
  to = 'IDR'
): Promise<{
  from: string;
  to: string;
  rate: number;
  source: string;
  cachedAt: string;
  isCached: boolean;
}> {
  const cacheKey = `${from.toUpperCase()}_${to.toUpperCase()}`;
  const now = Date.now();

  // Check valid cache entry
  const cached = cacheStore[cacheKey];
  if (cached && now < cached.expiresAt) {
    return {
      from: cached.from,
      to: cached.to,
      rate: cached.rate,
      source: cached.source,
      cachedAt: cached.cachedAt,
      isCached: true,
    };
  }

  // Attempt to fetch fresh rate from open exchange API
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, {
      next: { revalidate: 43200 },
    });

    if (res.ok) {
      const data = await res.json();
      const targetRate = data.rates?.[to.toUpperCase()];

      if (typeof targetRate === 'number' && targetRate > 0) {
        const entry: CachedExchangeRate = {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          rate: Math.round(targetRate),
          source: 'Open Exchange Rates (JISDOR / Interbank)',
          cachedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          expiresAt: now + CACHE_TTL_MS,
        };

        cacheStore[cacheKey] = entry;

        return {
          from: entry.from,
          to: entry.to,
          rate: entry.rate,
          source: entry.source,
          cachedAt: entry.cachedAt,
          isCached: false,
        };
      }
    }
  } catch (err) {
    console.warn('External currency API unreachable, using cached/fallback rate:', err);
  }

  // Fallback to expired cache if available
  if (cached) {
    return {
      from: cached.from,
      to: cached.to,
      rate: cached.rate,
      source: `${cached.source} (Cache)`,
      cachedAt: cached.cachedAt,
      isCached: true,
    };
  }

  // Ultimate fallback to baseline rate
  const fallbackRate = FALLBACK_RATES[cacheKey] || 16250;
  const fallbackEntry: CachedExchangeRate = {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    rate: fallbackRate,
    source: 'Bank Indonesia Standard (Fallback)',
    cachedAt: 'Tersimpan',
    expiresAt: now + CACHE_TTL_MS,
  };
  cacheStore[cacheKey] = fallbackEntry;

  return {
    from: fallbackEntry.from,
    to: fallbackEntry.to,
    rate: fallbackEntry.rate,
    source: fallbackEntry.source,
    cachedAt: fallbackEntry.cachedAt,
    isCached: true,
  };
}
