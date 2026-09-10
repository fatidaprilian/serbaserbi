import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/currency-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'IDR';

    const rateData = await getExchangeRate(from, to);

    return NextResponse.json(rateData, {
      headers: {
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching currency exchange rate:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil kurs mata uang.' },
      { status: 500 }
    );
  }
}
