import { useRef, useState, useCallback, useEffect } from "react";

interface BeforeAfterProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfter({ before, after, alt = "comparison" }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent | any) => {
      if (!dragging.current) return;
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateFromClientX(x);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-border select-none cursor-ew-resize"
      style={{ maxHeight: 500 }}
      onMouseDown={(e) => { dragging.current = true; updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; updateFromClientX(e.touches[0].clientX); }}
    >
      <img src={after} alt={`${alt} after`} className="block w-full h-auto" draggable={false} style={{ maxHeight: 500, objectFit: "contain" }} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt={`${alt} before`}
          className="block h-full w-auto max-w-none"
          draggable={false}
          style={{
            width: containerRef.current ? containerRef.current.clientWidth : "100%",
            maxHeight: 500,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold tracking-wide">
        BEFORE
      </span>
      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold tracking-wide">
        AFTER
      </span>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary text-xs font-bold shadow-lg">
          ⇆
        </div>
      </div>
    </div>
  );
}
