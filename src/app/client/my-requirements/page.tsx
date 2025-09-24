"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function MyRequirements() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const token = Cookies.get("token") || "";
  const socketRef = useRef<any>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    axios.get(`${API_URL}/api/requirements`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        // optionally filter to only current client's ones on frontend:
        const rawUser = JSON.parse(Cookies.get("user") || "{}");
        const myId = rawUser._id || rawUser.id;
        setRequirements(res.data.filter((r: any) => String(r.client?._id || r.client) === String(myId)));
      })
      .catch(console.error);

    socketRef.current = io(API_URL, { auth: { token } });

    socketRef.current.on("requirementUpdated", (updated: any) => {
      // If this is my requirement update, show change
      const rawUser = JSON.parse(Cookies.get("user") || "{}");
      const myId = rawUser._id || rawUser.id;
      if (String(updated.client?._id || updated.client) === String(myId)) {
        setRequirements((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        toast.success("Your requirement was updated");
      }
    });

    return () => socketRef.current.disconnect();
  }, [token]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white mt-20">
      <h1 className="text-2xl font-bold mb-4">My Requirements</h1>
      <div className="space-y-4">
        {requirements.map((r) => (
          <div key={r._id} className="bg-gray-800 p-4 rounded">
            <h2 className="font-semibold">{r.title}</h2>
            <p className="text-sm text-gray-300">{r.description}</p>
            <p className="text-xs text-gray-400 mt-2">Status: {r.status}</p>
            {r.status === "accepted" && <p className="text-sm text-green-300">Accepted by {r.developer?.name}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
