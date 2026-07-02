import { useState } from "react";
import {
    CreditCard,
    History,
    Wallet,
    BarChart3,
} from "lucide-react";

import PlansPage from "./PlansPage";
// import BillingHistory from "./BillingHistory";
// import PaymentMethods from "./PaymentMethods";
// import CreditUsage from "./CreditUsage";

export default function BillingSettings() {
    const [activeTab, setActiveTab] = useState("plans");

    const tabs = [
        {
            id: "plans",
            label: "Plans",
            icon: CreditCard,
        },
        {
            id: "history",
            label: "Billing History",
            icon: History,
        },
        {
            id: "payments",
            label: "Payment Methods",
            icon: Wallet,
        },
        {
            id: "usage",
            label: "Credit Usage",
            icon: BarChart3,
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    Billing
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage your subscription, payments and AI credits.
                </p>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">

                {/* Tabs */}

                <div className="flex border-b">

                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition

                ${activeTab === tab.id
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-500 hover:text-black"
                                    }
                `}
                            >
                                <Icon size={18} />

                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}

                <div className="p-6">

                    {activeTab === "plans" && <PlansPage />}

                    {activeTab === "history" && (
                        <BillingHistory />
                    )}

                    {activeTab === "payments" && (
                        <PaymentMethods />
                    )}

                    {activeTab === "usage" && (
                        <CreditUsage />
                    )}

                </div>
            </div>
        </div>
    );
}