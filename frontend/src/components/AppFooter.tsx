import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function AppFooter() {
  const links = [
    { label: "Privacy Policy", to: "/" },
    { label: "Documentation", to: "/" },
    { label: "Contact Us", to: "/" },
  ] as const;
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 text-sm sm:flex-row">
      <Logo to="/dashboard" />
      <p className="text-muted-foreground">© 2026 Invoisen. All rights reserved.</p>
      <nav className="flex gap-5">
        {links.map((l) => (
          <Link key={l.label} to={l.to} className="text-muted-foreground hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
