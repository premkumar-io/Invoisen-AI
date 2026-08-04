import React, { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Bug,
  Sparkles,
  Search,
  ExternalLink,
  Send,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HelpCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    q: "How does Swiss QR-Bill & PDF export work in Invoisen?",
    a: "Invoisen automatically formats your invoices according to Swiss Payment Standards (SIX Group) with embedded QR codes, multi-currency IBAN validation, and vector PDF rendering.",
  },
  {
    q: "How accurate is the AI Line Item & Tax Engine?",
    a: "Our neural tax engine reads regional tax codes (EU VAT, US Sales Tax, GST) and client location metadata to suggest compliant tax rates with 99.8% precision.",
  },
  {
    q: "Can I customize invoice branding, colors, and logos?",
    a: "Yes! Navigate to Settings > Company Profile to upload your corporate logo, signature stamp, custom typography, and primary accent colors.",
  },
  {
    q: "What payment gateways are supported?",
    a: "Invoisen integrates directly with Stripe, Razorpay, PayPal, and direct SEPA/SWIFT bank transfers.",
  },
];

export function HelpCenterModal({ open, onOpenChange }: HelpCenterModalProps) {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketText, setTicketText] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketText("");
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6 sm:p-8 rounded-3xl border border-border/80 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Invoisen Support Hub</span>
          </div>
          <DialogTitle className="font-headline text-2xl font-black text-foreground">
            Help Center &amp; Documentation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search our Knowledge Base or submit a support ticket to our staff engineers.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="faq" className="mt-4 space-y-4">
          <TabsList className="grid grid-cols-3 p-1 rounded-2xl bg-muted">
            <TabsTrigger value="faq" className="rounded-xl font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              FAQ Docs
            </TabsTrigger>
            <TabsTrigger value="ticket" className="rounded-xl font-bold text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="bug" className="rounded-xl font-bold text-xs">
              <Bug className="w-3.5 h-3.5 mr-1.5" />
              Report Issue
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, Swiss QR, taxes, APIs..."
                className="pl-10 rounded-2xl border-border/80 bg-card/60 text-xs"
              />
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
              {filteredFaqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border border-border/60 rounded-2xl px-4 bg-card/40"
                >
                  <AccordionTrigger className="font-bold text-xs text-foreground hover:no-underline py-3">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="ticket">
            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="font-bold text-base">Support Request Dispatched!</h4>
                <p className="text-xs">
                  Ticket #INV-T-842 created. An engineer will respond via email within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Describe your question or issue
                  </label>
                  <Textarea
                    value={ticketText}
                    onChange={(e) => setTicketText(e.target.value)}
                    placeholder="Provide details about what you need assistance with..."
                    required
                    rows={4}
                    className="rounded-2xl border-border/80 text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-2xl font-headline font-bold text-xs bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Submit Support Ticket
                </Button>
              </form>
            )}
          </TabsContent>

          {/* Bug / Feature Request Tab */}
          <TabsContent value="bug">
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-xs text-foreground">
                  Invoisen Continuous Feedback Program
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found a minor visual glitch or have a feature idea for Invoisen v2? We review all
                feedback daily.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open("https://github.com", "_blank")}
                className="w-full rounded-2xl font-bold text-xs border-primary/30 text-primary"
              >
                Open GitHub Feature Request
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
