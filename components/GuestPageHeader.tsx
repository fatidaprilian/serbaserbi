import Link from "next/link";

interface GuestPageHeaderProps {
  title: string;
  subtitle: string;
}

// minimal: shared header with back button for guest generator pages
export default function GuestPageHeader({ title, subtitle }: GuestPageHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
          aria-label="Kembali ke beranda"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
