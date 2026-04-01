import { motion } from "framer-motion";
import { Zap, Image, Video, Mic, Code, BookOpen, Phone, Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  { icon: Image, text: "Generate an image of a sunset over mountains", color: "text-pink-400" },
  { icon: Code, text: "Write a Python script to sort a list", color: "text-green-400" },
  { icon: BookOpen, text: "Help me with my math homework", color: "text-yellow-400" },
  { icon: Video, text: "Create a short video about space", color: "text-purple-400" },
  { icon: Mic, text: "Start a voice conversation", color: "text-blue-400" },
  { icon: Phone, text: "Call Mom", color: "text-orange-400" },
];

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg glow-primary mb-6">
            <Zap size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Rock Assistant</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Your AI assistant — chat, create images, generate videos, code, and more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => onSuggestion(s.text)}
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:bg-muted transition-all text-left text-sm group"
            >
              <s.icon size={18} className={`${s.color} shrink-0 group-hover:scale-110 transition-transform`} />
              <span className="text-secondary-foreground">{s.text}</span>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={() => navigate("/builder")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity glow-primary"
          >
            <Hammer size={16} />
            Go to Builder
          </button>
        </motion.div>
      </div>
    </div>
  );
}
