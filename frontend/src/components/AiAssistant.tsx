import { Bot, Send, Sparkles, X, Loader2, RotateCcw, FileText, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  items?: Array<{ name: string; description: string; quantity: number; rate: number }>;
  paymentTerms?: string;
}

const starterPrompts = [
  {
    icon: Sparkles,
    label: "Create website redesign invoice",
    prompt: "Create an invoice for a 2 week website redesign project with UI design and frontend development line items.",
  },
  {
    icon: ShieldCheck,
    label: "Write GST payment terms",
    prompt: "Write professional payment terms and tax breakdown notes for a GST invoice.",
  },
  {
    icon: FileText,
    label: "Professional invoice tone",
    prompt: "Make this invoice notes and terms sound more professional for an enterprise corporate client.",
  },
];

export function AiAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Hi! I'm your AI Invoicing Assistant. Ask me to suggest line items, draft payment terms, calculate taxes, or craft professional client notes.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isLoading]);

  if (!user || !mounted) {
    return null;
  }

  const sendMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt || input).trim();
    if (!prompt || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgId, role: "user", text: prompt };

    setMessages((current) => [...current, userMsg]);
    if (!overridePrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await api.post<{
        items: Array<{ name: string; description: string; quantity: number; rate: number }>;
        notes: string;
        paymentTerms: string;
        qualityChecklist: string[];
      }>("/ai/invoice-assist", { prompt, currency: "USD" });

      if (response.success && response.data) {
        const itemText = response.data.items
          ? response.data.items
              .map((item) => `${item.name} (${item.quantity} × $${item.rate})`)
              .join(", ")
          : "";
        const termsText = response.data.paymentTerms ? ` Terms: ${response.data.paymentTerms}` : "";
        const notesText = response.data.notes ? ` Notes: ${response.data.notes}` : "";

        setMessages((current) => [
          ...current,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            text: `Here is what I generated:\n\n• Line Items: ${itemText || "Standard consulting services"}\n• ${termsText || "Net 15 terms apply."}\n${notesText}`,
            items: response.data.items,
            paymentTerms: response.data.paymentTerms,
          },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            text: "Suggested invoice structure: add a clear service title, split work into milestone deliverables, use Net 15 terms, include a polite late-payment note, and keep tax/discount lines separate for clarity.",
          },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          text: "I've structured a recommended invoice outline: title deliverables clearly, set Net 15 payment terms, and include tax ID notes.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        text: "Hi! I'm your AI Invoicing Assistant. Ask me to suggest line items, draft payment terms, calculate taxes, or craft professional client notes.",
      },
    ]);
  };

  return createPortal(
    <>
      {open && (
        <div
          className="fixed z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-primary/20 bg-card/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          style={{
            position: "fixed",
            right: "1.5rem",
            bottom: "6.5rem",
            left: "auto",
            top: "auto",
            insetInlineStart: "auto",
            insetInlineEnd: "1.5rem",
          }}
          data-purple-surface="ai-panel"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-border/80 bg-primary/10 px-4 py-3.5"
            data-purple-chip="ai-header"
          >
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30"
                data-purple-chip="ai-avatar"
              >
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-headline text-sm font-extrabold text-foreground">Invoisen AI</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                    <Zap className="h-2.5 w-2.5" /> 2.5 Flash
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">Invoice writing assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={handleResetChat}
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="max-h-96 min-h-[16rem] space-y-3.5 overflow-y-auto p-4 select-text">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-muted/70 text-foreground border border-border/60 shadow-sm"
                      : "bg-primary text-white shadow-md shadow-primary/20 font-medium"
                  }`}
                  data-purple-chat={message.role}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))}

            {/* Loading Neural Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Bot className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="rounded-2xl bg-muted/70 p-3.5 border border-border/60 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}

            {/* Quick Starter Prompts */}
            {!isLoading && messages.length <= 3 && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Suggested Prompts
                </p>
                {starterPrompts.map((item, idx) => {
                  const PromptIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      className="group flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5 text-left text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                      data-purple-chip="starter"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <PromptIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Form */}
          <div className="flex items-center gap-2 border-t border-border/60 bg-card/80 p-3 backdrop-blur-md">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              placeholder="Ask for invoice help..."
              className="rounded-xl border-border/80 bg-background/80 text-xs focus-visible:ring-primary shadow-inner"
            />
            <Button
              type="button"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 shrink-0 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-primary/30 transition-all disabled:opacity-50"
              onClick={() => sendMessage()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Floating Assistant FAB */}
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed z-50 h-14 w-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
        style={{
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          left: "auto",
          top: "auto",
          insetInlineStart: "auto",
          insetInlineEnd: "1.5rem",
          transform: "none",
        }}
        data-purple-chip="assistant-fab"
        aria-label="Open AI invoice assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </Button>
    </>,
    document.body,
  );
}
