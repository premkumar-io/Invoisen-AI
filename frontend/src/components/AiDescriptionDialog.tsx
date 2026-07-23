import { useState, useEffect } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface AiDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (description: string) => void;
  productName: string;
}

interface AiDescriptionResponse {
  description: string;
}

export function AiDescriptionDialog({
  isOpen,
  onClose,
  onApply,
  productName,
}: AiDescriptionDialogProps) {
  const [currentProductName, setCurrentProductName] = useState(productName);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentProductName(productName);
      setDescription("");
      setError(null);
    }
  }, [isOpen, productName]);

  const handleGenerate = async () => {
    if (!currentProductName) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<AiDescriptionResponse>("/ai/generate-description", {
        productName: currentProductName,
      });

      if (!res.success) {
        throw new Error(res.error.message ?? "Failed to generate description.");
      }

      if (res.data.description) {
        setDescription(res.data.description);
      } else {
        throw new Error("Failed to generate description.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Generation Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!description) return;
    navigator.clipboard.writeText(description);
    toast.success("Copied!", {
      description: "The description has been copied to your clipboard.",
    });
  };

  const handleApply = () => {
    onApply(description);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Description Generator
          </DialogTitle>
          <DialogDescription>
            Enter a product name and let AI write a professional description for your invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="productName">Product or Service Name</Label>
            <Input
              id="productName"
              value={currentProductName}
              onChange={(e) => setCurrentProductName(e.target.value)}
              placeholder="e.g., Website Redesign"
            />
          </div>

          {description && (
            <div className="space-y-2">
              <Label htmlFor="generatedDescription">Generated Description (Editable)</Label>
              <Textarea
                id="generatedDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="rounded-xl"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} disabled={isLoading || !currentProductName}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {description ? "Regenerate" : "Generate"}
            </Button>
            {description && (
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!description} className="rounded-xl">
            Apply Description
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
