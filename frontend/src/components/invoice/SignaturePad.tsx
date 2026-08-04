import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

const INK_COLORS = [
  { id: "dark", color: "#0f172a", label: "Dark Ink" },
  { id: "navy", color: "#1e3a8a", label: "Navy Blue" },
  { id: "blue", color: "#2563eb", label: "Royal Blue" },
];

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [selectedInk, setSelectedInk] = useState("#0f172a");

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const previous = canvas.toDataURL();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = selectedInk;
    ctx.clearRect(0, 0, width, height);
    if (previous.length > 100) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = previous;
    }
  }, [selectedInk]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    last.current = pointFromEvent(event);
    canvasRef.current?.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx || !last.current) return;
    const point = pointFromEvent(event);
    ctx.beginPath();
    ctx.strokeStyle = selectedInk;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      {/* Ink Selection & Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {INK_COLORS.map((ink) => (
            <button
              key={ink.id}
              type="button"
              onClick={() => setSelectedInk(ink.color)}
              className={`h-4 w-4 rounded-full border-2 transition-transform ${
                selectedInk === ink.color
                  ? "scale-125 border-primary shadow-md"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: ink.color }}
              title={ink.label}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          className="h-6 px-2 text-[11px] font-bold text-destructive hover:bg-destructive/10 rounded-lg gap-1"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </Button>
      </div>

      {/* High-Contrast White Digital Paper Canvas */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="h-28 w-full touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!value ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400 select-none">
            Sign here with mouse or touch
          </span>
        ) : null}
      </div>
    </div>
  );
}
