import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
      <h2 className="text-4xl font-bold text-slate-50 mb-4">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}