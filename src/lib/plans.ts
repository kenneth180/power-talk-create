export type PlanTier = "free" | "pro" | "ultra" | "team";

export const PLAN_ORDER: PlanTier[] = ["free", "pro", "ultra", "team"];

export function getPlan(): PlanTier {
  const stored = localStorage.getItem("rock-plan") as PlanTier | null;
  // Legacy support
  if (!stored && localStorage.getItem("rock-pro") === "true") return "pro";
  return stored || "free";
}

export function setPlan(plan: PlanTier) {
  localStorage.setItem("rock-plan", plan);
  if (plan !== "free") localStorage.setItem("rock-pro", "true");
}

export function isPaidPlan(plan: PlanTier): boolean {
  return plan !== "free";
}

export function planLabel(plan: PlanTier): string {
  switch (plan) {
    case "free": return "Rock 5 Pro";
    case "pro": return "Rock 6 Pro";
    case "ultra": return "Rock 7 Ultra";
    case "team": return "Rock Team";
  }
}

export function imageMaxSize(plan: PlanTier): string {
  switch (plan) {
    case "free": return "1000x1000";
    case "pro": return "1250x1500";
    case "ultra": return "1550x1300";
    case "team": return "1750x1650";
  }
}

export function canEditImage(plan: PlanTier): boolean {
  return plan !== "free";
}

export const FREE_COUPON = "rock-copon-free";
