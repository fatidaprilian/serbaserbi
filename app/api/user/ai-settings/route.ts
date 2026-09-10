import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';
import { encryptApiKey, decryptApiKey, maskApiKey } from '@/lib/crypto-utils';

export async function GET() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const [user] = await db
      .select({
        encryptedKey: users.openrouterApiKeyEncrypted,
        preferredAiModel: users.preferredAiModel,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    let maskedKey: string | null = null;
    if (user.encryptedKey) {
      try {
        const decrypted = decryptApiKey(user.encryptedKey);
        maskedKey = maskApiKey(decrypted);
      } catch {
        maskedKey = 'sk-or-••••••••';
      }
    }

    return NextResponse.json({
      hasApiKey: Boolean(user.encryptedKey),
      maskedKey,
      preferredAiModel: user.preferredAiModel || 'meta-llama/llama-3.3-70b-instruct:free',
    });
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan AI.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { apiKey, preferredAiModel } = body;

    const updates: { openrouterApiKeyEncrypted?: string; preferredAiModel?: string } = {};

    if (preferredAiModel && typeof preferredAiModel === 'string') {
      updates.preferredAiModel = preferredAiModel.trim();
    }

    if (apiKey !== undefined) {
      if (typeof apiKey !== 'string' || apiKey.trim() === '') {
        return NextResponse.json({ error: 'API Key tidak boleh kosong.' }, { status: 400 });
      }

      const trimmedKey = apiKey.trim();

      // Validate key against OpenRouter official auth endpoint
      try {
        const testRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
          },
        });

        if (!testRes.ok) {
          return NextResponse.json(
            { error: 'API Key OpenRouter tidak valid atau ditolak oleh OpenRouter.' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Tidak dapat terhubung ke OpenRouter untuk validasi key.' },
          { status: 502 }
        );
      }

      updates.openrouterApiKeyEncrypted = encryptApiKey(trimmedKey);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning({
        encryptedKey: users.openrouterApiKeyEncrypted,
        preferredAiModel: users.preferredAiModel,
      });

    let maskedKey: string | null = null;
    if (updatedUser?.encryptedKey) {
      try {
        const decrypted = decryptApiKey(updatedUser.encryptedKey);
        maskedKey = maskApiKey(decrypted);
      } catch {
        maskedKey = 'sk-or-••••••••';
      }
    }

    return NextResponse.json({
      success: true,
      hasApiKey: Boolean(updatedUser?.encryptedKey),
      maskedKey,
      preferredAiModel: updatedUser?.preferredAiModel,
    });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan AI.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    await db
      .update(users)
      .set({ openrouterApiKeyEncrypted: null })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: 'API Key berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting AI settings:', error);
    return NextResponse.json({ error: 'Gagal menghapus API Key.' }, { status: 500 });
  }
}
