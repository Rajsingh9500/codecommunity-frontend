"use client";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";

/* ---------------- Avatar util ---------------- */
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-green-600",
  "bg-red-600",
  "bg-purple-600",
  "bg-yellow-600",
  "bg-pink-600",
  "bg-indigo-600",
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const LetterAvatar = ({ name, size = 36 }: { name?: string; size?: number }) => (
  <div
    className={`${getAvatarColor(
      name ?? ""
    )} rounded-full flex items-center justify-center text-white font-bold`}
    style={{ width: size, height: size, minWidth: size, minHeight: size }}
    aria-hidden
  >
    {(name || "U").charAt(0).toUpperCase()}
  </div>
);

/* ---------------- types ---------------- */
type User = { _id: string; name: string };
type Msg = {
  _id?: string | number;
  message?: string;
  text?: string;
  timestamp?: string;
  sender?: any;
};

/* ---------------- Chat with Sidebar ---------------- */
export default function ChatWithSidebar() {
  // current user
  const cookieUser = (() => {
    try {
      return JSON.parse(Cookies.get("user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUserId =
    cookieUser._id ?? cookieUser.id ?? cookieUser.userId ?? "ankit-id";

  // sample users
  const [users] = useState<User[]>([
    { _id: "sakshi-id", name: "Sakshi" },
    { _id: "rahul-id", name: "Rahul" },
  ]);

  // selected chat + messages
  const [receiver, setReceiver] = useState<User | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    { _id: 1, message: "hello", sender: { _id: "sakshi-id", name: "Sakshi" } },
    { _id: 2, message: "hey sakshi", sender: { _id: "ankit-id", name: "Ankit" } },
    { _id: 3, message: "how are you?", sender: { _id: "sakshi-id", name: "Sakshi" } },
  ]);

  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    setTimeout(
      () => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }),
      50
    );
  }, [messages]);

  const getFromId = (m: Msg) =>
    typeof m.sender === "string" ? m.sender : m.sender?._id;

  const fmtTime = (ts?: string) =>
    ts
      ? new Date(ts).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const sendMessage = () => {
    if (!input.trim() || !receiver) return;
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now(),
        message: input,
        sender: { _id: currentUserId, name: "You" },
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`${
          receiver ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-72 bg-gray-800 border-r border-gray-700 p-4`}
      >
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setReceiver(u)}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700"
            >
              <LetterAvatar name={u.name} size={40} />
              <p className="font-semibold">{u.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 ${
          receiver ? "flex" : "hidden md:flex"
        } flex-col min-h-0`}
      >
        {receiver ? (
          <>
            {/* Header */}
            <div className="flex items-center bg-gray-800 p-4 border-b border-gray-700 flex-shrink-0">
              <button
                className="md:hidden rounded-full mr-3"
                onClick={() => setReceiver(null)}
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <LetterAvatar name={receiver.name} size={40} />
              <h2 className="ml-3 font-semibold">{receiver.name}</h2>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >
              {messages.map((msg, idx) => {
                const fromId = getFromId(msg);
                const isSender = String(fromId) === String(currentUserId);
                const authorName = msg.sender?.name ?? "User";

                return (
                  <div
                    key={msg._id ?? idx}
                    className={`w-full flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Other user */}
                    {!isSender && (
                      <div className="flex items-start gap-3 max-w-[75%]">
                        <LetterAvatar name={authorName} size={36} />
                        <div className="relative">
                          <div className="px-4 py-2 rounded-2xl bg-gray-700 text-white break-words shadow">
                            <p className="text-sm">{msg.message}</p>
                            <div className="text-[10px] text-gray-300 mt-1 text-right">
                              {fmtTime(msg.timestamp)}
                            </div>
                          </div>
                          <span
                            style={{
                              position: "absolute",
                              left: -8,
                              bottom: 6,
                              width: 0,
                              height: 0,
                              borderTop: "8px solid transparent",
                              borderBottom: "8px solid transparent",
                              borderRight: "8px solid #374151",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* You */}
                    {isSender && (
                      <div className="relative max-w-[75%] text-right">
                        <p className="text-xs text-gray-400 mb-1">You</p>
                        <div className="inline-block px-4 py-2 rounded-2xl bg-green-600 text-white break-words shadow text-left">
                          <p className="text-sm">{msg.message}</p>
                          <div className="text-[10px] text-gray-200 mt-1 text-right">
                            {fmtTime(msg.timestamp)}
                          </div>
                        </div>
                        <span
                          style={{
                            position: "absolute",
                            right: -8,
                            bottom: 6,
                            width: 0,
                            height: 0,
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                            borderLeft: "8px solid #16a34a",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none"
                placeholder="Write something..."
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
