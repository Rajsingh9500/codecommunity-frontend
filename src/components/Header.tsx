"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Load user from localStorage on mount & listen to storage events
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  // Search handler
  const handleSearch = () => {
    alert(`Searching for: ${searchQuery}`);
    // Replace with real search logic
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between p-2">
        {/* Logo */}
        <div>
          <Link href="/">
            <Image
              src="/logos/CodeCommunity.png"
              alt="CodeCommunity Logo"
              width={200}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Desktop Menu (visible from lg breakpoint) */}
        <nav className="hidden lg:flex gap-6 text-gray-300 font-medium items-center">
          <Link href="/" className="hover:text-emerald-400">Home</Link>
          <Link href="/about" className="hover:text-emerald-400">About</Link>
          <Link href="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
          <Link href="/developers" className="hover:text-emerald-400">Developers</Link>
          <Link href="/chat" className="hover:text-emerald-400">Chat</Link>
          <Link href="/contact" className="hover:text-emerald-400">Contact</Link>

          {/* Search */}
          <div className="flex items-center border border-gray-600 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 bg-gray-800 text-white outline-none"
            />
            <button onClick={handleSearch} className="px-2">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-white font-medium">Hello, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-600 text-white rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 border border-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-black font-semibold rounded-md hover:shadow-lg">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle (visible below lg) */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile/Tablet Dropdown Menu */}
      <div
        className={`lg:hidden bg-black/90 backdrop-blur-md border-t border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-4 py-4 text-gray-200 font-medium">
          <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
          <Link href="/developers" onClick={() => setIsOpen(false)}>Developers</Link>
          <Link href="/chat" onClick={() => setIsOpen(false)}>Chat</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>

          {/* Search */}
          <div className="flex items-center border border-gray-600 rounded-md overflow-hidden w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 bg-gray-800 text-white outline-none w-full"
            />
            <button onClick={handleSearch} className="px-2">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {user ? (
            <>
              <span className="text-white">Hello, {user.name}</span>
              <button
                onClick={handleLogout}
                className="w-32 px-4 py-2 border border-red-600 text-white rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button className="w-32 px-4 py-2 border border-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                  Sign In
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <button className="w-32 px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-black font-semibold rounded-md hover:shadow-lg">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
