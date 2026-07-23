import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LifeBuoy, Mail, MessageSquare, Send, Loader2 } from "lucide-react";

import { AppFooter } from "@/components/AppFooter";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAuthToken } from "@/lib/auth";
import { submitContact } from "@/lib/api/contact";

export const Route = createFileRoute("/support")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getAuthToken()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({ meta: [{ title: "Support — Invoisen" }] }),
  component: SupportPage,
});

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function SupportPage() {
  const { register, handleSubmit, reset } = useForm<ContactForm>();

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      toast.success("Your message has been sent.", {
        description: "Our team will get back to you shortly.",
      });
      reset();
    },
    onError: (err) => {
      toast.error("Failed to send message", { description: err.message });
    },
  });

  const onSubmit = (data: ContactForm) => {
    mutation.mutate(data);
  };

  return (
    <AppShell>
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Support</h1>
        <p className="mt-1 text-muted-foreground">
          Contact the Invoisen team or browse quick help for invoice workflows.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-4">
          {[
            {
              icon: LifeBuoy,
              title: "Help center",
              body: "Guides for invoice creation, signatures, clients, and reports.",
            },
            {
              icon: Mail,
              title: "Email support",
              body: "Reach the team for billing, account, or technical questions.",
            },
            {
              icon: MessageSquare,
              title: "AI assistant",
              body: "Use the floating assistant for invoice wording and terms.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/60 bg-card p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </section>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-border/60 bg-card p-6"
        >
          <h2 className="font-display text-2xl font-semibold">Contact us</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                {...register("name", { required: true })}
                placeholder="Your name"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                {...register("email", { required: true })}
                placeholder="you@example.com"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Subject</Label>
              <Input
                {...register("subject", { required: true })}
                placeholder="How can we help?"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Message</Label>
              <Textarea
                {...register("message", { required: true })}
                rows={7}
                placeholder="Tell us what happened..."
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="mt-5 rounded-xl font-semibold"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send message
          </Button>
        </form>
      </div>
      <AppFooter />
    </AppShell>
  );
}
