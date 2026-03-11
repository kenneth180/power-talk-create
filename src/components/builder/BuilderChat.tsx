import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { streamChat } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface BuilderChatProps {
  onInsertCode?: (code: string) => void;
}

export function BuilderChat({ onInsertCode }: BuilderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const assistantId = crypto.randomUUID();
    const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    await streamChat({
      messages: apiMessages,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === assistantId);
          if (exists) {
            return prev.map((m) => (m.id === assistantId ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar }];
        });
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `❌ ${err}` },
        ]);
      },
    });
  };

  const extractCodeBlocks = (content: string) => {
    const regex = /```[\w]*\n([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity glow-primary"
      >
        <Bot size={20} />
      </button>
    );
  }

  return (
    <motion.div
      layout
      className={`flex flex-col bg-card border border-border rounded-lg shadow-xl overflow-hidden ${
        isExpanded ? "fixed inset-4 z-50" : "h-full"
      }`}
    >
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center px-3 gap-2 bg-secondary/50 shrink-0">
        <Bot size={16} className="text-primary" />
        <span className="text-xs font-semibold text-foreground">AI Assistant</span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={24} className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Ask me to generate code, fix bugs, or explain concepts
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={12} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-xs prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-[11px] [&_code]:text-[11px]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {/* Insert code buttons */}
                  {extractCodeBlocks(msg.content).map((block, i) => (
                    <button
                      key={i}
                      onClick={() => onInsertCode?.(block)}
                      className="mt-1 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      Insert Code →
                    </button>
                  ))}
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <User size={12} className="text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && !messages.some((m) => m.role === "assistant" && m.content) && (
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Bot size={12} className="text-primary animate-pulse" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask AI to help you code..."
            className="flex-1 bg-background/50 border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
