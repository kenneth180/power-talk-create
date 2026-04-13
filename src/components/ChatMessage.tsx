import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import { WebPreview } from "./WebPreview";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  webUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showWebPreview, setShowWebPreview] = useState(!!message.webUrl);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!message.imageUrl) return;
    const a = document.createElement("a");
    a.href = message.imageUrl;
    a.download = `rockassistant-image-${Date.now()}.png`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 px-4 py-4 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
          <Bot size={16} className="text-primary-foreground" />
        </div>
      )}

      <div className={`max-w-[75%] group ${isUser ? "order-first" : ""}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-user-bubble text-user-bubble-foreground rounded-br-md"
              : "bg-ai-bubble text-ai-bubble-foreground rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <>
              {message.imageUrl && (
                <div className="mb-3">
                  <img
                    src={message.imageUrl}
                    alt="AI generated image"
                    className="rounded-xl max-w-full border border-border"
                    style={{ maxHeight: 400 }}
                  />
                  <button
                    onClick={handleDownload}
                    className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              )}
              <div className="prose prose-base max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:text-foreground [&_li]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_code]:text-foreground text-[15px] leading-7">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              {/* Web Preview */}
              <AnimatePresence>
                {message.webUrl && showWebPreview && (
                  <WebPreview url={message.webUrl} onClose={() => setShowWebPreview(false)} />
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <User size={16} className="text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
