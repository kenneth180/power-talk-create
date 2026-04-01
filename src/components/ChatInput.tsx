import { useState, useRef, KeyboardEvent } from "react";
import { Send, Image, Mic, Video, Paperclip } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-4 py-3 border border-border focus-within:border-primary/50 focus-within:glow-primary transition-all">
          {/* Action buttons */}
          <div className="flex items-center gap-1 pb-0.5">
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Attach file">
              <Paperclip size={18} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Generate image">
              <Image size={18} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Generate video">
              <Video size={18} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Rock Assistant anything..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground max-h-[200px]"
          />

          {/* Voice & Send */}
          <div className="flex items-center gap-1 pb-0.5">
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Voice chat">
              <Mic size={18} />
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg gradient-bg text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          PowerChat can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
