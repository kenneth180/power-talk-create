import { ArrowLeft, Hammer, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Builder = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8"
        >
          <Hammer className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-4xl font-bold text-foreground mb-3">
          PowerChat Builder
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles size={14} />
          Coming Soon
        </div>

        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          Build custom AI agents, workflows, and automations — all from a visual interface. No code required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { title: "Custom Agents", desc: "Create AI agents with custom personas" },
            { title: "Visual Workflows", desc: "Drag & drop automation builder" },
            { title: "API Integrations", desc: "Connect to any external service" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <p className="text-sm font-semibold text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to PowerChat
        </Link>
      </motion.div>
    </div>
  );
};

export default Builder;
