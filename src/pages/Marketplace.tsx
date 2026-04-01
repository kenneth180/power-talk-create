import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Star, Download, Zap, Image, Video, Code, Search, MessageSquare, Gamepad2, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import aiReplitImg from "@/assets/ai-replit.jpg";
import aiCreativeImg from "@/assets/ai-creative.jpg";
import aiGoogleImg from "@/assets/ai-google.jpg";
import aiWebdevImg from "@/assets/ai-webdev.jpg";

interface AITool {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: "free" | "pro";
  rating: number;
  downloads: string;
  features: string[];
  color: string;
}

const aiTools: AITool[] = [
  {
    id: "rockassistant",
    name: "Rock Assistant AI",
    description: "The default Rock Assistant. Chat, get answers, code help, homework assistance, and more.",
    image: "",
    category: "General",
    price: "free",
    rating: 4.9,
    downloads: "10M+",
    features: ["Chat", "Code Help", "Homework", "Q&A"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "powerchat-creative",
    name: "PowerChat Creative",
    description: "Create stunning images, edit photos, and generate videos with AI-powered creative tools.",
    image: aiCreativeImg,
    category: "Creative",
    price: "free",
    rating: 4.8,
    downloads: "5M+",
    features: ["Image Generation", "Image Editing", "Video Creation", "AI Tools"],
    color: "from-pink-500 to-orange-500",
  },
  {
    id: "replit-ai",
    name: "Replit AI",
    description: "Build apps and games with AI. Write code, deploy instantly, and create full applications with Replit's AI.",
    image: aiReplitImg,
    category: "Development",
    price: "pro",
    rating: 4.7,
    downloads: "2M+",
    features: ["App Builder", "Game Creator", "Code Gen", "Deploy"],
    color: "from-cyan-400 to-blue-600",
  },
  {
    id: "lovable-ai",
    name: "App Builder AI",
    description: "Build beautiful web applications with AI. Design, develop, and deploy apps without writing code.",
    image: aiWebdevImg,
    category: "Development",
    price: "pro",
    rating: 4.8,
    downloads: "1M+",
    features: ["Web Apps", "No-Code", "AI Design", "Deploy"],
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "google-ai",
    name: "Google AI Search",
    description: "Ask any question and get instant, accurate answers powered by Google's AI search technology.",
    image: aiGoogleImg,
    category: "Search",
    price: "free",
    rating: 4.9,
    downloads: "8M+",
    features: ["Search", "Q&A", "Research", "Facts"],
    color: "from-green-400 to-emerald-600",
  },
  {
    id: "code-ai",
    name: "CodeMaster AI",
    description: "Advanced coding assistant. Write, debug, and optimize code in any programming language.",
    image: "",
    category: "Development",
    price: "free",
    rating: 4.6,
    downloads: "3M+",
    features: ["Multi-Language", "Debug", "Optimize", "Explain"],
    color: "from-emerald-400 to-teal-600",
  },
];

const categories = ["All", "General", "Creative", "Development", "Search"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? aiTools : aiTools.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold gradient-text">AI Marketplace</h1>
          <span className="text-xs text-muted-foreground">Explore & customize your AI experience</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Discover <span className="gradient-text">AI Tools</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Browse custom AI assistants — from app builders to creative tools. Install and switch between them instantly.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-thin pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "gradient-bg text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Image / Gradient header */}
              <div className={`h-36 bg-gradient-to-br ${tool.color} relative flex items-center justify-center overflow-hidden`}>
                {tool.image ? (
                  <img src={tool.image} alt={tool.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-background/20 backdrop-blur flex items-center justify-center">
                    <Zap size={28} className="text-primary-foreground" />
                  </div>
                )}
                {tool.price === "pro" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full pro-gradient text-xs font-bold text-background">
                    <Crown size={12} /> PRO
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    {tool.rating}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tool.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tool.features.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {f}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Download size={12} /> {tool.downloads}
                  </span>
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 rounded-lg text-sm font-medium gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {tool.id === "powerchat" ? "Open" : "Try Now"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
