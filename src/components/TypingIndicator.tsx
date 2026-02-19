import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 px-4 py-4"
    >
      <div className="shrink-0 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
        <Bot size={16} className="text-primary-foreground" />
      </div>
      <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-dot" style={{ animationDelay: "200ms" }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-dot" style={{ animationDelay: "400ms" }} />
      </div>
    </motion.div>
  );
}
