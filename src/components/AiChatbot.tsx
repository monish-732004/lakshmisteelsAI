"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, Bot, User } from "lucide-react";
import { api } from "../utils/api";
import { useTranslation } from "../utils/LanguageContext";

interface AiChatbotProps {
  fileId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function AiChatbot({ fileId }: AiChatbotProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    t("chat.prompt.summarize"),
    t("chat.prompt.anomalies"),
    t("chat.prompt.averages"),
    t("chat.prompt.columns"),
  ];

  useEffect(() => {
    fetchHistory();
  }, [fileId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const history = await api.getChatHistory(fileId);
      if (history.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: t("chat.welcome"),
          },
        ]);
      } else {
        setMessages(history);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userText = text.trim();
    setInput("");
    
    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(fileId, userText);
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: res.reply,
        timestamp: res.timestamp,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat failure", err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: t("chat.error"),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Simple bold markdown parsing (**bold**)
    let parsed = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Simple inline code (`code`)
    parsed = parsed.replace(/`(.*?)`/g, "<code class='bg-slate-500/10 px-1 py-0.5 rounded text-xs font-mono'>$1</code>");
    // Newline splits
    return parsed.split("\n").map((line, idx) => (
      <p key={idx} dangerouslySetInnerHTML={{ __html: line }} className="min-h-[1em] mb-1 leading-relaxed" />
    ));
  };

  return (
    <div className="flex flex-col h-[580px] glass-card border border-card-border overflow-hidden rounded-2xl shadow-xl">
      {/* Sidebar Chat Header */}
      <div className="px-5 py-4 border-b border-card-border/50 bg-primary/5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="h-4.5 w-4.5 fill-current animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">{t("chat.title")}</h4>
          <span className="text-[10px] text-muted block leading-none">{t("chat.subtitle")}</span>
        </div>
      </div>

      {/* Messages Thread panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isAi = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isAi ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isAi ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                }`}
              >
                {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isAi
                    ? "bg-card-bg border border-card-border text-foreground rounded-tl-sm shadow-sm"
                    : "bg-primary text-white rounded-tr-sm"
                }`}
              >
                {parseMarkdown(msg.content)}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-card-bg border border-card-border text-muted rounded-tl-sm flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs">{t("chat.analyzing")}</span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggestion prompt list */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 py-2 border-t border-card-border/30 flex gap-2 flex-wrap justify-start">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1.5 bg-slate-500/5 hover:bg-primary/10 text-muted hover:text-primary rounded-lg text-[10px] font-semibold border border-card-border/50 transition cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input panel bar */}
      <div className="p-3 border-t border-card-border/50 bg-card-bg/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 glass-input px-3.5 py-2 text-xs focus:outline-none placeholder:text-muted/60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-8.5 w-8.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
