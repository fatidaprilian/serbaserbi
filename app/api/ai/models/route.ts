import { NextResponse } from 'next/server';

interface OpenRouterModelRaw {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
  context_length?: number;
}

// In-memory cache for OpenRouter models list (TTL: 15 minutes)
let cachedModels: Array<{ id: string; name: string; isFree: boolean; contextLength: number }> | null = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedModels && now - lastFetchedTime < CACHE_TTL_MS) {
    return NextResponse.json({ models: cachedModels, source: 'cache' });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': 'https://serbaserbi.app',
        'X-Title': 'SerbaSerbi Invoicer',
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter models API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawList: OpenRouterModelRaw[] = data.data || [];

    const formatted = rawList.map((m) => {
      const promptCost = m.pricing?.prompt;
      const isFree =
        promptCost === '0' ||
        promptCost === 0 ||
        promptCost === '0.000000' ||
        m.id.endsWith(':free');

      return {
        id: m.id,
        name: m.name || m.id,
        isFree,
        contextLength: m.context_length || 4096,
      };
    });

    // Prioritize free models first, then sort alphabetically by name
    formatted.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.name.localeCompare(b.name);
    });

    cachedModels = formatted;
    lastFetchedTime = now;

    return NextResponse.json({ models: formatted, source: 'live' });
  } catch (error) {
    console.error('Failed to fetch OpenRouter models:', error);
    // Graceful fallback if OpenRouter is unreachable
    if (cachedModels) {
      return NextResponse.json({ models: cachedModels, source: 'stale-cache' });
    }

    const defaultFallback = [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta: Llama 3.3 70B Instruct (Free)', isFree: true, contextLength: 131072 },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Google: Gemini 2.0 Flash (Free)', isFree: true, contextLength: 1048576 },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek: DeepSeek V3', isFree: false, contextLength: 64000 },
      { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o-mini', isFree: false, contextLength: 128000 },
      { id: 'anthropic/claude-3.5-haiku', name: 'Anthropic: Claude 3.5 Haiku', isFree: false, contextLength: 200000 },
    ];

    return NextResponse.json({ models: defaultFallback, source: 'fallback' });
  }
}
