"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "سلام! من دستیار هوش مصنوعی لینگوفم هستم. چطور می‌تونم کمکت کنم؟",
  timestamp: Date.now(),
};

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // TODO: Connect to AI API token
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "این یک پاسخ نمونه است. به زودی با هوش مصنوعی واقعی متصل می‌شود.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-lg mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[var(--dash-text)]">
            دستیار هوش مصنوعی
          </h1>
          <p className="text-xs text-[var(--dash-muted)]">
            آماده پاسخگویی
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "assistant" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)]"
                  : "bg-[var(--hover-bg-strong)]"
              }`}>
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-[var(--dash-text)]" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-[var(--dash-sides)]/80 backdrop-blur-xl text-[var(--dash-text)] rounded-tl-md shadow-lg ring-1 ring-white/5"
                  : "bg-gradient-to-l from-[var(--light-purple)] to-[var(--dark-purple)] text-white rounded-tr-md shadow-lg"
              }`}>
              <p>{msg.content}</p>
              <span
                className={`block text-[10px] mt-1.5 ${
                  msg.role === "assistant"
                    ? "text-[var(--dash-muted)]"
                    : "text-white/60"
                }`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--dash-sides)]/80 backdrop-blur-xl px-4 py-3 rounded-2xl rounded-tl-md shadow-lg ring-1 ring-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--dash-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--dash-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--dash-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-2">
        <div className="flex items-end gap-2 bg-[var(--dash-sides)]/80 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/5 p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="پیامت رو بنویس..."
            rows={1}
            className="flex-1 bg-transparent text-[var(--dash-text)] placeholder-[var(--dash-muted)] text-sm px-3 py-2.5 resize-none focus:outline-none max-h-32"
            style={{ direction: "rtl" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
