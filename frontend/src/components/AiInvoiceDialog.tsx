import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { InvoiceForm } from "./invoice/InvoiceEditor";

interface AiInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (suggestions: Partial<InvoiceForm>) => void;
}

interface AiAssistResponse {
  suggestions: Partial<InvoiceForm>;
  meta: {
    followUpMessage: string;
    qualityChecklist: string[];
  };
}

const examplePrompts = [
  "Create an invoice for ABC Pvt Ltd for website development worth ₹50,000 with 18% GST.",
  "Invoice for John Doe for logo design services, worth $1200, due next week.",
  "Bill Client Corp for monthly consulting, $5000.",
];

export function AiInvoiceDialog({ isOpen, onClose, onApply }: AiInvoiceDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<AiAssistResponse>("/ai/invoice-assist", { prompt });

      if (!res.success) {
        throw new Error(res.error.message ?? "Failed to get suggestions.");
      }

      if (res.data.suggestions) {
        onApply(res.data.suggestions);
      } else {
        throw new Error("Failed to get suggestions.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Failed to Get Suggestions", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Invoice Assistant
          </DialogTitle>
          <DialogDescription>
            Describe the invoice you want to create in plain language. The AI will populate the form
            for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create an invoice for..."
            rows={4}
            className="rounded-xl"
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Examples:</p>
            <div className="space-y-1">
              {examplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="block w-full rounded-lg border border-border/60 px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="rounded-xl">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
