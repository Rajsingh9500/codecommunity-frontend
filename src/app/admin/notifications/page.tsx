"use client";

import { useEffect, useState } from "react";

interface NotificationType {
  _id: string;
  userEmail: string;
  message: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
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
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await fetchWithToken(
          `${API_URL}/api/admin/notifications?page=${page}&limit=20&search=${encodeURIComponent(search)}`
        );
        if (data?.success) {
          setNotifications(data.notifications);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("❌ Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [page, search]);

  const totalPages = Math.ceil(total / 20);

  // ✅ Delete notification
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const data = await fetchWithToken(`${API_URL}/api/admin/delete-notification`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (data.success) {
        setNotifications(notifications.filter((n) => n._id !== id));
        alert("Notification deleted ✅");
      } else {
        alert("Delete failed ❌");
      }
    } catch (err) {
      console.error("❌ Delete notification error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🔔 Manage All Notifications</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by user or message..."
        className="w-full md:w-1/3 p-2 mb-4 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-3 text-center">Loading...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={4} className="p-3 text-center">No notifications found.</td></tr>
            ) : (
              notifications.map((n) => (
                <tr key={n._id} className="border-b dark:border-gray-700">
                  <td className="p-3">{n.userEmail}</td>
                  <td className="p-3">{n.message}</td>
                  <td className="p-3">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(n._id)}
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
