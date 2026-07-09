import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 className="text-8xl font-extrabold text-green-500/20">404</h1>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--dash-text)]">
          صفحه‌ای که به دنبال آن هستید پیدا نشد
        </h2>
        <p className="text-[var(--dash-muted)] max-w-md">
          ممکن است صفحه حذف شده باشد، آدرس آن تغییر کرده باشد، یا هرگز وجود نداشته باشد.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
      >
        بازگشت به داشبورد
      </Link>
    </div>
  );
}
