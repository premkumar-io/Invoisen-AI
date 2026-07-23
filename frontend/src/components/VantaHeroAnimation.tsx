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

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: c.color,
          backgroundColor: c.backgroundColor,
          points: 14.0,
          maxDistance: 22.0,
          spacing: 18.0,
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
        setLoading(false); // Ensure loading state is removed even on error
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
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div ref={vantaRef} className="h-full w-full">
      {loading && (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-accent">
          {/* A simple loading indicator */}
          <p className="animate-pulse font-medium text-muted-foreground">Loading scene…</p>
        </div>
      )}
    </div>
  );
};
