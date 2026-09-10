import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';
import { decryptApiKey } from '@/lib/crypto-utils';

export async function POST(request: Request) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { prompt, serviceContext } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Deskripsi singkat wajib diisi.' }, { status: 400 });
    }

    const [user] = await db
      .select({
        encryptedKey: users.openrouterApiKeyEncrypted,
        preferredAiModel: users.preferredAiModel,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.encryptedKey) {
      return NextResponse.json(
        { error: 'API Key OpenRouter belum dikonfigurasi. Silakan masukkan API Key Anda di menu Pengaturan.' },
        { status: 403 }
      );
    }

    let rawApiKey = '';
    try {
      rawApiKey = decryptApiKey(user.encryptedKey);
    } catch {
      return NextResponse.json({ error: 'Gagal mendekripsi API Key Anda.' }, { status: 500 });
    }

    const modelToUse = user.preferredAiModel || 'meta-llama/llama-3.3-70b-instruct:free';

    const systemPrompt = `Anda adalah asisten penulisan invoice dan surat penawaran profesional untuk freelancer di Indonesia.
Ubah input singkat berikut menjadi deskripsi item pekerjaan yang jelas, terstruktur, dan profesional.
Sertakan lingkup deliverable utama, batasan revisi wajar, atau format akhir berkas jika relevan (maksimal 2-3 kalimat ringkas).
PENTING: Jangan sertakan sapaan, percakapan pembuka/penutup, atau emoji apa pun. Berikan HANYA teks deskripsi pekerjaan yang telah disempurnakan.`;

    const userMessage = serviceContext
      ? `Konteks layanan: ${serviceContext}\nInput singkat: ${prompt.trim()}`
      : `Input singkat: ${prompt.trim()}`;

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://serbaserbi.app',
        'X-Title': 'SerbaSerbi Invoicer',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    // Overwrite local memory variable holding the key
    rawApiKey = '';

    if (!openRouterResponse.ok) {
      const errBody = await openRouterResponse.text();
      console.error('OpenRouter completion error:', errBody);
      return NextResponse.json(
        { error: 'OpenRouter gagal memproses permintaan. Periksa kuota atau validitas API Key Anda.' },
        { status: 502 }
      );
    }

    const completionData = await openRouterResponse.json();
    const resultText = completionData.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      success: true,
      description: resultText,
      model: modelToUse,
    });
  } catch (error) {
    console.error('Error expanding item description:', error);
    return NextResponse.json({ error: 'Gagal menyempurnakan deskripsi.' }, { status: 500 });
  }
}
