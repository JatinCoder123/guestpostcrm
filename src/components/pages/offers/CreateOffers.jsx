import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import SummaryCard from "../../SummaryCard";
import PageHeader from "../../PageHeader";
import { buildTable } from "../../Preview";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { Trash2 } from "lucide-react";

export default function CreateOffers() {
    const navigate = useNavigate();
    const location = useLocation();
    const { threadId } = useParams();
    const email = location.state?.email;

    const { websites: websiteLists } = useSelector((state) => state.website);
    const { deals } = useSelector((state) => state.deals);
    const { offers } = useSelector((state) => state.offers);

    const { handleMove } = useThreadContext();

    const [newOffers, setNewOffers] = useState([
        { website: "", client_offer_c: "", our_offer_c: "" },
    ]);

    const [validWebsite, setValidWebsite] = useState([]);
    const getAvailableWebsites = (currentIndex) => {
        return validWebsite.filter((site) => {
            return !newOffers.some(
                (offer, i) => i !== currentIndex && offer.website === site
            );
        });
    };
    // 🔥 FILTER VALID WEBSITES
    useEffect(() => {
        const threadOffers = offers.filter(
            (d) => d.thread_id == threadId
        );

        const threadDeals = deals.filter(
            (d) => d.thread_id == threadId
        );

        const valid = websiteLists.filter((w) => {
            const usedInOffers = threadOffers.some((o) => o.website === w);
            const usedInDeals = threadDeals.some((d) => d.website_c === w);

            return !usedInOffers && !usedInDeals;
        });

        setValidWebsite(valid);
    }, [offers, deals, threadId]);

    // 🔥 HANDLERS
    const handleAddRow = () => {
        setNewOffers([
            ...newOffers,
            { website: "", client_offer_c: "", our_offer_c: "" },
        ]);
    };
    const isFormValid = newOffers.length > 0 && newOffers.every(
        (offer) =>
            offer.website &&
            offer.client_offer_c !== "" &&
            offer.our_offer_c !== ""
    );
    const canAddRow = newOffers.every(
        (offer) =>
            offer.website &&
            offer.client_offer_c !== "" &&
            offer.our_offer_c !== ""
    );

    const handleChangeRow = (index, field, value) => {
        const updated = [...newOffers];
        updated[index][field] = value;
        setNewOffers(updated);
    };

    const handleRemoveRow = (index) => {
        setNewOffers(newOffers.filter((_, i) => i !== index));
    };

    const handleSave = (send = false) => {
        console.log("Saving:", newOffers);

        if (send) {
            handlePreview();
        }

        navigate(-1); // go back
    };

    const handlePreview = () => {
        const tableHtml = buildTable(
            newOffers,
            "Offers",
            "website",
            "our_offer_c"
        );

        handleMove({
            email,
            threadId,
            reply: tableHtml,
        });
    };

    return (
        <div className="w-full flex gap-6 items-start">

            {/* 🔥 LEFT SIDE (TABLE) */}
            <div className="flex-1 border rounded-2xl p-6 bg-white shadow-sm">

                <PageHeader title={"Create Offers"} showAdd={false} />

                {/* HEADER */}
                <div className="grid grid-cols-10 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                    <div className="col-span-1">No</div>
                    <div className="col-span-3">Website</div>
                    <div className="col-span-2 text-center">Client Offer</div>
                    <div className="col-span-2 text-center">Our Offer</div>
                    <div className="col-span-2 text-center">Action</div>
                </div>

                {/* ROWS */}
                <div className="space-y-2 mt-2">
                    {newOffers.map((row, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-10 items-center px-4 py-3 bg-gray-50 rounded-xl border"
                        >
                            <div className="col-span-1">{index + 1}</div>

                            <div className="col-span-3">
                                <select
                                    value={row.website}
                                    onChange={(e) =>
                                        handleChangeRow(index, "website", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-2 py-1"
                                >
                                    <option value="">Select</option>
                                    {getAvailableWebsites(index).map((site, i) => (
                                        <option key={i} value={site}>
                                            {site}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 text-center">
                                <input
                                    type="number"
                                    value={row.client_offer_c}
                                    onChange={(e) =>
                                        handleChangeRow(index, "client_offer_c", e.target.value)
                                    }
                                    className="w-20 border rounded px-2 py-1 text-center"
                                />
                            </div>

                            <div className="col-span-2 text-center">
                                <input
                                    type="number"
                                    value={row.our_offer_c}
                                    onChange={(e) =>
                                        handleChangeRow(index, "our_offer_c", e.target.value)
                                    }
                                    className="w-20 border rounded px-2 py-1 text-center"
                                />
                            </div>

                            <div className="col-span-2 text-center">
                                <button
                                    onClick={() => handleRemoveRow(index)}
                                    className="text-red-500"
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ADD ROW */}
                <button
                    onClick={handleAddRow}
                    disabled={!canAddRow}
                    className={`mt-4 px-4 py-2 rounded-lg
    ${canAddRow ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
  `}
                >
                    + Add Offer
                </button>
            </div>

            {/* 🔥 RIGHT SIDE (SUMMARY) */}
            <SummaryCard
                data={newOffers}
                type={"offers"}
                websiteKey={"website"}
                amountKey={"our_offer_c"}
            >
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={!isFormValid}
                        className={`flex-1 py-3 rounded-xl text-white transition
    ${isFormValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}
  `}
                    >
                        Save
                    </button>

                    <button
                        onClick={() => handleSave(true)}
                        disabled={!isFormValid}
                        className={`flex-1 py-3 rounded-xl text-white transition
    ${isFormValid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"}
  `}
                    >
                        Save & Send
                    </button>
                </div>
            </SummaryCard>
        </div>
    );
}