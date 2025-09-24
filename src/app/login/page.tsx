"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import ForgotPassword from "../forgot-password/page";



export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 👁️ Show/Hide password state
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/auth/login`,
        formData
      );
      const { token, user } = res.data;

      // ✅ Normalize user object → always store _id
      const normalizedUser = {
        _id: user._id ?? user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      Cookies.set("user", JSON.stringify(normalizedUser));
      Cookies.set("token", token);

      router.push("/chat"); // redirect to chat page
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 pt-20">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700 text-white"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Login</h2>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="mb-6 text-right">
          <Link href="../forgot-password" className="text-blue-400 hover:underline text-sm">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register Link */}
        <p className="text-center text-gray-400 mt-6 text-sm sm:text-base">
          Don’t have an account?{" "}
          <Link href="/register" className="text-green-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
