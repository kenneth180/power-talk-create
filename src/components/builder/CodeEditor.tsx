import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CodeEditorProps {
  code: string;
  language: string;
  fileName: string;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, language, fileName, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* File tab */}
      <div className="h-9 border-b border-border flex items-center px-3 gap-2 bg-secondary/50 shrink-0">
        <span className="text-xs font-medium text-foreground">{fileName}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{language}</span>
        <div className="ml-auto">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-background/50 border-r border-border overflow-hidden shrink-0 select-none"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-[11px] leading-5 text-muted-foreground/50 text-right pr-3 font-mono"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-foreground font-mono text-[13px] leading-5 p-3 resize-none outline-none overflow-auto scrollbar-thin"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Status bar */}
      <div className="h-6 border-t border-border flex items-center px-3 gap-4 bg-secondary/30 shrink-0">
        <span className="text-[10px] text-muted-foreground">
          Ln {lineCount}, Col {lines[lines.length - 1]?.length || 0}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">{language}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">UTF-8</span>
      </div>
    </div>
  );
}
