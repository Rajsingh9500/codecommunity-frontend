"use client";

import { useEffect, useState } from "react";

interface ProjectType {
  _id: string;
  title: string;
  client: string;
  developer?: string;
  status: string;
  deadline?: string;
  requirements?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    const res = await fetch(url, { ...options, headers });
    return res.json();
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchWithToken(
          `${API_URL}/api/admin/projects?page=${page}&limit=20&search=${encodeURIComponent(search)}`
        );
        if (data?.success) {
          setProjects(data.projects);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("❌ Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [page, search]);

  const totalPages = Math.ceil(total / 20);

  // ✅ Delete project
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const data = await fetchWithToken(`${API_URL}/api/admin/delete-project`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (data.success) {
        setProjects(projects.filter((p) => p._id !== id));
        alert("Project deleted ✅");
      } else {
        alert("Delete failed ❌");
      }
    } catch (err) {
      console.error("❌ Delete project error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-6">📂 Manage All Projects</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title, client, or developer..."
        className="w-full md:w-1/3 p-2 mb-4 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Developer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Deadline</th>
              <th className="p-3 text-left">Requirements</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-3 text-center">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={7} className="p-3 text-center">No projects found.</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p._id} className="border-b dark:border-gray-700">
                  <td className="p-3 font-semibold">{p.title}</td>
                  <td className="p-3">{p.client}</td>
                  <td className="p-3">{p.developer || "Unassigned"}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                  <td className="p-3">{p.requirements || "—"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            ⬅ Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}
