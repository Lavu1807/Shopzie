"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  const handleSwitchRole = async (newRole: string) => {
    setSwitchingRole(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch role");
      }

      const data = await response.json();
      setUser(data.user);
      setShowRoleModal(false);
      alert(`✅ Successfully switched to ${newRole}!`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSwitchingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">Me-Shopz</div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-indigo-600 font-semibold">
              Dashboard
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-indigo-600">
              Products
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
              Cart
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-indigo-600">
              Orders
            </Link>
            <div className="text-gray-700">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back, {user?.name}! You're successfully logged in.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4 mb-6">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="ml-2 text-gray-600">{user?.name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">{user?.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Role:</span>
              <span className="ml-2 text-gray-600 capitalize inline-block bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                {user?.role}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">User ID:</span>
              <span className="ml-2 text-gray-600 font-mono text-sm">{user?.id}</span>
            </div>
          </div>
          <button
            onClick={() => setShowRoleModal(true)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Switch to {user?.role === "customer" ? "Shopkeeper" : "Customer"}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {user?.role === "shopkeeper" && (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">Manage Products</h3>
              <p className="text-gray-600 mb-4">Add, edit, or remove products</p>
              <Link
                href="/shopkeeper/products"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Go to Products
              </Link>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2">Browse Products</h3>
            <p className="text-gray-600 mb-4">Explore our catalog</p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              View Products
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">My Cart</h3>
            <p className="text-gray-600 mb-4">View your items</p>
            <Link
              href="/cart"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              View Cart
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-gray-600 mb-4">Track your orders</p>
            <Link
              href="/orders"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              View Orders
            </Link>
          </div>
        </div>
      </main>
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Switch Account Type</h2>
            <p className="text-gray-600 mb-6">
              You are currently a <span className="font-semibold capitalize">{user?.role}</span>. 
              Switch to become a <span className="font-semibold capitalize">{user?.role === "customer" ? "shopkeeper" : "customer"}</span>?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                {user?.role === "customer"
                  ? "🏪 As a shopkeeper, you can upload products, manage inventory, and receive orders from customers."
                  : "🛍️ As a customer, you can browse products, add items to cart, and place orders."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSwitchRole(user?.role === "customer" ? "shopkeeper" : "customer")}
                disabled={switchingRole}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {switchingRole ? "Switching..." : "Switch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
