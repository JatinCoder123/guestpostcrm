import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageHeader from "../../PageHeader";

const ORDER_TYPES = ["GUEST POST", "LINK INSERTION"];

const CreateOrders = ({ email, threadId }) => {
    const [button, setButton] = useState(null);
    const { creating } = useSelector(state => state.orders)
    // 🔥 INTERNAL STATE
    const [order, setOrder] = useState({
        order_type: "GUEST POST",
        seo_backlinks: [
            {
                backlink_url: "",
                gp_doc_url_c: "",
                website: "",
                anchor_text_c: "",
            },
        ],
    });

    /* ---------------- DATE FORMAT ---------------- */
    const getFormattedDate = () => {
        const d = new Date();
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    /* ---------------- CHANGE ---------------- */
    const handleChange = (key, value) => {
        setOrder((prev) => ({
            ...prev,
            [key]: value,
            date_entered_formatted: getFormattedDate(),
        }));
    };

    /* ---------------- SEO LINKS ---------------- */
    const addSeoLink = () => {
        setOrder((prev) => ({
            ...prev,
            seo_backlinks: [
                ...prev.seo_backlinks,
                {
                    backlink_url: "",
                    gp_doc_url_c: "",
                    website: "",
                    anchor_text_c: "",
                },
            ],
        }));
    };

    const updateSeoLink = (index, key, value) => {
        const links = [...order.seo_backlinks];

        links[index] = {
            ...links[index],
            [key]: value,
        };

        setOrder((prev) => ({
            ...prev,
            seo_backlinks: links,
        }));
    };

    const removeSeoLink = (index) => {
        const links = order.seo_backlinks.filter((_, i) => i !== index);

        setOrder((prev) => ({
            ...prev,
            seo_backlinks: links,
        }));
    };

    /* ---------------- VALIDATION ---------------- */
    const isFormValid = () => {
        if (!order.order_type) return false;

        if (!order.seo_backlinks.length) return false;

        for (const link of order.seo_backlinks) {
            if (!link.website?.trim()) return false;

            if (order.order_type === "GUEST POST") {
                if (!link.gp_doc_url_c?.trim()) return false;
            }

            if (order.order_type === "LINK INSERTION") {
                if (!link.backlink_url?.trim()) return false;
                if (!link.anchor_text_c?.trim()) return false;
            }
        }

        return true;
    };

    const formValid = isFormValid();

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = (send) => {
        if (creating || !formValid) return;

        const finalOrder = {
            ...order,
            date_entered_formatted: getFormattedDate(),
        };

        console.log("FINAL ORDER:", finalOrder);

        // 🔥 Call parent or API
        if (onSubmitFinal) {
            onSubmitFinal(finalOrder, send);
        }
    };

    /* ---------------- RENDER ---------------- */
    return (
        <div className="flex-1 flex flex-col gap-3 relative border rounded-2xl p-6 bg-white shadow-sm">

            <PageHeader title={"CREATE ORDER"} showAdd={false} />
            {/* ---------------- TABS ---------------- */}
            <div className="flex gap-3">
                {ORDER_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => handleChange("order_type", type)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${order.order_type === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* ---------------- LINKS ---------------- */}
            {order.seo_backlinks.map((link, index) => (
                <div
                    key={index}
                    className="border p-4 rounded-xl space-y-3 bg-gray-50 relative"
                >
                    <button
                        type="button"
                        onClick={() => removeSeoLink(index)}
                        className="absolute -top-3 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    {/* GUEST POST */}
                    {order.order_type === "GUEST POST" && (
                        <>
                            <input
                                placeholder="Website"
                                value={link.website}
                                onChange={(e) =>
                                    updateSeoLink(index, "website", e.target.value)
                                }
                                className="border p-2 rounded w-full"
                            />

                            <input
                                placeholder="Doc URL"
                                value={link.gp_doc_url_c}
                                onChange={(e) =>
                                    updateSeoLink(index, "gp_doc_url_c", e.target.value)
                                }
                                className="border p-2 rounded w-full"
                            />
                        </>
                    )}

                    {/* LINK INSERTION */}
                    {order.order_type === "LINK INSERTION" && (
                        <>
                            <input
                                placeholder="Website"
                                value={link.website}
                                onChange={(e) =>
                                    updateSeoLink(index, "website", e.target.value)
                                }
                                className="border p-2 rounded w-full"
                            />

                            <input
                                placeholder="Backlink URL"
                                value={link.backlink_url}
                                onChange={(e) =>
                                    updateSeoLink(index, "backlink_url", e.target.value)
                                }
                                className="border p-2 rounded w-full"
                            />

                            <input
                                placeholder="Anchor Text"
                                value={link.anchor_text_c}
                                onChange={(e) =>
                                    updateSeoLink(index, "anchor_text_c", e.target.value)
                                }
                                className="border p-2 rounded w-full"
                            />
                        </>
                    )}
                </div>
            ))}

            {/* ADD */}
            <button
                onClick={addSeoLink}
                className="px-4 py-2 w-fit bg-blue-600 text-white rounded-lg ml-5"
            >
                + Add Link
            </button>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
                <button
                    disabled={!formValid}
                    onClick={() => {
                        setButton(1);
                        handleSubmit(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-white ${formValid ? "bg-green-600" : "bg-gray-300"
                        }`}
                >
                    {creating && button === 1 ? "Saving..." : "Save"}
                </button>

                <button
                    disabled={!formValid}
                    onClick={() => {
                        setButton(2);
                        handleSubmit(true);
                    }}
                    className={`px-4 py-2 rounded-lg text-white ${formValid ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                >
                    {creating && button === 2 ? "Sending..." : "Save & Send"}
                </button>
            </div>
        </div>
    );
};

export default CreateOrders;