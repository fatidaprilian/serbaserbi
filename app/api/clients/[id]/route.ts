import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { clients } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address, country, isForeignHint } = body;

    const [updatedClient] = await db
      .update(clients)
      .set({
        ...(name && { name: name.trim() }),
        email: email !== undefined ? email.trim() || null : undefined,
        phone: phone !== undefined ? phone.trim() || null : undefined,
        address: address !== undefined ? address.trim() || null : undefined,
        country: country !== undefined ? country.trim() || 'Indonesia' : undefined,
        isForeignHint: isForeignHint !== undefined ? Boolean(isForeignHint) : undefined,
      })
      .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)))
      .returning();

    if (!updatedClient) {
      return NextResponse.json({ error: 'Klien tidak ditemukan atau akses ditolak.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Gagal memperbarui klien.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [deletedClient] = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)))
      .returning();

    if (!deletedClient) {
      return NextResponse.json({ error: 'Klien tidak ditemukan atau akses ditolak.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Gagal menghapus klien. Klien mungkin memiliki riwayat dokumen.' }, { status: 500 });
  }
}
