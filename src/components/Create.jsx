import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListPlus, MoveLeft, Pencil, Plus, PlusIcon, Trash, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingChase } from "./Loading";

export default function Create({ data, email, validWebsite = [], setData, type, pageType, creating, deleting, deleteId, sending, fields, lists = [], submitData, sendHandler, handleDelete, websiteKey = "website", handleUpdate, updating, renderPreview, preview = true, amountKey }) {
    const navigate = useNavigate();
    const { loading, message } = useSelector((state) => state.threadEmail);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        if (activeIndex >= data.length && data.length > 0)
            setActiveIndex(data.length - 1);
    }, [data.length, activeIndex]);

    const removeData = (id) => {
        setData((prev) => prev.filter(d => d.id !== id));
    };

    const updateData = (idx, patch) => {
        setData((prev) => {
            const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
            return next;
        })
    };
    const addData = () => {
        const newData = getEmptyData(fields)
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


    const valid = useMemo(
        () => {
            if (data.length > 0) {
                if (type == "deals") {
                    return data.every(
                        (d) => String(d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]).trim() !== "" && Number(d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]) > 0 && String(d[websiteKey]).trim() !== ""
                    )
                }
                else if (type == "offers") {
                    return data.every(
                        (d) => String(d["client_offer_c"]).trim() !== "" && Number(d["client_offer_c"]) > 0 && String(d[websiteKey]).trim() !== ""
                    )
                }
            }
            return false;
        },

        [data]
    );

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
        submitData()
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
                                    <h3 className="text-2xl font-semibold">{`${pageType == "view" ? "" : pageType.charAt(0).toUpperCase() + pageType.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h3>
                                </div>
                                {
                                    pageType == "view" && type !== "orders" && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/${type}/create`, { state: { email } })}
                                                className="inline-flex items-center gap-2 "
                                            >
                                                <img
                                                    width="40"
                                                    height="40"
                                                    src="https://img.icons8.com/arcade/64/plus.png"
                                                    alt="plus"
                                                />                                            </button>
                                        </div>
                                    )
                                }
                                {
                                    pageType == "create" && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={addData}
                                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                        </div>
                                    )
                                }
                            </div>

                            {/* Deals List */}
                            <DragDropContext >
                                <Droppable droppableId="deals-droppable">
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="space-y-4"
                                        >
                                            <AnimatePresence>
                                                {data.length > 0 && data.map((item, itemIndex) => (
                                                    <Draggable
                                                        key={item.id}
                                                        draggableId={item.id}
                                                        index={itemIndex}
                                                    >
                                                        {(dp) => (
                                                            <motion.div
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.98 }}
                                                                ref={dp.innerRef}
                                                                {...dp.draggableProps}
                                                                {...dp.dragHandleProps}
                                                                className={`bg-white relative border border-gray-100 p-6 ${pageType == "edit" && "pb-15"} rounded-2xl shadow-sm `}
                                                            >
                                                                {pageType == "view" && <button
                                                                    onClick={() => navigate(`/${type}/edit/${item.id}`, { state: { email } })}
                                                                    className="flex items-center right-2 absolute z-[100] top-2 gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>}
                                                                {pageType !== "edit" && type !== "orders" && <button
                                                                    onClick={() => { pageType == "create" ? removeData(item.id) : handleDelete(item.id) }}
                                                                    className="flex items-center right-16 absolute  top-2 gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                                                >
                                                                    {deleting && deleteId == item.id ? <LoadingChase size="20" color="white" /> : <Trash size={16} />}
                                                                </button>}
                                                                {pageType == "edit" && <div className="flex absolute  right-2 bottom-2  items-center  gap-2">
                                                                    <button
                                                                        onClick={() => navigate(-1)}
                                                                        disabled={updating}
                                                                        className={`flex items-center gap-2 px-3 py-1.5 ${updating ? "cursor-not-allowed" : ""} bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition`}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdate(item)}
                                                                        disabled={updating}
                                                                        className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg transition ${!updating ? "bg-green-500 hover:bg-green-600" : "bg-green-300 cursor-not-allowed"}`}
                                                                    >
                                                                        {updating ? "Updating..." : "Update"}</button>
                                                                </div>}
                                                                {type == "orders" && pageType == "view" && <OrderId order_id={item.order_id} />}
                                                                {type == "orders" && pageType == "view" ? <OrderView data={item} lists={lists} /> : <> <div className="mt-4 flex flex-wrap gap-3">
                                                                    {fields.map((field, fieldIndex) => <InputField key={fieldIndex} pageType={pageType} {...field} data={item} onChange={(e) => handelChange(itemIndex, field.name, e)} websiteLists={validWebsite} />)}
                                                                </div>
                                                                </>}
                                                                {type == "orders" && pageType == "edit" && <OrderListEdit data={item} onChange={(listName, e) => handelChange(itemIndex, listName, e)} />}
                                                            </motion.div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </AnimatePresence>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            {/* Footer */}
                            {pageType !== "edit" && <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Total {type[0].toUpperCase() + type.slice(1)}: {data.length}
                                </p>
                            </div>}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    {pageType !== "edit" && type !== "orders" && <div className="col-span-12 lg:col-span-4">
                        <div className="sticky top-6 space-y-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                <h4 className="font-semibold">{type[0].toUpperCase() + type.slice(1)} for {email}</h4>

                                <div className="mt-3 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Total {type[0].toUpperCase() + type.slice(1)}:</span>
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
                                                        {amountKey && <strong>- ${isNaN(Number(d[amountKey])) ? 0 : Number(d[amountKey])}</strong>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                {type !== "orders" && <div className="mt-4 flex gap-3">
                                    {pageType == "view" ? <><button
                                        disabled={data.length === 0}
                                        onClick={() => sendHandler()}
                                        className={`w-full px-3 py-2 rounded-lg text-white ${sending
                                            ? "bg-green-300 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {sending ? "Sending..." : "Send"}
                                    </button><button
                                        onClick={() => setShowPreview(true)}
                                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
                                    >
                                            Preview
                                        </button></> : <button
                                            disabled={data.length === 0 || !valid}
                                            onClick={handleSubmit}
                                            className={`w-full px-3 py-2 rounded-lg text-white ${data.length === 0 || !valid
                                                ? "bg-gray-300 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                                }`}
                                        >
                                        {creating ? "Submitting..." : "Submit"}
                                    </button>}
                                </div>}

                            </div>
                        </div>
                    </div>}
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
            </div ></>

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

    const inputType =
        pageType === "view" && type === "select" ? "text" : type;
    return (
        <div className={`${inputType === "number" ? "w-30" : "w-full"} max-w-[300px]`}>
            <label
                className={`block mb-1 ${pageType === "view" ? "text-gray-500 text-sm" : "text-xs text-gray-600"
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




function DisplayList({ data, label, spamScores, listIndex }) {
    // Normalize data to array
    const list = Array.isArray(data)
        ? data
        : typeof data === "string"
            ? data.split(",").map(item => item.trim()).filter(Boolean)
            : [];

    const spamScoreList = Array.isArray(spamScores)
        ? spamScores
        : typeof spamScores === "string"
            ? spamScores.split(",").map(item => item.trim()).filter(Boolean)
            : [];

    if (!list.length) return null;

    return (
        <div className="flex flex-col gap-3 group relative">
            {/* 3D Container */}
            <div className="relative transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3 mt-7 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500 overflow-hidden">

                    {/* Label */}
                    {label && (
                        <div className="flex items-center gap-2 px-5 pt-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {label}
                            </span>
                            {label === "Their Link" && (
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    (Spam Score)
                                </span>
                            )}
                        </div>
                    )}

                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Scrollable List */}
                    <div className="relative z-10 p-5 max-h-60 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1.5 relative">
                            {list.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="relative group/item transform transition-all duration-300 hover:translate-x-1 pl-6"
                                >
                                    {/* Vertical connector */}
                                    {idx !== list.length - 1 && (
                                        <span
                                            className="absolute left-[6px] top-6 w-[2px] h-full 
                      bg-gradient-to-b from-blue-400 via-purple-400 to-transparent
                      opacity-40"
                                        />
                                    )}

                                    {/* Hover background */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                                    <div className="relative flex items-center justify-between gap-2 p-1 rounded-lg">
                                        {/* Bullet + text */}
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="relative mt-1.5 flex-shrink-0">
                                                {/* Node glow */}
                                                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-sm opacity-60"></span>
                                                {/* Node */}
                                                <span className="relative block w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md shadow-blue-500/50"></span>
                                            </div>

                                            <span className="text-sm text-slate-700 font-medium break-words leading-relaxed">
                                                {item}
                                            </span>
                                        </div>

                                        {/* Spam Score */}
                                        {label === "Their Link" && spamScoreList[idx] && (
                                            <div className="relative flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur-md opacity-40"></div>
                                                <span className="relative inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 text-yellow-900 text-xs font-bold shadow-md border border-yellow-200">
                                                    {spamScoreList[idx]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            {listIndex == 1 && <img className="absolute z-[10] top-20 -left-6 " width="36" height="36" src="https://img.icons8.com/doodle/48/link--v1.png" alt="connected" />}

        </div>
    );
}

function Field({ label, value, link, children, title }) {
    const content = children || value;

    return (
        <div className="group perspective-1000">
            <div className="relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* 3D Shadow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transform translate-y-4 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-slate-900/10 rounded-2xl transform translate-y-2 translate-x-1"></div>

                {/* Main card with bevel effect */}
                <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500">
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Top edge highlight */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>

                    <div className="relative z-10">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            {label}
                        </div>
                        <div className="text-gray-800 font-semibold text-lg">
                            {link ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 underline decoration-2 underline-offset-4 transition-all"
                                >
                                    {title} →
                                </a>
                            ) : (
                                content
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}

function OrderView({ data, lists }) {
    return (
        <div className="w-full relative mt-3">
            <div className="relative  rounded-3xl  p-10 border border-slate-700/50">
                <div className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                        <Field label="Date" value={data.date_entered_formatted} />
                        <Field label="Type" value={data.order_type} />
                        <Field label="Amount" value={`$${data.total_amount_c}`} />
                        <Field label="Status">
                            <div className="relative inline-flex">
                                <span className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 text-yellow-900 font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_20px_rgba(234,179,8,0.4)] ">
                                    {data.order_status}
                                </span>
                            </div>
                        </Field>
                        <Field label="Invoice Link" value={data.invoice_link_c} link title="View Invoice" />
                        <Field label="Anchor Text" value={"Anchor Text"} />

                        <Field label="Document Link" value={data.doc_link_c} link title="View Document" />
                    </div>


                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {lists.length > 0 && lists.map((list, listIndex) => <DisplayList key={listIndex} spamScores={data.spam_score_c} data={data[list.name]} label={list.label} listIndex={listIndex} />)}

                </div>
            </div>
        </div>
    );
}

function OrderId({ order_id }) {
    return (
        <div className="w-full mb-6">
            {/* 3D Card Container */}
            <div className="relative group">
                {/* Main card */}
                <div className="relative rounded-2xl  overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">


                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center">
                        <div className="text-center">
                            {/* Label */}
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Order ID
                                </span>
                            </div>

                            {/* Order ID with metallic effect */}
                            <div className="relative inline-block">
                                <h2 className="text-2xl font-black  bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-100 tracking-tight ">
                                    {order_id}
                                </h2>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function OrderListEdit({ data, onChange }) {

    const lists = [
        { name: "our_link", label: "Our Link", value: data.our_link || "" },
        { name: "their_links", label: "Their Link", value: data.their_links || "" },
    ];

    const toArray = (value) =>
        value
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);

    const toString = (arr) => arr.join(",");

    const addItem = (name, currentValue) => {
        const newValue = prompt("Enter link");
        if (!newValue) return;
        const updatedArray = [...toArray(currentValue), newValue];
        onChange(name, { target: { value: toString(updatedArray) } });
    };

    const removeItem = (name, currentValue, index) => {
        const updatedArray = toArray(currentValue).filter((_, i) => i !== index);
        onChange(name, { target: { value: toString(updatedArray) } });
    };

    return (
        <div className="w-full mt-6 space-y-6">
            {/* Side-by-side Lists */}
            <div className="grid bg-white/10  rounded-xl grid-cols-1 md:grid-cols-2 gap-6">
                {lists.map((list) => {
                    const items = toArray(list.value);

                    return (
                        <div
                            key={list.name}
                            className="rounded-xl border border-white/10 p-4 "
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold ">
                                    {list.label}
                                </h3>
                                <button
                                    onClick={() => addItem(list.name, list.value)}
                                    className="p-1 rounded-full "
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                                {items.length === 0 && (
                                    <p className="text-xs text-slate-500">
                                        No items added
                                    </p>
                                )}

                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 border border-black/10
                                        px-3 py-2 rounded-lg bg-white/5 text-sm "
                                    >
                                        <span className="truncate">{item}</span>
                                        <button
                                            onClick={() =>
                                                removeItem(
                                                    list.name,
                                                    list.value,
                                                    idx
                                                )
                                            }
                                            className="bg-red-500 p-1 rounded-full text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
