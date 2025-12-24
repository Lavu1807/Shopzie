"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">Me-Shopz</div>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">
              Home
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-indigo-600">
              Login
            </Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Me-Shopz
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your secure e-commerce platform with modern design and advanced security features
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Login Now
            </Link>
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              JWT-based authentication with refresh tokens and secure password hashing
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast & Optimized</h3>
            <p className="text-gray-600">
              Database indexed queries and optimized API endpoints for lightning-fast performance
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Rate Limited</h3>
            <p className="text-gray-600">
              Protected against brute force attacks with granular rate limiting policies
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
