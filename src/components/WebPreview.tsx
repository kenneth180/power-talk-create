import { X, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface WebPreviewProps {
  url: string;
  onClose: () => void;
}

export function WebPreview({ url, onClose }: WebPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "border border-border rounded-xl overflow-hidden my-2 max-w-full"
      } bg-card flex flex-col`}
      style={!isFullscreen ? { height: 420 } : undefined}
    >
      {/* Browser-like toolbar */}
      <div className="h-10 bg-secondary/80 border-b border-border flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground truncate border border-border/50">
            {url}
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={14} />
        </a>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Iframe */}
      <iframe
        src={url}
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title={`Preview of ${url}`}
      />
    </motion.div>
  );
}
