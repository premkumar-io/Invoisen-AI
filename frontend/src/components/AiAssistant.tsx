import { Bot, Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const starterMessages = [
  "Try: Create an invoice for a 2 week website redesign",
  "Try: Write payment terms for a GST invoice",
  "Try: Make this invoice sound more professional",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I can suggest line items, payment terms, reminders, and professional invoice notes.",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setInput("");

    const response = await api.post<{
      items: Array<{ name: string; description: string; quantity: number; rate: number }>;
      notes: string;
      paymentTerms: string;
      qualityChecklist: string[];
    }>("/ai/invoice-assist", { prompt, currency: "USD" });

    if (response.success) {
      const itemText = response.data.items
        .map((item) => `${item.name} (${item.quantity} x $${item.rate})`)
        .join(", ");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Suggested items: ${itemText}. Terms: ${response.data.paymentTerms}`,
        },
      ]);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: "Suggested invoice structure: add a clear service title, split work into deliverables, use Net 15 terms, include a polite late-payment note, and keep tax/discount lines separate for client clarity.",
      },
    ]);
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      {open && (
        <div
          className="fixed z-40 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
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
          <div
            className="flex items-center justify-between border-b border-border/60 bg-accent/50 px-4 py-3"
            data-purple-chip="ai-header"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                data-purple-chip="ai-avatar"
              >
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">Invoisen AI</p>
                <p className="text-xs text-muted-foreground">Invoice writing assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "assistant"
                    ? "rounded-xl bg-accent p-3 text-sm"
                    : "ml-8 rounded-xl bg-primary p-3 text-sm text-primary-foreground"
                }
                data-purple-chat={message.role}
              >
                {message.text}
              </div>
            ))}
            <div className="space-y-2">
              {starterMessages.map((message) => (
                <button
                  key={message}
                  type="button"
                  onClick={() => setInput(message.replace("Try: ", ""))}
                  className="block w-full rounded-lg border border-border/60 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent"
                  data-purple-chip="starter"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 border-t border-border/60 p-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Ask for invoice help..."
              className="rounded-xl"
            />
            <Button type="button" size="icon" className="rounded-xl" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed z-40 h-14 w-14 rounded-full shadow-xl"
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
        <Sparkles className="h-6 w-6" />
      </Button>
    </>,
    document.body,
  );
}
