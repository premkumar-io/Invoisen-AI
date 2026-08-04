import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  Mail,
  Paperclip,
  Upload,
  X,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AiEmailGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber?: string;
  clientName?: string;
  clientEmail?: string;
  amount?: string;
  onSendEmail?: (email: string, subject: string, body: string, attachments?: File[]) => void;
}

export function AiEmailGeneratorModal({
  open,
  onOpenChange,
  invoiceNumber = "INV-2026-089",
  clientName = "Orbit Collective",
  clientEmail = "",
  amount = "$14,200.00",
  onSendEmail,
}: AiEmailGeneratorModalProps) {
  const [tone, setTone] = useState<"professional" | "friendly" | "firm" | "swiss">("professional");
  const [emailType, setEmailType] = useState<"send_invoice" | "reminder" | "overdue" | "thank_you">(
    "send_invoice",
  );
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || "");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRecipientEmail(clientEmail || "");
      setContent(generateEmailContent(emailType, tone));
    }
  }, [open, clientEmail, invoiceNumber, clientName, amount]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
      toast.success(`Attached ${newFiles.length} file(s) successfully`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.info("Attachment removed");
  };

  const generateEmailContent = (
    currentType = emailType,
    currentTone = tone
  ) => {
    let subject = "";
    let body = "";

    if (currentType === "send_invoice") {
      subject = `Invoice ${invoiceNumber} from Invoisen Studio (${amount})`;
      if (currentTone === "friendly") {
        body = `Hi ${clientName} Team,\n\nHope you're having a great week! Please find attached Invoice ${invoiceNumber} for ${amount}.\n\nYou can pay directly online using the link attached or via Swiss QR IBAN bank transfer.\n\nThanks so much for working with us!\nBest,\nInvoisen Studio`;
      } else if (currentTone === "firm") {
        body = `Attention ${clientName} Accounts Payable,\n\nAttached is Invoice ${invoiceNumber} totaling ${amount}. Payment is due within 14 days.\n\nPlease confirm receipt of this invoice.\n\nRegards,\nInvoisen Studio Billing`;
      } else if (currentTone === "swiss") {
        body = `Dear ${clientName} Executive Team,\n\nIn accordance with Swiss Commercial Regulations, please find formal Invoice ${invoiceNumber} for the total amount of ${amount}.\n\nPayment details and SIX QR-bill reference codes are embedded within the attached PDF.\n\nMit freundlichen Grüssen,\nInvoisen Studio Zurich`;
      } else {
        body = `Dear ${clientName},\n\nWe hope this message finds you well. Please review invoice ${invoiceNumber} for ${amount}, due per our agreed terms.\n\nThank you for your business.\n\nSincerely,\nInvoisen Finance`;
      }
    } else if (currentType === "reminder") {
      subject = `Friendly Payment Reminder: Invoice ${invoiceNumber} (${amount})`;
      body = `Hi ${clientName} Team,\n\nThis is a polite reminder that invoice ${invoiceNumber} (${amount}) is approaching its due date.\n\nIf you have already processed this payment, please disregard this message.\n\nBest regards,\nInvoisen Studio`;
    } else if (currentType === "overdue") {
      subject = `URGENT: Overdue Notice for Invoice ${invoiceNumber}`;
      body = `Dear ${clientName},\n\nOur records indicate invoice ${invoiceNumber} for ${amount} is now past due.\n\nPlease process this payment at your earliest convenience to avoid service suspension or interest fees.\n\nRegards,\nInvoisen Accounts Receivable`;
    } else {
      subject = `Payment Confirmation & Receipt for Invoice ${invoiceNumber}`;
      body = `Dear ${clientName},\n\nWe have successfully received your payment of ${amount} for invoice ${invoiceNumber}.\n\nThank you for your prompt payment!\n\nWarm regards,\nInvoisen Studio`;
    }

    return { subject, body };
  };

  const [content, setContent] = useState(generateEmailContent());

  const handleRegenerate = (newType = emailType, newTone = tone) => {
    setGenerating(true);
    setTimeout(() => {
      setContent(generateEmailContent(newType, newTone));
      setGenerating(false);
    }, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${recipientEmail}\nSubject: ${content.subject}\n\n${content.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Invalid Recipient Email", {
        description: "Please enter a valid target email address before sending.",
      });
      return;
    }

    if (onSendEmail) {
      onSendEmail(recipientEmail, content.subject, content.body, attachments);
    }

    setSent(true);
    setTimeout(() => {
      setSent(false);
      onOpenChange(false);
      setAttachments([]);
    }, 2200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6 sm:p-8 rounded-3xl border border-border/80 shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs w-fit">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI Neural Email Composer</span>
          </div>
          <div>
            <DialogTitle className="font-headline text-3xl font-black text-foreground tracking-tight">
              Generate Client Email
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-1">
              Tailored email copy for <span className="font-bold text-foreground">{clientName}</span> ({invoiceNumber} — {amount}).
            </DialogDescription>
          </div>
        </DialogHeader>

        {sent ? (
          <div className="py-12 px-6 text-center space-y-4 bg-success/10 border border-success/20 rounded-3xl text-success">
            <CheckCircle2 className="w-14 h-14 mx-auto" />
            <h4 className="font-headline font-bold text-xl">Email Dispatched!</h4>
            <p className="text-xs font-medium max-w-sm mx-auto text-muted-foreground">
              Invoice &amp; {1 + attachments.length} attachment(s) sent successfully to <span className="font-bold text-foreground">{recipientEmail}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Tone & Purpose Controls with Custom Radix UI Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Email Objective
                </label>
                <Select
                  value={emailType}
                  onValueChange={(val) => {
                    const nextVal = val as any;
                    setEmailType(nextVal);
                    handleRegenerate(nextVal, tone);
                  }}
                >
                  <SelectTrigger className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/40 shadow-sm h-11">
                    <SelectValue placeholder="Select Objective" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-1 z-[100]">
                    <SelectItem value="send_invoice" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Send New Invoice
                    </SelectItem>
                    <SelectItem value="reminder" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Payment Reminder
                    </SelectItem>
                    <SelectItem value="overdue" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Overdue Final Notice
                    </SelectItem>
                    <SelectItem value="thank_you" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Thank You &amp; Receipt
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Communication Tone
                </label>
                <Select
                  value={tone}
                  onValueChange={(val) => {
                    const nextTone = val as any;
                    setTone(nextTone);
                    handleRegenerate(emailType, nextTone);
                  }}
                >
                  <SelectTrigger className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/40 shadow-sm h-11">
                    <SelectValue placeholder="Select Tone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-1 z-[100]">
                    <SelectItem value="professional" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Professional Standard
                    </SelectItem>
                    <SelectItem value="friendly" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Warm &amp; Friendly
                    </SelectItem>
                    <SelectItem value="firm" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Direct &amp; Firm
                    </SelectItem>
                    <SelectItem value="swiss" className="rounded-xl text-xs font-bold py-2.5 cursor-pointer">
                      Swiss Formal Executive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generated Output Card with Editable Recipient Email & File Uploader */}
            <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4 bg-muted/20">
              {/* Recipient Email Address Input */}
              <div className="space-y-2 border-b border-border/60 pb-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Recipient Email (Send To):
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. client@company.com"
                    className="w-full font-headline font-bold text-sm bg-card border border-border/60 rounded-2xl pl-10 pr-3 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 border-b border-border/60 pb-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={content.subject}
                  onChange={(e) => setContent({ ...content, subject: e.target.value })}
                  className="w-full font-headline font-bold text-sm bg-card border border-border/60 rounded-2xl p-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-2 border-b border-border/60 pb-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Email Body:
                </label>
                <textarea
                  value={content.body}
                  onChange={(e) => setContent({ ...content, body: e.target.value })}
                  rows={5}
                  className="w-full text-sm text-foreground bg-card border border-border/60 rounded-2xl p-4 leading-relaxed outline-none resize-none font-body focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Upload Attachment Feature */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Attachments ({attachments.length}):
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic font-medium py-1">
                      No custom attachments added yet.
                    </p>
                  ) : (
                    attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-bold shadow-sm group hover:border-destructive/40 transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[130px]">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer ml-1"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons matching Invoisen design buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRegenerate()}
                disabled={generating}
                className="w-full sm:w-auto rounded-full px-6 py-3 text-xs font-bold border-border shadow-sm hover:bg-muted transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 text-primary ${generating ? "animate-spin" : ""}`} />
                Regenerate AI Draft
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial rounded-full px-6 py-3 text-xs font-bold border-border shadow-sm hover:bg-muted transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>

                <Button
                  type="button"
                  onClick={handleSend}
                  className="flex-1 sm:flex-initial rounded-full px-8 py-3 font-headline text-xs font-bold shadow-xl bg-primary text-white hover:scale-105 transition-transform btn-premium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
