import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingChase } from "./Loading";
import { OrderView } from "./OrderView";

export default function Create({
    data,
    email,
    validWebsite = [],
    setData,
    type,
    pageType,
    creating,
    deleting,
    deleteId,
    sending,
    fields,
    lists = [],
    submitData,
    sendHandler,
    handleDelete,
    websiteKey = "website",
    handleUpdate,
    updating,
    renderPreview,
    preview = true,
    amountKey,
}) {
    const navigate = useNavigate();
    const { loading, message } = useSelector((state) => state.threadEmail);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        if (activeIndex >= data.length && data.length > 0)
            setActiveIndex(data.length - 1);
    }, [data.length, activeIndex]);

    const removeData = (id) => {
        setData((prev) => prev.filter((d) => d.id !== id));
    };

    const updateData = (idx, patch) => {
        setData((prev) => {
            const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
            return next;
        });
    };
    const addData = () => {
        const newData = getEmptyData(fields);
        setData((prev) => [newData, ...prev]);
    };

    const getEmptyData = (fields) => {
        const newData = { id: `${Date.now()}${Math.random()}` };
        fields.forEach((field) => {
            newData[field.name] = "";
        });
        newData["email"] = email;

        return newData;
    };

    const handelChange = (idx = null, field, e) => {
        const value = e.target.value;

        if (field === websiteKey) {
            const alreadyUsed = data.some(
                (d, i) => i !== idx && d[websiteKey] === value
            );

            if (alreadyUsed) {
                toast.error("This website is already used in another deal");
                return;
            }
        }

        updateData(idx, { [field]: value });
    };
    const handelUpdateList = (itemIndex, updatedList) => {
        updateData(itemIndex, { seo_backlinks: updatedList });
    };

    const valid = useMemo(() => {
        if (data.length > 0) {
            if (type == "deals") {
                return data.every(
                    (d) =>
                        String(
                            d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]
                        ).trim() !== "" &&
                        Number(d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]) >
                        0 &&
                        String(d[websiteKey]).trim() !== ""
                );
            } else if (type == "offers") {
                return data.every(
                    (d) =>
                        String(d["client_offer_c"]).trim() !== "" &&
                        Number(d["client_offer_c"]) > 0 &&
                        String(d[websiteKey]).trim() !== ""
                );
            }
        }
        return false;
    }, [data]);

    useEffect(() => {
        if (message) {
            navigate(-1);
        }
    }, [message]);

    const handleSubmit = () => {
        if (data.length === 0) {
            toast.error(`No ${type} to submit.`);
            return;
        }
        if (!valid) {
            toast.error(`Please validate all ${type} before submitting.`);
            return;
        }
        submitData();
    };
    return (
        <>
            <div className="w-full min-h-[80vh] p-6 bg-gray-50 flex justify-center">
                <div className="w-full max-w-6xl flex justify-between gap-6">
                    {/* LEFT SECTION */}
                    <div className="col-span-12 flex-1 lg:col-span-8">
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative">
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        <MoveLeft size={16} />
                                    </button>
                                    <h3 className="text-2xl font-semibold">{`${pageType == "view"
                                        ? ""
                                        : pageType.charAt(0).toUpperCase() + pageType.slice(1)
                                        } ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h3>
                                </div>
                                {pageType == "view" && type !== "orders" && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                navigate(`/${type}/create`, { state: { email } })
                                            }
                                            className="inline-flex items-center gap-2 "
                                        >
                                            <img
                                                width="40"
                                                height="40"
                                                src="https://img.icons8.com/arcade/64/plus.png"
                                                alt="plus"
                                            />{" "}
                                        </button>
                                    </div>
                                )}
                                {pageType == "create" && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={addData}
                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {data.length > 0 &&
                                        data.map((item, itemIndex) => (
                                            <div key={item.id} index={itemIndex}>
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    className={`bg-white relative border border-gray-100 p-6 ${pageType == "edit" && "pb-15"
                                                        } rounded-2xl shadow-sm `}
                                                >
                                                    {pageType == "view" && (
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/${type}/edit/${item.id}`, {
                                                                    state: { email },
                                                                })
                                                            }
                                                            className={`flex items-center right-2 absolute ${!showPreview ? "z-[100]" : ""
                                                                } top-2 gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition`}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                    {pageType !== "edit" && type !== "orders" && (
                                                        <button
                                                            onClick={() => {
                                                                pageType == "create"
                                                                    ? removeData(item.id)
                                                                    : handleDelete(item.id);
                                                            }}
                                                            className="flex items-center right-16 absolute  top-2 gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                                        >
                                                            {deleting && deleteId == item.id ? (
                                                                <LoadingChase size="20" color="white" />
                                                            ) : (
                                                                <Trash size={16} />
                                                            )}
                                                        </button>
                                                    )}
                                                    {pageType == "edit" && (
                                                        <div className="flex absolute  right-2 bottom-2  items-center  gap-2">
                                                            <button
                                                                onClick={() => navigate(-1)}
                                                                disabled={updating}
                                                                className={`flex items-center gap-2 px-3 py-1.5 ${updating ? "cursor-not-allowed" : ""
                                                                    } bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition`}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdate(item)}
                                                                disabled={updating}
                                                                className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg transition ${!updating
                                                                    ? "bg-green-500 hover:bg-green-600"
                                                                    : "bg-green-300 cursor-not-allowed"
                                                                    }`}
                                                            >
                                                                {updating ? "Updating..." : "Update"}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {type == "orders" && pageType == "view" ? (
                                                        <OrderView data={item} />
                                                    ) : (
                                                        <>
                                                            {" "}
                                                            <div className="mt-4 flex flex-wrap gap-3">
                                                                {fields.map((field, fieldIndex) => (
                                                                    <InputField
                                                                        key={fieldIndex}
                                                                        pageType={pageType}
                                                                        {...field}
                                                                        data={item}
                                                                        onChange={(e) =>
                                                                            handelChange(itemIndex, field.name, e)
                                                                        }
                                                                        websiteLists={validWebsite}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </motion.div>
                                            </div>
                                        ))}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            {pageType !== "edit" && (
                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Total {type[0].toUpperCase() + type.slice(1)}: {data.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    {pageType !== "edit" && type !== "orders" && (
                        <div className="col-span-12 lg:col-span-4">
                            <div className="sticky top-6 space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="font-semibold">
                                        {type[0].toUpperCase() + type.slice(1)} for {email}
                                    </h4>

                                    <div className="mt-3 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>
                                                Total {type[0].toUpperCase() + type.slice(1)}:
                                            </span>
                                            <strong>{data.length}</strong>
                                        </div>

                                        {/* Website breakdown */}
                                        <div className="mt-3">
                                            <strong className="block mb-1">Websites</strong>

                                            {data.length === 0 ? (
                                                <p className="text-gray-400">No websites selected</p>
                                            ) : (
                                                <ul className="list-none space-y-1">
                                                    {data.map((d, i) => (
                                                        <li key={i}>
                                                            {d[websiteKey] || "(no site)"}
                                                            {amountKey && (
                                                                <strong>
                                                                    - $
                                                                    {isNaN(Number(d[amountKey]))
                                                                        ? 0
                                                                        : Number(d[amountKey])}
                                                                </strong>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    {type !== "orders" && (
                                        <div className="mt-4 flex gap-3">
                                            {pageType == "view" ? (
                                                <>
                                                    <button
                                                        disabled={data.length === 0}
                                                        onClick={() => sendHandler()}
                                                        className={`w-full px-3 py-2 rounded-lg text-white ${sending
                                                            ? "bg-green-300 cursor-not-allowed"
                                                            : "bg-green-600 hover:bg-green-700"
                                                            }`}
                                                    >
                                                        {sending ? "Sending..." : "Send"}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowPreview(true)}
                                                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
                                                    >
                                                        Preview
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    disabled={data.length === 0 || !valid}
                                                    onClick={handleSubmit}
                                                    className={`w-full px-3 py-2 rounded-lg text-white ${data.length === 0 || !valid
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : "bg-green-600 hover:bg-green-700"
                                                        }`}
                                                >
                                                    {creating ? "Submitting..." : "Submit"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* PREVIEW MODAL */}
                {showPreview && preview && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">
                        {/* OUTER WRAPPER (WIDER + ROUNDED) */}
                        <div className="bg-white w-full max-w-[800px] rounded-2xl shadow-2xl overflow-hidden relative">
                            {/* SCROLLABLE CONTENT */}
                            <div className="max-h-[80vh] overflow-y-auto p-6">
                                {renderPreview({ data, email })}
                            </div>

                            {/* FOOTER BUTTONS */}
                            <div className="p-4 border-t flex items-center justify-between bg-white">
                                <button
                                    onClick={() => sendHandler()}
                                    className="px-[26px] py-[12px] bg-gradient-to-br from-[#4e79ff] to-[#6db6ff] text-white rounded-lg border-none cursor-pointer text-base font-bold shadow-[0px_4px_12px_rgba(0,0,0,0.15)]"
                                >
                                    {loading ? "Submitting..." : "Submit " + type}
                                </button>

                                <button
                                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                                    onClick={() => setShowPreview(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function InputField({
    label,
    name,
    data,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    pageType = "",
    websiteLists = [],
}) {
    const { statusLists } = useSelector((state) => state.orders);
    const value = data?.[name] ?? "";
    const isDisabled =
        pageType === "create" ? false : pageType === "view" ? true : disabled;

    const inputType = pageType === "view" && type === "select" ? "text" : type;
    return (
        <div
            className={`${inputType === "number" ? "w-30" : "w-full"} max-w-[300px]`}
        >
            <label
                className={`block mb-1 ${pageType === "view"
                    ? "text-gray-500 text-sm"
                    : "text-xs text-gray-600"
                    } ${label == "Order Status" ? "text-yellow-600 font-bold" : ""}`}
            >
                {label}
            </label>

            {/* ================= SELECT ================= */}
            {inputType === "select" && (
                <select
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                    className={`w-full rounded-xl px-3 py-2 ${pageType === "view" || isDisabled
                        ? "bg-gray-100"
                        : "bg-white border"
                        }`}
                >
                    <option value="" disabled>
                        Select {label}
                    </option>

                    {/* Order Status (object → key/value) */}
                    {label === "Order Status"
                        ? Object.entries(statusLists).map(([key, val]) => (
                            <option key={key} value={key}>
                                {val}
                            </option>
                        ))
                        : websiteLists.map((opt, idx) => (
                            <option key={idx} value={opt}>
                                {opt}
                            </option>
                        ))}
                </select>
            )}

            {/* ================= TEXTAREA ================= */}
            {inputType === "textarea" && (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    rows={4}
                    className={`w-full rounded-xl px-3 py-2 resize-none ${pageType === "view" || isDisabled
                        ? "bg-gray-100"
                        : "bg-white border"
                        }`}
                />
            )}

            {/* ================= INPUT ================= */}
            {inputType !== "select" &&
                inputType !== "textarea" &&
                inputType !== "list" && (
                    <div className="flex items-center gap-1">
                        {inputType === "number" && <span>$</span>}
                        <input
                            value={value === "N/A" ? "" : value}
                            onChange={onChange}
                            placeholder={placeholder}
                            type={inputType}
                            disabled={isDisabled}
                            inputMode={inputType === "number" ? "numeric" : undefined}
                            className={`w-full rounded-xl px-3 py-2 ${pageType === "view" || isDisabled
                                ? "bg-gray-100"
                                : "bg-white border"
                                }`}
                        />
                    </div>
                )}
        </div>
    );
}
