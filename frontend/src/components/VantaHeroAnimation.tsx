import { useEffect, useRef, useState } from "react";

// A minimal interface for the Vanta instance to provide better type safety.
interface VantaEffect {
  destroy: () => void;
  setOptions: (options: Record<string, unknown>) => void;
}

const colorsFor = (purpleMode: boolean, darkMode: boolean) =>
  purpleMode
    ? {
        color: 0x8b5cf6,
        backgroundColor: 0xfaf5ff,
      }
    : darkMode
      ? {
          color: 0x60a5fa,
          backgroundColor: 0x020617,
        }
      : {
          color: 0x2563eb,
          backgroundColor: 0xf8fafc,
        };

export const VantaHeroAnimation = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMobile || prefersReduced) {
      setIsLowPower(true);
      setLoading(false);
      return;
    }

    let observer: MutationObserver;

    const loadAndInitVanta = async () => {
      if (!vantaRef.current) return;

      try {
        // Dynamically import dependencies to ensure they are client-side only
        const THREE = await import("three");
        const NET = (await import("vanta/src/vanta.net.js")).default;

        const theme = document.documentElement.dataset.theme;
        const c = colorsFor(theme === "purple", theme === "dark");

        vantaEffect.current = NET({
          el: vantaRef.current,
          THREE,
          mouseControls: !prefersReduced,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: c.color,
          backgroundColor: c.backgroundColor,
          points: 10.0,
          maxDistance: 20.0,
          spacing: 20.0,
          showDots: true,
        });

        setLoading(false);

        // Set up an observer to watch for theme changes (data-theme attribute)
        observer = new MutationObserver(() => {
          const newTheme = document.documentElement.dataset.theme;
          const newColors = colorsFor(newTheme === "purple", newTheme === "dark");
          try {
            vantaEffect.current?.setOptions({
              color: newColors.color,
              backgroundColor: newColors.backgroundColor,
            });
          } catch (err) {
            // ignore setOptions errors
          }
        });
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      } catch (error) {
        console.error("Failed to load Vanta animation:", error);
        setLoading(false);
      }
    };

    loadAndInitVanta();

    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (error) {
          console.warn("Vanta destroy failed during cleanup:", error);
        }
        vantaEffect.current = null;
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  if (isLowPower) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10" />
    );
  }

  return (
    <div ref={vantaRef} className="h-full w-full">
      {loading && (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-accent">
          <p className="animate-pulse font-medium text-muted-foreground text-xs">Loading scene…</p>
        </div>
      )}
    </div>
  );
};
