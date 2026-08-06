import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';

const USER_SETTINGS_SELECT_FIELDS = {
  id: users.id,
  email: users.email,
  name: users.name,
  businessName: users.businessName,
  npwp: users.npwp,
  phone: users.phone,
  address: users.address,
  logoUrl: users.logoUrl,
  defaultCurrency: users.defaultCurrency,
  defaultNotes: users.defaultNotes,
};

export async function GET() {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const [user] = await db
      .select({
        ...USER_SETTINGS_SELECT_FIELDS,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, businessName, npwp, phone, address, logoUrl, defaultCurrency, defaultNotes } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong.' }, { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(name && { name: name.trim() }),
        businessName: businessName !== undefined ? businessName.trim() || null : undefined,
        npwp: npwp !== undefined ? npwp.trim() || null : undefined,
        phone: phone !== undefined ? phone.trim() || null : undefined,
        address: address !== undefined ? address.trim() || null : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl.trim() || null : undefined,
        defaultCurrency: defaultCurrency || 'IDR',
        defaultNotes: defaultNotes !== undefined ? defaultNotes.trim() || null : undefined,
      })
      .where(eq(users.id, userId))
      .returning(USER_SETTINGS_SELECT_FIELDS);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan.' }, { status: 500 });
  }
}
