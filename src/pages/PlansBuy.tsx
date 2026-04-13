import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Zap, ArrowLeft, Check, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { getPlan, setPlan, PlanTier, FREE_COUPON } from "@/lib/plans";
import { toast } from "@/hooks/use-toast";

const STRIPE_LINKS: Record<string, string> = {
  pro: "https://buy.stripe.com/test_28EfZhfu0cVQedUeg9eUU0c",
  ultra: "https://buy.stripe.com/test_bJefZh4Pm7Bw6Ls0pjeUU0d",
  team: "https://buy.stripe.com/test_fZucN54Pm2hcd9Qeg9eUU0e",
};

const plans = [
  {
    key: "free" as PlanTier,
    name: "Rock 5 Pro",
    price: "Free",
    features: [
      "Basic AI chat",
      "Image generation — max 1000×1000",
      "Video generation — max 30 seconds",
      "Code generation — max 1000 lines per file",
      "No image editing",
      "Chat history",
    ],
  },
  {
    key: "pro" as PlanTier,
    name: "Rock 6 Pro",
    price: "$20/mo",
    highlight: true,
    features: [
      "Rock 6 Pro model — faster & smarter",
      "Image generation — up to 1250×1500",
      "Video generation — up to 5 minutes",
      "Code generation — 1000 to 10000 lines per file",
      "Image editing included",
      "Priority response speed",
      "Unlimited chat history",
      "Early access to new features",
    ],
  },
  {
    key: "ultra" as PlanTier,
    name: "Rock 7 Ultra",
    price: "$15/mo",
    highlight: true,
    features: [
      "Rock 7 Ultra model — next-gen reasoning & creativity",
      "Image generation — up to 1550×1300",
      "Video generation — up to 10 minutes",
      "Code generation — 1000 to 20000 lines per file",
      "Image editing included",
      "Priority response speed",
      "Unlimited chat history",
      "Early access to new features",
    ],
  },
  {
    key: "team" as PlanTier,
    name: "Rock Team",
    price: "$20/mo",
    highlight: true,
    features: [
      "Everything in Rock 7 Ultra",
      "Image generation — up to 1750×1650",
      "Video generation — up to 20 minutes",
      "Code generation — 1000 to 35000 lines per file",
      "Image editing included",
      "Collaboration & shared workspaces",
      "Priority response speed",
      "Unlimited chat history",
    ],
  },
];

export default function PlansBuy() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(getPlan());
  const [couponOpen, setCouponOpen] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleCoupon = (planKey: PlanTier) => {
    if (couponCode.trim().toLowerCase() === FREE_COUPON) {
      setPlan(planKey);
      setCurrentPlan(planKey);
      setCouponOpen(null);
      setCouponCode("");
      setCouponError("");
      toast({ title: `${plans.find(p => p.key === planKey)?.name} Activated!`, description: "Your plan has been upgraded via coupon." });
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => {
            const isActive = currentPlan === plan.key;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-5 space-y-4 flex flex-col ${
                  plan.highlight
                    ? "border-yellow-500/50 bg-gradient-to-b from-yellow-500/5 to-transparent"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  {plan.highlight && <Crown size={16} className="text-yellow-400" />}
                  <h2 className="text-base font-bold text-foreground">{plan.name}</h2>
                </div>
                <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={12} className="text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isActive ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 font-semibold text-sm border border-yellow-500/30">
                    <Crown size={14} /> Active
                  </div>
                ) : plan.key === "free" ? (
                  <div className="px-4 py-2.5 rounded-xl bg-secondary text-center text-sm text-muted-foreground font-medium">
                    Current Plan
                  </div>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={STRIPE_LINKS[plan.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      <Zap size={14} /> Upgrade Now
                    </a>
                    {couponOpen === plan.key ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                            placeholder="Coupon code"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            onKeyDown={(e) => e.key === "Enter" && handleCoupon(plan.key)}
                          />
                          <button
                            onClick={() => handleCoupon(plan.key)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-[10px] text-destructive text-center">{couponError}</p>}
                      </div>
                    ) : (
                      <button
                        onClick={() => { setCouponOpen(plan.key); setCouponCode(""); setCouponError(""); }}
                        className="w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Gift size={12} />
                        Have a coupon?
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
