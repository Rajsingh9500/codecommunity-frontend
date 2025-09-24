"use client";
import React, {
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import { UserType, MessageType, UnreadMessageType } from "@/types/chat";

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
    className={`${getAvatarColor(name ?? "")} rounded-full flex items-center justify-center text-white font-bold`}
    style={{ width: size, height: size, minWidth: size, minHeight: size }}
    aria-hidden
  >
    {(name || "U").charAt(0).toUpperCase()}
  </div>
);

/* ---------------- Helpers: normalize ids & shapes ---------------- */
const normalizeId = (id?: any) => {
  if (id == null) return "";
  // handle objects like { _id: '...', id: '...' }
  if (typeof id === "object") return String(id._id ?? id.id ?? "").trim().toLowerCase();
  return String(id).trim().toLowerCase();
};

const senderIdOf = (msg: any) => {
  if (!msg) return "";
  if (msg.sender) {
    if (typeof msg.sender === "string") return msg.sender;
    return msg.sender._id ?? msg.sender.id ?? msg.sender;
  }
  if (msg.from) {
    if (typeof msg.from === "string") return msg.from;
    return msg.from._id ?? msg.from.id ?? msg.from;
  }
  return msg.userId ?? "";
};

/* Normalize incoming message to your MessageType shape */
const normalizeMessage = (raw: any): MessageType => {
  const senderObj =
    raw.sender && typeof raw.sender === "object"
      ? { _id: raw.sender._id ?? raw.sender.id ?? String(raw.sender), name: raw.sender.name ?? "User", role: raw.sender.role ?? "client" }
      : { _id: raw.sender ?? raw.from ?? raw.userId ?? "unknown", name: raw.senderName ?? raw.name ?? "User", role: raw.sender?.role ?? "client" };

  const receiverObj =
    raw.receiver && typeof raw.receiver === "object"
      ? { _id: raw.receiver._id ?? raw.receiver.id ?? String(raw.receiver), name: raw.receiver.name ?? "User", role: raw.receiver.role ?? "client" }
      : { _id: raw.receiver ?? raw.to ?? "unknown", name: raw.receiverName ?? "User", role: "client" };

  return {
    _id: raw._id ?? raw.id ?? String(Date.now()),
    sender: { _id: String(senderObj._id), name: String(senderObj.name), role: String(senderObj.role) },
    receiver: { _id: String(receiverObj._id), name: String(receiverObj.name), role: String(receiverObj.role) },
    message: raw.message ?? raw.text ?? "",
    timestamp: raw.timestamp ?? raw.createdAt ?? new Date().toISOString(),
    delivered: raw.delivered ?? raw.delivered === undefined ? false : raw.delivered,
    read: raw.read ?? raw.read === undefined ? false : raw.read,
  };
};

