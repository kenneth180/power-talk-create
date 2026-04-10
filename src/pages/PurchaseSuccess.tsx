import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PurchaseSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    localStorage.setItem("rock-pro", "true");
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      navigate("/plans-buy");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center"
        >
          <CheckCircle size={32} className="text-white" />
        </motion.div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown size={20} className="text-yellow-400" />
            <h1 className="text-2xl font-bold text-foreground">You bought Rock 6 Pro!</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Purchase successful. Enjoy faster, smarter AI responses.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Redirecting to plans in{" "}
          <span className="font-bold text-foreground">{countdown}</span> seconds…
        </div>
      </motion.div>
    </div>
  );
}
