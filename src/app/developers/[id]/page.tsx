// app/developers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Laptop,
  Clock,
  IndianRupee,
  Folder,
  Star,
} from "lucide-react";
import DeveloperHireSection from "../[id]/DeveloperHireSection";

interface DeveloperType {
  _id: string;
  name: string;
  email: string;
  role: "developer" | "client" | "admin";
  technologies?: string[];
  experience?: number;
  charges?: number;
}

interface ProjectType {
  _id: string;
  title: string;
  status: string;
}

interface ReviewType {
  _id: string;
  client: { name: string; email: string };
  rating: number;
  comment: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function DeveloperIdPage() {
  const { id } = useParams();
  const [developer, setDeveloper] = useState<DeveloperType | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Fetch developer, projects, reviews, and currentUser
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [devRes, projRes, revRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/developers/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/projects?developer=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/auth/verify`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const devData = await devRes.json();
        const projData = await projRes.json();
        const revData = await revRes.json();
        const userData = await userRes.json();

        if (devData.success) setDeveloper(devData.developer);
        if (projData.success) setProjects(projData.projects);
        if (revData.success) {
          setReviews(revData.reviews);
          setAvgRating(Number(revData.avgRating));
        }
        if (userData.success) setCurrentUser(userData.user);
      } catch (err) {
        console.error("❌ Developer details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Submit a review (client)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ developerId: id, rating, comment }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Review submitted!");
        setReviews([...reviews, data.review]);
        setComment("");
        setRating(5);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("❌ Review submit error:", err);
    }
  };

  // ✅ Delete review (admin only)
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("❌ Delete review error:", err);
    }
  };

  if (loading) return <div className="text-white p-6">Loading developer...</div>;
  if (!developer) return <div className="text-white p-6">Developer not found</div>;

  return (
    <div className="bg-gray-950 text-white mt-20">
      <div className="mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        {/* ✅ Developer Info */}
        <div className="text-center bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
          <div className="w-28 h-28 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
            {developer.name.charAt(0)}
          </div>
          <h1 className="mt-4 text-3xl font-bold">{developer.name}</h1>
          <p className="text-gray-400">{developer.email}</p>
          <span className="inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold bg-emerald-500 text-black shadow">
            {developer.role.toUpperCase()}
          </span>

          {/* ✅ Professional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
              <Laptop className="text-emerald-400 w-6 h-6 mx-auto" />
              <h3 className="mt-2 text-sm text-gray-400">Technologies</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {developer.technologies?.length ? (
                  developer.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-full bg-emerald-600 text-white font-medium shadow-sm"
                    >
                      {tech.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">N/A</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
              <Clock className="text-emerald-400 w-6 h-6 mx-auto" />
              <h3 className="mt-2 text-sm text-gray-400">Experience</h3>
              <p className="font-semibold text-sm mt-1">{developer.experience || 0} yrs</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
              <IndianRupee className="text-emerald-400 w-6 h-6 mx-auto" />
              <h3 className="mt-2 text-sm text-gray-400">Charges</h3>
              <p className="font-semibold text-sm mt-1">₹{developer.charges || 0}</p>
            </div>
          </div>

          {/* ✅ Hire Section */}
          <DeveloperHireSection developer={developer} />
        </div>

        {/* ✅ Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-900 p-4 rounded text-center">
            <h3 className="text-xl font-bold">{projects.length}</h3>
            <p className="text-gray-400">Projects</p>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <h3 className="text-xl font-bold">{avgRating} / 5</h3>
            <p className="text-gray-400">Avg Rating</p>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <h3 className="text-xl font-bold">{reviews.length}</h3>
            <p className="text-gray-400">Reviews</p>
          </div>
        </div>

        {/* ✅ Projects */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Projects <Folder className="w-6 h-6 text-emerald-400" />
          </h2>
          {projects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p._id} className="p-3 bg-gray-900 rounded flex justify-between items-center">
                  <span>{p.title}</span>
                  <span
                    className={`px-3 py-1 rounded text-xs ${
                      p.status === "completed" ? "bg-emerald-500 text-black" : "bg-yellow-400 text-black"
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ Reviews */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Ratings & Reviews <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h2>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="p-3 mb-2 bg-gray-900 rounded flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {r.client.name} ({r.client.email})
                  </p>
                  <p className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= r.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-500"
                        }`}
                      />
                    ))}
                  </p>
                  <p>{r.comment}</p>
                </div>
                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    className="ml-4 px-3 py-1 bg-red-500 rounded text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}

          {/* ✅ Add Review Form (only clients) */}
          {currentUser?.role === "client" && (
            <form onSubmit={handleSubmitReview} className="mt-6">
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer w-6 h-6 ${
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
              <textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 mb-3"
              />
              <button
                type="submit"
                className="bg-emerald-500 text-black px-4 py-2 rounded hover:bg-emerald-400"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
