import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import SummaryCard from "../../SummaryCard";
import PageHeader from "../../PageHeader";
import { buildTable } from "../../Preview";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { Trash2 } from "lucide-react";
import { Save, Send } from "lucide-react";
import IconButton from "../../ui/Buttons/IconButton";
import { createOffer, getOffers, offersAction } from "../../../store/Slices/offers";
import { toast } from "react-toastify";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { ManualSideCall } from "../../../services/utils";
import { getLadger } from "../../../store/Slices/ladger";

export default function CreateOffers({ threadId, email }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { websites: websiteLists } = useSelector((state) => state.website);
    const { crmEndpoint } = useSelector((state) => state.user);
    const { deals } = useSelector((state) => state.deals);
    const { offers, creating, message, error } = useSelector((state) => state.offers);
    const [send, setSend] = useState(false);
    const { handleMove } = useThreadContext();
    const { data: templateData } = useModule({
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        method: "POST",
        body: {
            module: "EmailTemplates",
            where: { name: "OfferORG" },
        },
        headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
        },
        name: "TemplateData",
    });
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

    const handleSave = async (isSend = false) => {
        setSend(isSend);

        dispatch(createOffer({ threadId, email, offers: newOffers, isSend }))
    };

    const handlePreview = () => {
        let html = templateData?.[0]?.body_html || "";

        const tableHtml = buildTable(
            newOffers,
            "Offers",
            "website",
            "our_offer_c"
        );

        html = html
            .replace("{{USER_EMAIL}}", email)
            .replace("{{TABLE}}", tableHtml);

        handleMove({ email, threadId, reply: html });
    };
    useEffect(() => {

        if (message) {
            toast.success(message);
            dispatch(getOffers({ email }))
            // 🔥 only move if send was true
            if (message?.includes("Created")) {
                ManualSideCall(
                    crmEndpoint,
                    email,
                    "Our Offer Created Successfully",
                    1,
                    () => dispatch(getLadger({ email })),
                );
                if (send) {
                    setSend(false);
                    dispatch(offersAction.clearAllMessages());
                    handlePreview();
                }
                else {
                    navigate(-1)
                    dispatch(offersAction.clearAllMessages());
                }
            }

        }

        if (error) {
            toast.error(error);
            setSend(false); // reset on error too
            dispatch(offersAction.clearAllErrors());
        }
    }, [message, error]);
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
                    <div className="col-span-2 text-center ml-auto">Action</div>
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

                            <div className="col-span-2 text-center ml-auto">
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

                <div className="flex gap-2 w-full justify-evenly ">
                    <IconButton
                        icon={Save}
                        label="Save"
                        onClick={() => handleSave(false)}
                        loading={creating && !send}
                        disabled={!isFormValid}
                        className={`bg-green-100 hover:bg-green-200 
      ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                    />

                    <IconButton
                        icon={Send}
                        label="Save & Send"
                        onClick={() => handleSave(true)}
                        loading={creating && send}
                        disabled={!isFormValid}
                        className={`bg-indigo-100 hover:bg-indigo-200 
      ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                </div>
            </SummaryCard>
        </div>
    );
}