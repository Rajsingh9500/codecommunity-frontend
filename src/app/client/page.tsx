"use client";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function ClientPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const token = Cookies.get("token") || "";
  const socket = io("http://localhost:5001", { auth: { token } });

  const handlePost = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/requirements",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Requirement posted successfully!");
      setTitle("");
      setDescription("");
    } catch {
      toast.error("Failed to post requirement");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post Requirement</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 mb-3 border rounded bg-gray-900 text-white"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full p-2 mb-3 border rounded bg-gray-900 text-white"
      />
      <button
        onClick={handlePost}
        className="px-4 py-2 bg-blue-600 rounded text-white"
      >
        Post
      </button>
    </div>
  );
}
