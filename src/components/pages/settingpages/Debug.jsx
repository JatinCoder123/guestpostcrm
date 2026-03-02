import React, { useEffect, useMemo, useState } from "react";
import { CREATE_DEAL_API_KEY } from "../../../store/constants.js"
import useModule from "../../../hooks/useModule.js"
import { useSelector } from "react-redux";
const TABS = [
    {
        key: "error",
        label: "Error Logs",
        module: "outr_error_logs",
    },
    {
        key: "api",
        label: "API Request / Response",
        module: "outr_request_and_response",
    },
    {
        key: "prompt",
        label: "Prompt Ledger",
        module: "outr_prompt_ledger",
    },
];

const Debug = () => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const { crmEndpoint } = useSelector(state => state.user);

    const {
        loading,
        data,
        error,
        refetch,
    } = useModule({
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        method: "POST",
        body: {
            module: activeTab.module,
        },
        headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
        },
        name: activeTab.label,
    });

    // Refetch when tab changes
    useEffect(() => {
        refetch();
    }, [activeTab]);

    const columns = useMemo(() => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]);
    }, [data]);

    return (
        <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {TABS?.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab.key === tab.key
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow border">
                {loading && (
                    <div className="p-6 text-sm text-gray-500">
                        Loading {activeTab.label}...
                    </div>
                )}

                {error && (
                    <div className="p-6 text-sm text-red-600">
                        Failed to load data
                    </div>
                )}


            </div>
        </div>
    );
};

export default Debug;