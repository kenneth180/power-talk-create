import { useState, useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { Send, Image, Mic, Video, Paperclip, X } from "lucide-react";
import { motion } from "framer-motion";
import { StylePicker } from "./StylePicker";

interface ChatInputProps {
  onSend: (message: string, imageBase64?: string, styleId?: string) => void;
  isLoading: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string>("auto");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!input.trim() && !attachedImage) || isLoading) return;
    onSend(input.trim(), attachedImage || undefined, styleId);
    setInput("");
    setAttachedImage(null);
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

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const base64 = await fileToBase64(file);
          setAttachedImage(base64);
        }
        return;
      }
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const base64 = await fileToBase64(file);
      setAttachedImage(base64);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Attached image preview */}
        {attachedImage && (
          <div className="mb-2 relative inline-block">
            <img
              src={attachedImage}
              alt="Attached"
              className="h-20 rounded-lg border border-border object-cover"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-80"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-4 py-3 border border-border focus-within:border-primary/50 focus-within:glow-primary transition-all">
          {/* Action buttons */}
          <div className="flex items-center gap-1 pb-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Attach image"
            >
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
            onPaste={handlePaste}
            placeholder={attachedImage ? "Describe how to edit this image..." : "Ask Rock Assistant anything..."}
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
              disabled={(!input.trim() && !attachedImage) || isLoading}
              className="p-2 rounded-lg gradient-bg text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Rock Assistant can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
