"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Laptop, Clock, IndianRupee, Star, PlusCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface DeveloperType {
  _id: string;
  name: string;
  email: string;
  role: "developer" | "client" | "admin";
  technologies?: string[];
  experience?: number;
  charges?: number;
  avgRating?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Requirement form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/developers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setDevelopers(data.developers);
      } catch (err) {
        console.error("❌ Fetch developers error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, []);

  const handlePostRequirement = async () => {
    const token = Cookies.get("token") || "";
    try {
      await axios.post(
        `${API_URL}/api/requirements`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Requirement posted successfully!");
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to post requirement");
    }
  };

  if (loading) return <div className="text-white p-6">Loading developers...</div>;

  return (
    <div className="bg-gray-950 text-white min-h-screen mt-20 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👨‍💻 Developers</h1>

        {/* Post Requirement Button (for Clients) */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg shadow"
        >
          <PlusCircle className="w-5 h-5" /> Post Requirement
        </button>
      </div>

      {developers.length === 0 ? (
        <p className="text-center text-gray-400">No developers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <div
              key={dev._id}
              className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition text-center"
            >
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
                {dev.name.charAt(0)}
              </div>

              {/* Info */}
              <h2 className="text-xl font-semibold mt-4">{dev.name}</h2>
              <p className="text-gray-400 text-sm">{dev.email}</p>

              {/* Details */}
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>
                    {dev.technologies?.length ? dev.technologies.join(", ") : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{dev.experience || 0} yrs</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  <span>₹{dev.charges || 0}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (dev.avgRating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-500"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-400 text-xs">
                    {dev.avgRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6">
                <Link
                  href={`/developers/${dev._id}`}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg shadow inline-block"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requirement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Post Requirement</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Requirement Title"
              className="w-full p-2 mb-3 border rounded bg-gray-800 text-white"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Requirement Description"
              className="w-full p-2 mb-3 border rounded bg-gray-800 text-white"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePostRequirement}
                className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-400 text-black font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
