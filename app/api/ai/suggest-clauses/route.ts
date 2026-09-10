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
    const { projectTitle, projectValue, currency, customScope } = body;

    if (!projectTitle || typeof projectTitle !== 'string' || projectTitle.trim() === '') {
      return NextResponse.json({ error: 'Judul proyek kontrak wajib diisi.' }, { status: 400 });
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

    const systemPrompt = `Anda adalah konsultan hukum kontrak kerja lepas (Surat Perjanjian Kerja / SPK) di Indonesia.
Berdasarkan judul proyek, estimasi nilai kontrak, dan ruang lingkup, berikan 2 hingga 3 usulan klausul kontrak yang seimbang dan melindungi hak kedua belah pihak.
Format respon HANYA berupa valid JSON array of objects tanpa markdown pembungkus di luar JSON, dengan struktur:
[
  { "title": "Judul Klausul (contoh: Hak Kekayaan Intelektual)", "content": "Isi detail klausul hukum..." }
]
PENTING: Jangan sertakan teks obrolan pembuka/penutup, dan jangan gunakan emoji apa pun.`;

    const userMessage = `Judul Proyek: ${projectTitle.trim()}
Nilai Proyek: ${currency || 'IDR'} ${projectValue || 0}
Catatan/Lingkup Tambahan: ${customScope || 'Standar pengerjaan profesional'}
Buatkan 2-3 klausul relevan dalam Bahasa Indonesia yang formal dan sah secara perdata.`;

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
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    // Zero out the key in memory
    rawApiKey = '';

    if (!openRouterResponse.ok) {
      const errBody = await openRouterResponse.text();
      console.error('OpenRouter contract completion error:', errBody);
      return NextResponse.json(
        { error: 'OpenRouter gagal memproses saran klausul. Periksa kuota atau validitas API Key Anda.' },
        { status: 502 }
      );
    }

    const completionData = await openRouterResponse.json();
    const rawContent = completionData.choices?.[0]?.message?.content?.trim() || '[]';

    // Parse JSON safely even if wrapped in markdown code fence
    let cleanedJson = rawContent;
    if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsedClauses: Array<{ title: string; content: string }> = [];
    try {
      parsedClauses = JSON.parse(cleanedJson);
    } catch {
      console.error('Failed to parse clauses JSON from model response:', rawContent);
      return NextResponse.json(
        { error: 'Gagal memformat klausul dari model AI.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clauses: parsedClauses,
      model: modelToUse,
    });
  } catch (error) {
    console.error('Error suggesting contract clauses:', error);
    return NextResponse.json({ error: 'Gagal mengusulkan klausul kontrak.' }, { status: 500 });
  }
}
