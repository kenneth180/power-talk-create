import { useNavigate } from "react-router-dom";
import { Crown, Zap, ArrowLeft, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";

const STRIPE_LINK = "https://buy.stripe.com/test_28EfZhfu0cVQedUeg9eUU0c";

const plans = [
  {
    name: "Rock 5 Pro",
    price: "Free",
    current: true,
    features: ["Basic AI chat", "Standard response speed", "Image generation", "Chat history"],
  },
  {
    name: "Rock 6 Pro",
    price: "$20/mo",
    highlight: true,
    features: [
      "Rock 6 Pro model — faster & smarter",
      "Priority response speed",
      "HD image generation",
      "Unlimited chat history",
      "Early access to new features",
    ],
  },
];

const comingSoon = [
  { name: "Rock 7 Ultra", desc: "Next-gen reasoning & creativity" },
  { name: "Rock Team", desc: "Collaboration & shared workspaces" },
];

export default function PlansBuy() {
  const navigate = useNavigate();
  const isPro = localStorage.getItem("rock-pro") === "true";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-6 space-y-4 ${
                plan.highlight
                  ? "border-yellow-500/50 bg-gradient-to-b from-yellow-500/5 to-transparent"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2">
                {plan.highlight && <Crown size={18} className="text-yellow-400" />}
                <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
              </div>
              <p className="text-3xl font-bold text-foreground">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.highlight ? (
                isPro ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 font-semibold text-sm border border-yellow-500/30">
                    <Crown size={14} /> Active
                  </div>
                ) : (
                  <a
                    href={STRIPE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    <Zap size={14} /> Upgrade Now
                  </a>
                )
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-secondary text-center text-sm text-muted-foreground font-medium">
                  {plan.current ? "Current Plan" : ""}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coming Soon</h3>
          {comingSoon.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card/50"
            >
              <Clock size={16} className="text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground ml-2">— {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
