import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown, Check, Gift } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateCoupon: (code: string) => void;
}

const STRIPE_LINK = "https://buy.stripe.com/test_28EfZhfu0cVQedUeg9eUU0c";
const FREE_COUPON = "rock-copon-free";

const proFeatures = [
  "Rock 6 Pro model — faster, smarter, longer answers",
  "Priority response speed",
  "Higher image generation quality (HD)",
  "Unlimited chat history",
  "Early access to new features",
];

export function UpgradeModal({ isOpen, onClose, onActivateCoupon }: UpgradeModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const handleCoupon = () => {
    if (couponCode.trim().toLowerCase() === FREE_COUPON) {
      onActivateCoupon(couponCode.trim());
      onClose();
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-yellow-400" />
                <h2 className="text-lg font-bold text-foreground">Upgrade to Rock 6 Pro</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-secondary-foreground">{f}</span>
                </div>
              ))}
            </div>

            <a
              href={STRIPE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Zap size={16} />
              Upgrade Now
            </a>

            <div className="mt-4">
              {!showCoupon ? (
                <button
                  onClick={() => setShowCoupon(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Gift size={12} />
                  Have a coupon code?
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                  />
                  <button
                    onClick={handleCoupon}
                    className="px-4 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-1.5 text-center">{couponError}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
