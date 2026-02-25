import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-[#080808] min-h-screen flex items-center justify-center text-white">
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase">404</p>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="text-zinc-500 text-sm">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-4 text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-4">
          Back home
        </Link>
      </div>
    </main>
  );
}
