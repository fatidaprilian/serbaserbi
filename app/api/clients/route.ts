import { NextResponse } from 'next/server';
import { db } from '@/db';
import { clients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const clientList = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));

    return NextResponse.json({ clients: clientList });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Gagal mengambil data klien.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, phone, address, country, isForeignHint } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Nama klien wajib diisi.' }, { status: 400 });
    }

    const [newClient] = await db
      .insert(clients)
      .values({
        userId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        country: country?.trim() || 'Indonesia',
        isForeignHint: Boolean(isForeignHint),
      })
      .returning();

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Gagal menambahkan klien.' }, { status: 500 });
  }
}
