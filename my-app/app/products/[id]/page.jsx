"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Product not found";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product?._id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      alert(`${quantity} item(s) added to cart!`);
      router.push("/cart");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add to cart";
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          {error || "Product not found"}
        </div>
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
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
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
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/products" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-12">
              {product.images && product.images[0] ? (
                <img
                  src={`http://localhost:5000${product.images[0]}`}
                  alt={product.name}
                  className="max-w-full max-h-96 object-contain"
                />
              ) : (
                <div className="text-9xl">📦</div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="mb-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="text-4xl font-bold text-indigo-600 mb-6">
                ${product.price.toFixed(2)}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                <span className={`px-4 py-2 rounded-lg font-semibold ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {product.stock > 0 ? `${product.stock} items in stock` : "Out of stock"}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller</h3>
                <p className="text-gray-600">{product.shopkeeper?.name || "Unknown"}</p>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold text-xl"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-20 text-center px-4 py-2 border border-gray-300 rounded-lg font-semibold text-xl"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="w-full bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg"
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
