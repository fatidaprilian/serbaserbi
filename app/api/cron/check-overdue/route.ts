import { NextResponse } from 'next/server';
import { checkAndProcessOverdueInvoices } from '@/lib/reminder-service';
import { auth } from '@/auth';

/**
 * Vercel Cron endpoint (GET) and Dashboard Manual Trigger endpoint (POST).
 * Automatically transitions overdue invoices and logs reminder notifications.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify Vercel Cron secret if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow logged-in user to trigger via browser GET
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
      const result = await checkAndProcessOverdueInvoices(session.user.id);
      return NextResponse.json({
        success: true,
        triggeredBy: 'session_user',
        ...result,
      });
    }

    // Cron execution across all tenants
    const result = await checkAndProcessOverdueInvoices();
    return NextResponse.json({
      success: true,
      triggeredBy: 'cron_scheduler',
      ...result,
    });
  } catch (error) {
    console.error('Error during overdue cron execution:', error);
    return NextResponse.json({ error: 'Gagal menjalankan cron pengingat jatuh tempo.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Authenticated dashboard user manual trigger
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await checkAndProcessOverdueInvoices(session.user.id);
    return NextResponse.json({
      success: true,
      triggeredBy: 'manual_dashboard',
      ...result,
    });
  } catch (error) {
    console.error('Error during manual overdue check:', error);
    return NextResponse.json({ error: 'Gagal memeriksa jatuh tempo.' }, { status: 500 });
  }
}
