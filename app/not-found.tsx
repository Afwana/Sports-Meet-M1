"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaHouse, FaTrophy } from "react-icons/fa6";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20">
          <FaTrophy className="text-3xl text-blue-500" />
        </div>

        {/* 404 */}
        <p className="text-8xl sm:text-9xl font-black tracking-tight text-white/10">
          404
        </p>

        <div className="-mt-12 relative">
          <h1 className="text-3xl sm:text-4xl font-bold">Page not found</h1>

          <p className="mt-4 text-sm sm:text-base leading-7 text-slate-400 max-w-md mx-auto">
            Looks like this page has left the competition. The page you’re
            looking for doesn’t exist or may have been moved.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <FaHouse />
              Go to Home
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Recreation Meet 2026</span>
            <span>•</span>
            <span>Competition Portal</span>
          </div>
        </div>
      </div>
    </main>
  );
}