/* ---------------- Main Component ---------------- */
export default function ChatWithSidebar() {
  /* ---- current user (from cookie) ---- */
  const cookieUser = (() => {
    try {
      return JSON.parse(Cookies.get("user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUserId = cookieUser._id ?? cookieUser.id ?? cookieUser.userId ?? "";
  const currentUserName = cookieUser.name ?? "You";
  const token = Cookies.get("token") || "";

  /* ---- state ---- */
  const [users, setUsers] = useState<UserType[]>([]);
  const [receiver, setReceiver] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  /* ---- socket connection ---- */
  useEffect(() => {
    if (!token || socketRef.current) return;
    const socket = io("http://localhost:5001", { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });

    socket.on("userOnline", (uid: string) =>
      setOnlineUsers((prev) => [...new Set([...prev, uid])])
    );
    socket.on("userOffline", (uid: string) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== uid))
    );

    socket.on("receiveMessage", (rawMsg: any) => {
      const msg = normalizeMessage(rawMsg);
      // append to messages if open chat includes it
      if (receiver && (normalizeId(msg.sender._id) === normalizeId(receiver._id) || normalizeId(msg.receiver._id) === normalizeId(receiver._id))) {
        setMessages((p) => [...p, msg]);
      }
      // update sidebar preview and unread counts
      setUsers((prev) =>
        prev.map((u) =>
          u._id === msg.sender._id || u._id === msg.receiver._id
            ? {
                ...u,
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                // if chat is open for this user, unread = 0; otherwise increment
                unreadCount:
                  receiver && receiver._id === u._id ? 0 : (u.unreadCount || 0) + 1,
              }
            : u
        )
      );
    });

    socket.on("typing", ({ from }: { from: string }) => {
      if (receiver && normalizeId(from) === normalizeId(receiver._id)) setIsTyping(true);
    });
    socket.on("stopTyping", ({ from }: { from: string }) => {
      if (receiver && normalizeId(from) === normalizeId(receiver._id)) setIsTyping(false);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, receiver]);

  /* ---- fetch users (sidebar) ---- */
  useEffect(() => {
    if (!token) return;
    axios
      .get<UserType[]>("http://localhost:5001/api/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // ensure unreadCount, lastMessageTime exist
        const normalized = (res.data || []).map((u) => ({
          ...u,
          lastMessage: u.lastMessage ?? null,
          lastMessageTime: u.lastMessageTime ?? null,
          unreadCount: u.unreadCount ?? 0,
        }));
        setUsers(normalized);
      })
      .catch((e) => console.error("fetch users err", e));
  }, [token]);

  /* ---- load messages for a conversation ---- */
  const loadMessages = (u: UserType) => {
    setReceiver(u);
    if (!token) return;
    axios
      .get<any[]>(`http://localhost:5001/api/chat/messages/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const normalized = (res.data || []).map(normalizeMessage);
        setMessages(normalized);
        // mark read in UI & server
        setUsers((prev) => prev.map((usr) => (usr._id === u._id ? { ...usr, unreadCount: 0 } : usr)));
        socketRef.current?.emit("readMessages", u._id);
      })
      .catch((e) => console.error("fetch messages err", e));
  };

  /* ---- send message (optimistic push) ---- */
  const sendMessage = () => {
    if (!socketRef.current || !receiver || !input.trim()) return;
    const localMsg: MessageType = {
      _id: `local-${Date.now()}`,
      sender: { _id: currentUserId, name: currentUserName, role: "client" },
      receiver: { _id: receiver._id, name: receiver.name, role: receiver.role },
      message: input.trim(),
      timestamp: new Date().toISOString(),
      delivered: false,
      read: false,
    };
    setMessages((p) => [...p, localMsg]);
    // update sidebar preview for receiver
    setUsers((prev) =>
      prev.map((u) =>
        u._id === receiver._id
          ? { ...u, lastMessage: localMsg.message, lastMessageTime: localMsg.timestamp }
          : u
      )
    );
    // send to server
    socketRef.current.emit("sendMessage", { receiver: receiver._id, message: input.trim() });
    setInput("");
    socketRef.current.emit("stopTyping", { to: receiver._id });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socketRef.current || !receiver) return;
    socketRef.current.emit("typing", { to: receiver._id });
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit("stopTyping", { to: receiver._id });
      typingTimeoutRef.current = null;
    }, 1000);
  };

  /* ---- auto-scroll messages ---- */
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 60);
  }, [messages]);

  /* ---- small debug logs to help verify IDs (remove in prod) ---- */
  useEffect(() => {
    if (messages.length) {
      console.log("currentUserId(normalized):", normalizeId(currentUserId));
      console.log("first message sender:", messages[0]?.sender?._id, "normalized:", normalizeId(messages[0]?.sender?._id));
    }
  }, [messages, currentUserId]);

  /* ---- format time ---- */
  const fmtTime = (ts?: string | null) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`${receiver ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 bg-gray-800 border-r border-gray-700 p-4`}>
        <h2 className="text-lg font-bold mb-4">Chats</h2>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            return (
              <button
                key={u._id}
                onClick={() => loadMessages(u)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${receiver?._id === u._id ? "bg-gray-700" : ""}`}
              >
                <div className="relative">
                  <LetterAvatar name={u.name} size={40} />
                  {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-800" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{u.name}</p>
                    <span className="text-xs text-gray-400">{u.lastMessageTime ? fmtTime(u.lastMessageTime) : ""}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400 truncate">{u.lastMessage ?? "No messages yet"}</p>
                    {u.unreadCount && u.unreadCount > 0 && (
                      <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">{u.unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat column */}
      <main className={`flex-1 ${receiver ? "flex" : "hidden md:flex"} flex-col min-h-0`}>
        {receiver ? (
          <>
            {/* Header */}
            <header className="flex items-center bg-gray-800 p-4 border-b border-gray-700 flex-shrink-0">
              <button className="md:hidden rounded-full mr-3" onClick={() => setReceiver(null)}>
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>

              <div className="relative mr-3">
                <LetterAvatar name={receiver.name} size={40} />
                {onlineUsers.includes(receiver._id) && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-800" />}
              </div>

              <div>
                <h2 className="font-semibold">{receiver.name}</h2>
                <p className="text-xs text-gray-400">{isTyping ? "typing..." : onlineUsers.includes(receiver._id) ? "Online" : "Offline"}</p>
              </div>
            </header>

            {/* Messages (scrollable) */}
            <div ref={messagesRef} className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
              {messages.map((msg) => {
                const isSender = normalizeId(msg.sender._id) === normalizeId(currentUserId);

                return (
                  <div key={msg._id} className={`w-full flex ${isSender ? "justify-end" : "justify-start"}`}>
                    {/* Other user (left) */}
                    {!isSender && (
                      <div className="flex items-start gap-3 max-w-[75%]">
                        <LetterAvatar name={msg.sender.name} size={36} />
                        <div className="relative">
                          <div className="px-4 py-2 rounded-2xl bg-gray-700 text-white break-words shadow">
                            <p className="text-sm">{msg.message}</p>
                            <div className="text-[10px] text-gray-300 mt-1 text-right">{fmtTime(msg.timestamp)}</div>
                          </div>
                          <span style={{ position: "absolute", left: -8, bottom: 6, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid #374151" }} />
                        </div>
                      </div>
                    )}

                    {/* Current user (right) */}
                    {isSender && (
                      <div className="relative max-w-[75%] text-right">
                        <div className="inline-block px-4 py-2 rounded-2xl bg-green-600 text-white break-words shadow text-left">
                          <p className="text-sm">{msg.message}</p>
                          <div className="text-[10px] text-gray-200 mt-1 text-right">{fmtTime(msg.timestamp)}</div>
                        </div>
                        <span style={{ position: "absolute", right: -8, bottom: 6, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "8px solid #16a34a" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2 flex-shrink-0">
              <input value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} className="flex-1 p-2 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none" placeholder="Write something..." />
              <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600">Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-400">Select a user to start chatting</div>
        )}
      </main>
    </div>
  );
}
