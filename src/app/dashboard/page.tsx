"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Code,
  Clock,
  IndianRupee,
  User,
  
  X,
  PlusCircle,
} from "lucide-react";

interface UserType {
  name: string;
  email: string;
  role: "developer" | "client" | "admin";
  technologies?: string[];
  experience?: number;
  charges?: number;
  photo?: string;
  developerType?: string;
}

interface ProjectType {
  _id: string;
  title: string;
  client: string;
  developer?: string;
  status?: string;
}

interface HireRequestType {
  _id: string;
  clientEmail: string;
  developerEmail: string;
  projectTitle?: string;
  status?: string;
}

interface NotificationType {
  _id: string;
  userEmail: string;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequestType[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserType & { password?: string } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "hires" | "notifications">("projects");

  // 📌 Client Requirement
  const [requirement, setRequirement] = useState("");
  const [addingRequirement, setAddingRequirement] = useState(false);

  // 📌 Developer Info Toggle
  const [showMore, setShowMore] = useState(false);

  // --- Fetch helper ---
  const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const existingHeaders = (options.headers || {}) as Record<string, string>;
    const headers = { ...existingHeaders, Authorization: `Bearer ${token}` } as HeadersInit;
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      // If server returns non-JSON, still return raw text
      console.error("❌ Invalid JSON from", url, text);
      return null;
    }
  };

  // --- Loader ---
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const verifyData = await fetchWithToken(`${API_URL}/api/auth/verify`);
      if (!verifyData?.user) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUser(verifyData.user);
      setEditForm(verifyData.user);

      // Projects
      if (verifyData.user.role === "admin") {
        const projectsData = await fetchWithToken(`${API_URL}/api/projects`);
        if (projectsData?.projects) setProjects(projectsData.projects);
      } else if (verifyData.user.role === "developer") {
        const projectsData = await fetchWithToken(
          `${API_URL}/api/projects?developerEmail=${encodeURIComponent(verifyData.user.email)}`
        );
        if (projectsData?.projects) setProjects(projectsData.projects);
      } else if (verifyData.user.role === "client") {
        const projectsData = await fetchWithToken(
          `${API_URL}/api/projects?clientEmail=${encodeURIComponent(verifyData.user.email)}`
        );
        if (projectsData?.projects) setProjects(projectsData.projects);
      }

      // Hire Requests
      if (["client", "developer"].includes(verifyData.user.role)) {
        const hireData = await fetchWithToken(
          `${API_URL}/api/hire?${verifyData.user.role}Email=${encodeURIComponent(verifyData.user.email)}`
        );
        if (hireData?.requests) setHireRequests(hireData.requests);
      }

      // Notifications
      const notifData = await fetchWithToken(
        `${API_URL}/api/notifications?email=${encodeURIComponent(verifyData.user.email)}`
      );
      if (notifData?.notifications) setNotifications(notifData.notifications);
    } catch (err) {
      console.error("❌ Dashboard error:", err);
      toast.error("❌ Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // --- Profile actions ---
  const saveProfile = async () => {
    if (!editForm) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          // For arrays (technologies) convert to JSON string so server can handle it
          if (Array.isArray(val)) formData.append(key, JSON.stringify(val));
          else formData.append(key, String(val));
        }
      });
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` } as HeadersInit,
        body: formData,
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setEditForm(data.user);
        setIsEditOpen(false);
        toast.success("✅ Profile updated!");
      } else {
        toast.error("❌ Failed to update profile");
      }
    } catch (err) {
      console.error("❌ Save profile error:", err);
      toast.error("❌ Something went wrong");
    }
  };

  const deleteProfile = async () => {
    if (!confirm("⚠️ Are you sure you want to delete your profile?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/delete-profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` } as HeadersInit,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Profile deleted");
        localStorage.removeItem("token");
        router.push("/register");
      } else toast.error("❌ Failed to delete profile");
    } catch (err) {
      console.error("❌ Delete profile error:", err);
      toast.error("❌ Something went wrong");
    }
  };

  // --- Client Requirement ---
  const submitRequirement = async () => {
    if (!requirement.trim()) return toast.error("Requirement cannot be empty");
    try {
      setAddingRequirement(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: requirement.trim(), clientEmail: user?.email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Requirement added!");
        setRequirement("");
        loadDashboard();
      } else toast.error("❌ Failed to add requirement");
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong");
    } finally {
      setAddingRequirement(false);
    }
  };

  // --- Hire actions ---
  const acceptHire = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/hire`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: id, action: "accept" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Request accepted");
        loadDashboard();
      } else toast.error("❌ " + (data.message || "Failed to accept"));
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to accept request");
    }
  };

  const rejectHire = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/hire`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: id, action: "reject" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("❌ Request rejected");
        loadDashboard();
      } else toast.error("❌ " + (data.message || "Failed to reject"));
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to reject request");
    }
  };

  const cancelHire = async (id: string) => {
    if (!confirm("⚠️ Cancel this hire request?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/hire/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` } as HeadersInit,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("🗑️ Request cancelled");
        loadDashboard();
      } else toast.error("❌ " + (data.message || "Failed to cancel"));
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to cancel request");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login</div>;

  return (
    <>
      <Header />

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white mt-20">
        {/* Mobile Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed flex top-24 right-2 z-40 p-2 mr-2 bg-emerald-500 text-white rounded-lg shadow"
          aria-label="Open menu"
        >
          <User/>
          Profile
        </button>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <h2 className="text-lg mb-4">Welcome, {user.name}! 👋</h2>

          {/* Client Requirement Form */}
          {user.role === "client" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" /> Add Requirement
              </h3>
              <textarea
                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                rows={3}
                placeholder="Describe your project requirement..."
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
              <div className="flex gap-2 justify-end mt-3">
                <button
                  onClick={() => setRequirement("")}
                  className="px-3 py-2 rounded bg-gray-300 text-black"
                >
                  Clear
                </button>
                <button
                  onClick={submitRequirement}
                  disabled={addingRequirement}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  {addingRequirement ? "Adding..." : "Submit Requirement"}
                </button>
              </div>
            </section>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded ${activeTab === "projects" ? "bg-emerald-500 text-black" : "bg-gray-700 text-white"}`}
            >
              📂 Projects
            </button>
            <button
              onClick={() => setActiveTab("hires")}
              className={`px-4 py-2 rounded ${activeTab === "hires" ? "bg-emerald-500 text-black" : "bg-gray-700 text-white"}`}
            >
              💼 Hire Requests
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 rounded ${activeTab === "notifications" ? "bg-emerald-500 text-black" : "bg-gray-700 text-white"}`}
            >
              🔔 Notifications
            </button>
          </div>

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <h3 className="font-bold mb-4">Active Projects</h3>
              {projects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                projects.map((p) => (
                  <div key={p._id} className="p-3 border-b last:border-none dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-sm">Client: {p.client}</p>
                        {p.developer && <p className="text-sm">Developer: {p.developer}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-200 dark:bg-purple-600 px-2 py-1 rounded">{p.status || "open"}</span>
                        <div className="mt-2">
                          <Link href={`/projects/${p._id}`} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* Hires Tab */}
          {activeTab === "hires" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <h3 className="font-bold mb-4">Hire Requests</h3>

              {hireRequests.filter((r) => !r.status || r.status === "pending").length === 0 ? (
                <p>No pending hire requests</p>
              ) : (
                hireRequests
                  .filter((r) => !r.status || r.status === "pending")
                  .map((r) => (
                    <div key={r._id} className="p-3 border-b last:border-none dark:border-gray-700">
                      <p className="font-semibold">{r.projectTitle || "Untitled"}</p>
                      <p className="text-xs">Client: {r.clientEmail}</p>
                      <p className="text-xs">Developer: {r.developerEmail}</p>
                      <p className="text-xs text-yellow-500 font-semibold">Status: Pending</p>

                      {/* Developer Actions */}
                      {user?.role === "developer" && (
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => acceptHire(r._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-400 text-white rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectHire(r._id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Client Cancel */}
                      {user?.role === "client" && (
                        <div className="mt-3">
                          <button
                            onClick={() => cancelHire(r._id)}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-400 text-white rounded"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </section>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <h3 className="font-bold mb-4">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-sm">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-2 mb-2 bg-white dark:bg-gray-700 rounded">
                    {n.message}
                  </div>
                ))
              )}
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside
          className={`fixed inset-0 md:static md:w-80 bg-gray-50 dark:bg-gray-800 border-t md:border-l md:border-t-0 p-6 transform transition-transform duration-300 z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Close Button on Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 bg-red-500 text-white rounded"
            aria-label="Close menu"
          >
            <X />
          </button>

          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-green-500 flex items-center justify-center text-3xl text-white shadow">
              {user.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photo} alt="Profile" className="w-24 h-24 object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <h3 className="mt-2 font-bold">{user.name}</h3>
            <p className="text-sm mt-1 text-gray-400">{user.email}</p>
            <span className="text-l bg-green-200 dark:bg-gray-600 px-2 py-1 rounded mt-2 inline-block">{user.role}</span>
          </div>

          {/* Short developer preview + See More */}
          {user.role === "developer" && (
            <div className="mt-6">
              {!showMore ? (
                <>
                  <div className="bg-gray-700 p-4 rounded-lg shadow mb-3 text-left text-white">
                    <h4 className="text-sm">Skills</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.technologies && user.technologies.length > 0 ? (
                        user.technologies.slice(0, 4).map((t, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-blue-600 text-white text-xs">{t}</span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-300">N/A</span>
                      )}
                      {user.technologies && user.technologies.length > 4 && (
                        <span className="px-2 py-1 rounded-full bg-gray-600 text-gray-200 text-xs">+{user.technologies.length - 4}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMore(true)}
                    className="w-full py-2 bg-blue-500 text-white rounded"
                  >
                    See More Details
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-gray-700 p-4 rounded-lg shadow flex items-center gap-4 mb-4">
                    <User className="text-emerald-400 w-6 h-6" />
                    <div>
                      <h3 className="text-sm text-white">Developer Type</h3>
                      <p className="font-semibold">{user.developerType || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg shadow mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="text-blue-500 w-6 h-6" />
                      <h3 className="text-sm text-white">Skills</h3>
                    </div>
                    {user.technologies && user.technologies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.technologies.map((tech, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white font-medium shadow-sm">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-400">N/A</p>
                    )}
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg shadow flex items-center gap-4 mb-4">
                    <Clock className="text-yellow-400 w-6 h-6" />
                    <div>
                      <h3 className="text-sm text-white">Experience</h3>
                      <p className="font-semibold">{user.experience || 0} yrs</p>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg shadow flex items-center gap-4">
                    <IndianRupee className="text-green-400 w-6 h-6" />
                    <div>
                      <h3 className="text-sm text-white">Charges</h3>
                      <p className="font-semibold">₹{user.charges || 0}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMore(false)}
                    className="mt-4 w-full py-2 bg-gray-500 text-white rounded"
                  >
                    Hide Details
                  </button>
                </>
              )}
            </div>
          )}

          {/* Admin Links */}
          {user.role === "admin" && (
            <div className="mt-6 space-y-2">
              <Link href="/admin/users" className="block bg-blue-500 text-white p-2 rounded">
                Manage Users
              </Link>
              <Link href="/admin/projects" className="block bg-blue-500 text-white p-2 rounded">
                Manage Projects
              </Link>
              <Link href="/admin/notifications" className="block bg-blue-500 text-white p-2 rounded">
                Manage Notifications
              </Link>
            </div>
          )}

          {/* Edit / Delete */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={() => setIsEditOpen(true)} className="bg-blue-500 text-white p-2 rounded">Edit Profile</button>
            <button onClick={deleteProfile} className="bg-red-600 text-white p-2 rounded">Delete Account</button>
          </div>
        </aside>
      </div>

      <Footer />

      {/* Edit Profile Modal */}
      {isEditOpen && editForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-b-xl w-full max-w-md shadow-lg p-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Edit Profile</h2>

            {/* Profile Picture */}
            <div className="mb-6 text-center">
              <div className="relative w-28 h-28 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    photoFile ? URL.createObjectURL(photoFile) : editForm.photo || "/default-avatar.png"
                  }
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 shadow-md"
                />
                <label htmlFor="photoUpload" className="absolute bottom-2 right-2 bg-emerald-500 hover:bg-emerald-400 text-black p-2 rounded-full cursor-pointer shadow-md transition">
                  ✏️
                </label>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              {/* Developer-specific fields */}
              {editForm.role === "developer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Developer Type</label>
                    <input
                      className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={editForm.developerType || ""}
                      onChange={(e) => setEditForm({ ...editForm, developerType: e.target.value })}
                      placeholder="Frontend, Backend, Fullstack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Technologies</label>
                    <input
                      className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={(editForm.technologies || []).join(", ")}
                      onChange={(e) =>
                        setEditForm({ ...editForm, technologies: e.target.value.split(",").map((s) => s.trim()) })
                      }
                      placeholder="e.g. React, Node.js"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={editForm.experience ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Charges (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={editForm.charges ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, charges: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Leave empty to keep current password"
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg bg-gray-400 text-black hover:bg-gray-500">Cancel</button>
              <button onClick={saveProfile} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
