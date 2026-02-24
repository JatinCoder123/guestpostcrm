import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import useIdle from "../hooks/useIdle.js";
import { useDispatch, useSelector } from "react-redux";
import { createOffer, offersAction } from "../store/Slices/offers.js";
import { createDeal, dealsAction } from "../store/Slices/deals.js";
import { createOrder2, createOrder3, orderAction } from "../store/Slices/orders.js";
import { toast } from "react-toastify";
import PageLoader from "./PageLoader.jsx";
import { ManualSideCall } from "../services/utils.js";

const TYPE_LABELS = {
    deals: "Deals",
    offers: "Offers",
    orders: "Orders",
};

// Truncate long text (doc_link)
const truncateText = (text, max = 35) =>
    text?.length > max ? text.slice(0, max) + "..." : text;

// Generate random amount if null
const getValidAmount = (amount, min = 50, max = 150) => {
    if (amount !== null && amount !== undefined) return Number(amount);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const SyncSelectionModal = ({
    onClose,
    data = [],
    type = "deals",
}) => {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const { threadId } = useSelector(state => state.viewEmail);
    const { email } = useSelector(state => state.ladger);
    const { creating: offerCreating, message: offerMessage, error: offerError } = useSelector(state => state.offers);
    const { creating: dealCreating, message: dealMessage, error: dealError } = useSelector(state => state.deals);
    const { creating: orderCreating, message: orderMessage, error: orderError } = useSelector(state => state.orders);
    const { crmEndpoint } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [refreshLadger] = useIdle({ idle: false });

    useEffect(() => {
        if (offerMessage) {
            toast.success(offerMessage)
            ManualSideCall(
                crmEndpoint,
                email,
                "Our Offers Create and Sync Successfully",
                1,
                refreshLadger,
            );
            offersAction.clearAllMessages()
            onClose()
        }
        if (dealMessage) {
            toast.success(dealMessage)
            ManualSideCall(
                crmEndpoint,
                email,
                "Our Deals Create and Sync Successfully",
                1,
                refreshLadger,
            );
            dealsAction.clearAllMessages()
            onClose()
        }
        if (orderMessage) {
            // toast.success(orderMessage)
            ManualSideCall(
                crmEndpoint,
                email,
                "Our Order Create and Sync Successfully",
                1,
                refreshLadger,
            );
            orderAction.clearAllMessages()
            onClose()
        }
        if (offerError) {
            toast.success(offerError)
            offersAction.clearAllErrors()
            onClose()
        }
        if (dealError) {
            toast.success(dealError)
            dealsAction.clearAllErrors()
            onClose()
        }
        if (orderError) {
            toast.success(orderError)
            orderAction.clearAllErrors()
            onClose()
        }

    }, [offerMessage, dealMessage, orderMessage, offerError, dealError, orderError])
    const normalizedData = useMemo(
        () =>
            data.map((item) => ({
                ...item,
                _amount: getValidAmount(item.amount),
            })),
        [data]
    );

    const allSelected =
        selectedIds.size === normalizedData.length && normalizedData.length > 0;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(normalizedData.map((item) => item.id)));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const selectedItems = useMemo(
        () => normalizedData.filter((item) => selectedIds.has(item.id)),
        [normalizedData, selectedIds]
    );

    const totalAmount = selectedItems.reduce(
        (sum, item) => sum + item._amount,
        0
    );

    const handleProceed = () => {
        if (type === "offers") {
            const offers = selectedItems.map((item) => ({
                amount: item.amount,                // client offer amount
                client_offer_c: item.amount,         // same as amount
                our_offer_c: item.our_offer_c,       // our offer
                website: item.website || item.domain || "",
                email: email,
            }));

            dispatch(createOffer(threadId, offers, false));
        }
        else if (type === "deals") {
            const deals = selectedItems.map((item) => ({
                dealamount: item.amount,                // client offer amount
                website_c: item.website || item.domain || "",
                email: email,
            }));

            dispatch(createDeal(threadId, deals, false));
        }
        else if (type === "orders") {
            const orders = selectedItems.map((item) => ({
                order_type: item.type,
                seo_backlinks: [
                    {
                        gp_doc_url_c: item.doc_link
                    }
                ]
            }));

            dispatch(createOrder3(email, orders, false, threadId));
        }
    };


    return (
        <>
            {(offerCreating || dealCreating || orderCreating) && <PageLoader />}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Sync {TYPE_LABELS[type]}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Select {TYPE_LABELS[type].toLowerCase()} to sync
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-black"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Select All */}
                    <div className="flex items-center justify-between px-6 py-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Select All</span>
                        </label>

                        <span className="text-sm text-gray-500">
                            {selectedIds.size} selected
                        </span>
                    </div>

                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto px-6">
                        {normalizedData.map((item) => {
                            const checked = selectedIds.has(item.id);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleSelect(item.id)}
                                    className={`flex items-center justify-between rounded-xl border p-4 mb-3 cursor-pointer transition
                  ${checked
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <div
                                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded border
                      ${checked
                                                    ? "border-blue-500 bg-blue-500 text-white"
                                                    : "border-gray-300"
                                                }`}
                                        >
                                            {checked && <Check size={14} />}
                                        </div>

                                        {/* Content */}
                                        <div>
                                            {(type === "deals" || type === "offers") &&
                                                item.website && (
                                                    <p className="font-medium text-gray-900">
                                                        {item.website}
                                                    </p>
                                                )}

                                            {type === "orders" && item.doc_link && (
                                                <a
                                                    href={item.doc_link}
                                                    target="_blank"
                                                    // rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {truncateText(item.doc_link)}
                                                </a>
                                            )}

                                            {item.date && (
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-sm font-semibold text-gray-900">
                                        ${item._amount}
                                    </div>
                                </div>
                            );
                        })}

                        {normalizedData.length === 0 && (
                            <p className="py-10 text-center text-sm text-gray-500">
                                No {TYPE_LABELS[type].toLowerCase()} available
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t px-6 py-4">
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-lg font-semibold">${totalAmount}</p>
                        </div>

                        <button
                            onClick={handleProceed}
                            disabled={selectedIds.size === 0}
                            className="rounded-xl bg-blue-600 px-6 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                        >
                            Proceed & Sync
                        </button>
                    </div>
                </div>
            </div>
        </>

    );
};

export default SyncSelectionModal;