import { useCallback, useEffect, useRef } from "react";

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

const LIGHT_STROKE = "#0f172a";

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

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
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = LIGHT_STROKE;
    ctx.clearRect(0, 0, width, height);
    if (previous.length > 100) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = previous;
    }
  }, []);

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
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-input bg-background">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!value ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Sign here
          </span>
        ) : null}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-muted-foreground hover:text-destructive"
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}
