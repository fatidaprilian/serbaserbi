import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, businessName, npwp, defaultCurrency } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email tidak valid.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        businessName: businessName?.trim() || null,
        npwp: npwp?.trim() || null,
        defaultCurrency: defaultCurrency || 'IDR',
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Gagal memproses pendaftaran.' }, { status: 500 });
  }
}
