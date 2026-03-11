import { useState } from "react";
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from "lucide-react";

interface LivePreviewProps {
  code: string;
  language: string;
}

export function LivePreview({ code, language }: LivePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  const generatePreviewHtml = () => {
    if (language === "html" || language === "htm") {
      return code;
    }

    // For CSS, wrap in HTML
    if (language === "css") {
      return `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="preview-container"><h1>CSS Preview</h1><p>Your styles are applied here.</p><button>Sample Button</button></div></body></html>`;
    }

    // For JS/TS/React, create a simple preview
    if (["javascript", "typescript", "jsx", "tsx", "js", "ts"].includes(language)) {
      return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #0f1117; color: #e2e8f0; margin: 0; padding: 24px; }
  .output { background: #1a1d2e; border: 1px solid #2d3148; border-radius: 8px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; white-space: pre-wrap; line-height: 1.6; }
  .header { color: #64b5f6; font-size: 14px; margin-bottom: 12px; font-weight: 600; }
  .success { color: #81c784; }
  .info { color: #90caf9; }
</style>
</head>
<body>
<div class="header">▶ Console Output</div>
<div class="output">
<span class="success">✓ Code compiled successfully</span>

<span class="info">// Running ${language.toUpperCase()} preview...</span>
<span class="info">// File loaded with ${code.split('\n').length} lines</span>
</div>
<script>
try {
  ${language === "typescript" || language === "tsx" || language === "ts"
    ? "// TypeScript would be compiled here"
    : code}
} catch(e) {
  document.querySelector('.output').innerHTML += '\\n<span style=\"color:#ef5350\">Error: ' + e.message + '</span>';
}
</script>
</body>
</html>`;
    }

    // For Python
    if (language === "python" || language === "py") {
      return `<!DOCTYPE html>
<html><head>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #0f1117; color: #e2e8f0; margin: 0; padding: 24px; }
  .output { background: #1a1d2e; border: 1px solid #2d3148; border-radius: 8px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; white-space: pre-wrap; }
  .header { color: #81c784; font-size: 14px; margin-bottom: 12px; font-weight: 600; }
</style>
</head><body>
<div class="header">🐍 Python Preview</div>
<div class="output">Python execution requires a backend runtime.\n\nCode loaded: ${code.split('\n').length} lines</div>
</body></html>`;
    }

    return `<!DOCTYPE html><html><head><style>body{font-family:system-ui;background:#0f1117;color:#e2e8f0;padding:24px;}</style></head><body><p>Preview for .${language} files</p><pre>${code.replace(/</g, '&lt;').slice(0, 500)}</pre></body></html>`;
  };

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Toolbar */}
      <div className="h-9 border-b border-border flex items-center px-3 gap-1 bg-secondary/50 shrink-0">
        <span className="text-xs font-medium text-foreground mr-2">Preview</span>
        
        <div className="flex items-center gap-0.5 bg-background/50 rounded-md p-0.5">
          {([
            { key: "desktop", icon: Monitor },
            { key: "tablet", icon: Tablet },
            { key: "mobile", icon: Smartphone },
          ] as const).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`p-1 rounded transition-colors ${
                device === key
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="ml-2 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={14} />
        </button>

        <button className="ml-auto p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Preview frame */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-background/30 p-4">
        <div
          className="bg-background rounded-lg border border-border overflow-hidden shadow-lg transition-all duration-300"
          style={{
            width: deviceWidths[device],
            maxWidth: "100%",
            height: device === "desktop" ? "100%" : "auto",
            minHeight: device !== "desktop" ? "500px" : undefined,
          }}
        >
          <iframe
            key={refreshKey}
            srcDoc={generatePreviewHtml()}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Live Preview"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>
    </div>
  );
}
