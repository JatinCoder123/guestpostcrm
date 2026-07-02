import { motion } from "framer-motion";
import {
  Check,
  Download,
  CreditCard,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlansPage() {
  const navigate = useNavigate();

  const plans = [
    {
      id: 1,
      name: "Starter",
      price: 10,
      credits: "10,000 AI Credits",
      description: "Perfect for individuals getting started.",
      popular: false,
      features: [
        "AI Reply",
        "AI Summary",
        "Email Assistant",
        "Basic Support",
      ],
    },
    {
      id: 2,
      name: "Professional",
      price: 25,
      credits: "50,000 AI Credits",
      description: "Best choice for daily AI usage.",
      popular: true,
      features: [
        "Unlimited AI Reply",
        "AI Summary",
        "Priority Queue",
        "Priority Support",
        "Advanced AI Features",
      ],
    },
    {
      id: 3,
      name: "Enterprise",
      price: 50,
      credits: "Unlimited Credits",
      description: "Built for teams and organizations.",
      popular: false,
      features: [
        "Unlimited Everything",
        "API Access",
        "Multiple Users",
        "Dedicated Support",
      ],
    },
  ];

  const invoices = [
    {
      id: "INV-1001",
      plan: "Professional",
      amount: "₹999",
      date: "02 Jul 2026",
      status: "Paid",
    },
    {
      id: "INV-1000",
      plan: "Starter",
      amount: "₹299",
      date: "02 Jun 2026",
      status: "Paid",
    },
    {
      id: "INV-0999",
      plan: "Starter",
      amount: "₹299",
      date: "02 May 2026",
      status: "Paid",
    },
    {
      id: "INV-0998",
      plan: "Starter",
      amount: "₹299",
      date: "02 Apr 2026",
      status: "Paid",
    },
  ];

  const choosePlan = (plan) => {
    navigate(`/recharge?plan=${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Choose Your Plan
          </h1>

          <p className="mt-3 text-slate-500">
            Purchase AI credits and unlock premium AI features.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8 }}
              className={`relative rounded-3xl border bg-white p-7 shadow-sm transition-all ${plan.popular
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow">
                  Most Popular
                </div>
              )}

              <h2 className="text-2xl font-bold">{plan.name}</h2>

              <p className="mt-2 text-sm text-gray-500">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-5xl font-bold">
                  ${plan.price}
                </span>

                <span className="text-gray-500"> / plan</span>
              </div>

              <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {plan.credits}
              </div>

              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <Check
                      size={18}
                      className="text-green-500"
                    />
                    <span className="text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => choosePlan(plan)}
                className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Choose Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}