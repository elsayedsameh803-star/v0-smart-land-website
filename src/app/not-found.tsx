"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-surface-900 mb-4">404</h1>
        <p className="text-xl text-surface-500 mb-8">Page not found</p>
        <Link
          href="/en"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}