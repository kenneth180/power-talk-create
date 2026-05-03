import { useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGE_STYLES, ImageStyle } from "@/lib/imageStyles";

interface StylePickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  const [open, setOpen] = useState(false);
  const current = IMAGE_STYLES.find((s) => s.id === value) || IMAGE_STYLES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-xs text-foreground border border-border transition-colors"
        title="Pick image style & shaders"
      >
        <Palette size={13} />
        <span className="hidden sm:inline">{current.emoji} {current.label}</span>
        <span className="sm:hidden">{current.emoji}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 w-72 max-h-80 overflow-y-auto bg-popover border border-border rounded-xl shadow-xl z-50 p-1.5"
            >
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Style & Shaders
              </div>
              {IMAGE_STYLES.map((s: ImageStyle) => (
                <button
                  key={s.id}
                  onClick={() => { onChange(s.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-muted transition-colors ${
                    value === s.id ? "bg-muted" : ""
                  }`}
                >
                  <span className="text-base">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{s.label}</div>
                    {s.prompt && (
                      <div className="text-[10px] text-muted-foreground truncate">{s.prompt}</div>
                    )}
                  </div>
                  {value === s.id && <Check size={14} className="text-primary shrink-0" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
