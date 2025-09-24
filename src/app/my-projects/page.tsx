"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface ProjectType {
  _id: string;
  projectTitle: string;
  description: string;
  requirements: string;
  amount: number;
  deadline: string;
  client: { name: string; email: string };
  status: "pending" | "accepted" | "rejected";
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/requirements/my-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data || []);
      } catch (err) {
        console.error("❌ Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="text-white mt-20 p-6">Loading projects...</div>;

  return (
    <div className="bg-gray-950 text-white min-h-screen mt-20 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">📂 My Projects</h1>

      {projects.length === 0 ? (
        <p className="text-center text-gray-400">No projects accepted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{proj.projectTitle}</h2>
              <p className="text-sm text-gray-400 mb-3">{proj.description}</p>

              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Client:</span> {proj.client?.name}</p>
                <p><span className="font-semibold">Budget:</span> ₹{proj.amount}</p>
                <p><span className="font-semibold">Deadline:</span>{" "}
                  {new Date(proj.deadline).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`${
                      proj.status === "accepted"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {proj.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
