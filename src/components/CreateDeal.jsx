import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, MoveLeft } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction } from "../store/Slices/deals";
import { websiteListForDeal } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import PreviewDeals from "./PreviewDeals";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { renderToStaticMarkup } from "react-dom/server";


export default function CreateDeal() {
  const { email } = useSelector((state) => state.ladger);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const {
    creating,
    deals: prevDeals,
    error,
    message,
  } = useSelector((state) => state.deals);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function createEmptyDeal(seed = Date.now()) {
    return {
      id: String(seed) + Math.random().toString(36).slice(2, 7),
      dealamount: "",
      website_c: "",
      email,
      createdAt: new Date().toISOString(),
    };
  }

  // ────────────────────────────────────────────────
  // INITIAL STATE — allow empty array
  const [deals, setDeals] = useState(() => {
    try {
      return [];
    } catch (e) {
      toast.error(e);
      return [];
    }
  });

  const [validWebsites, setValidWebsites] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // ────────────────────────────────────────────────
  // Create a Set of used websites
  const fillEmptyWebsites = (arr) => {
    if (!arr || arr.length === 0) return arr;

    const used = new Set(arr.map((d) => d.website_c).filter(Boolean));
    const result = arr.map((d) => ({ ...d }));

    let siteIdx = 0;
    for (let i = 0; i < result.length; i++) {
      if (!result[i].website_c) {
        while (
          siteIdx < validWebsites.length &&
          used.has(validWebsites[siteIdx])
        ) {
          siteIdx++;
        }
        if (siteIdx < validWebsites.length) {
          result[i].website_c = validWebsites[siteIdx];
          used.add(validWebsites[siteIdx]);
          siteIdx++;
        }
      }
    }
    return result;
  };

  // ────────────────────────────────────────────────
  // Fill empty websites ONCE validWebsites load
  useEffect(() => {
    setDeals((prev) => {
      if (!prev || prev.length === 0) return prev;
      const output = fillEmptyWebsites(prev);
      return JSON.stringify(prev) !== JSON.stringify(output) ? output : prev;
    });
  }, [validWebsites]);


  useEffect(() => {
    if (activeIndex >= deals.length && deals.length > 0)
      setActiveIndex(deals.length - 1);
  }, [deals.length, activeIndex]);

  // ────────────────────────────────────────────────
  // Add deal
  const addDeal = () => {
    setDeals((prev) => {
      const next = [createEmptyDeal(), ...prev];
      return fillEmptyWebsites(next);
    });
  };

  // ────────────────────────────────────────────────
  // Compute valid websites dynamically
  useEffect(() => {
    const available = websiteListForDeal.filter((web) =>
      deals.every((deal) => deal.website_c !== web)
    );
    setValidWebsites(available);
  }, [deals]);

  // ────────────────────────────────────────────────
  // Delete deal (allow 0 deals)
  const removeDeal = (idx) => {
    setDeals((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return fillEmptyWebsites(next);
    });
  };

  // ────────────────────────────────────────────────
  // Update deal
  const updateDeal = (idx, patch) => {
    setDeals((prev) => {
      const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      if (patch.website_c === "") {
        return fillEmptyWebsites(next);
      }
      return next;
    });
  };

  // ────────────────────────────────────────────────
  // Validation logic
  const valid = useMemo(
    () =>
      deals.length > 0 &&
      deals.every(
        (d) => String(d.dealamount).trim() !== "" && Number(d.dealamount) > 0
      ),
    [deals]
  );

  const totalAmount = useMemo(
    () => deals.reduce((s, d) => s + Number(d.dealamount || 0), 0),
    [deals]
  );

  // ────────────────────────────────────────────────
  // Submit
  const submitAll = () => {
    if (deals.length === 0) {
      toast.error("No deals to submit.");
      return;
    }

    if (!valid) {
      toast.error("Please validate all deals before submitting.");
      return;
    }

    dispatch(dealsAction.UpdateDeals([...deals, ...prevDeals]));
    dispatch(createDeal(deals));
    if (contactInfo.thread_id) {
      dispatch(sendEmailToThread(contactInfo.thread_id, renderToStaticMarkup(
        <PreviewDeals
          deals={deals}
          totalAmount={totalAmount}
          userEmail={email}
        />
      )))
    }
  };

  // ────────────────────────────────────────────────
  // Handle message or error
  useEffect(() => {
    if (message) {
      toast.success(message);
      setDeals([]);
      navigate("/deals");
      dispatch(dealsAction.clearAllMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
    }
  }, [message, error]);

  // ────────────────────────────────────────────────
  // Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(deals);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    setDeals(fillEmptyWebsites(arr));
  };

  // ────────────────────────────────────────────────
  // UI
  return (
    <div className="w-full min-h-[80vh] p-6 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
        {/* LEFT SECTION */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/deals")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <MoveLeft size={16} />
                  Back
                </button>

                <h3 className="text-2xl font-semibold">Create Deals</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={addDeal}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Deals List */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="deals-droppable">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {deals.map((deal, idx) => (
                        <Draggable
                          key={deal.id}
                          draggableId={deal.id}
                          index={idx}
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
                              className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"
                            >


                              <div className=" grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Amount */}
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Amount
                                  </label>
                                  <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                      $
                                    </span>
                                    <input
                                      value={deal.dealamount}
                                      onChange={(e) =>
                                        updateDeal(idx, {
                                          dealamount: e.target.value,
                                        })
                                      }
                                      inputMode="numeric"
                                      className="w-full rounded-xl border px-3 pl-9 py-2 bg-white"
                                      placeholder="1000"
                                    />
                                  </div>
                                </div>

                                {/* Website */}
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Website
                                  </label>
                                  <select
                                    value={deal.website_c}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        setDeals((prev) => {
                                          const next = prev.map((d, i) =>
                                            i === idx
                                              ? { ...d, website_c: "" }
                                              : d
                                          );
                                          return fillEmptyWebsites(next);
                                        });
                                      } else {
                                        updateDeal(idx, { website_c: val });
                                      }
                                    }}
                                    className="w-full rounded-xl border px-3 py-2 bg-white mt-1"
                                  >
                                    {websiteListForDeal
                                      .filter(
                                        (site) =>
                                          site === deal.website_c ||
                                          !deals.some(
                                            (d, i) =>
                                              d.website_c === site && i !== idx
                                          )
                                      )
                                      .map((site) => (
                                        <option key={site} value={site}>
                                          {site}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-end justify-end  gap-3">
                                <button
                                  onClick={() => removeDeal(idx)}
                                  className="text-red-500 p-2 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Deals: {deals.length}
              </p>

              <button
                onClick={() => {
                  setDeals([]);
                  toast.info("New blank set created");
                }}
                className="px-3 py-2 bg-gray-50 rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-semibold">
                <h4 className="text-lg font-medium">Deals For {email}</h4>
              </h4>

              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Deals</span>
                  <strong>{deals.length}</strong>
                </div>

                {/* Website breakdown */}
                <div className="mt-3">
                  <strong className="block mb-1">Websites</strong>

                  {deals.length === 0 ? (
                    <p className="text-gray-400">No websites selected</p>
                  ) : (
                    <ul className="list-none space-y-1">
                      {deals.map((d, i) => (
                        <li key={i}>
                          {d.website_c || "(no site)"} —{" "}
                          <strong>${Number(d.dealamount || 0)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}

                  <hr className="my-3 border-gray-300" />

                  <div className="flex justify-between text-lg">
                    <strong>Total Amount</strong>
                    <strong>${totalAmount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  disabled={deals.length === 0 || !valid || creating}
                  onClick={submitAll}
                  className={`w-full px-3 py-2 rounded-lg text-white ${deals.length === 0 || !valid
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {creating ? "Submitting..." : "Submit All Deals"}
                </button>

                {/* PREVIEW BUTTON */}
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">

          {/* OUTER WRAPPER (WIDER + ROUNDED) */}
          <div className="bg-white w-full max-w-[800px] rounded-2xl shadow-2xl overflow-hidden relative">

            {/* SCROLLABLE CONTENT */}
            <div className="max-h-[80vh] overflow-y-auto p-6">

              <PreviewDeals
                deals={deals}
                totalAmount={totalAmount}
                onSubmit={submitAll}
                userEmail={email}
              />

            </div>

            {/* FOOTER BUTTONS */}
            <div className="p-4 border-t flex items-center justify-between bg-white">

              <button
                onClick={submitAll}
                style={{
                  padding: "12px 26px",
                  background:
                    "linear-gradient(135deg, #4e79ff, #6db6ff)",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "700",
                  boxShadow:
                    "0px 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                Submit Deals
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
      )
      }

    </div >
  );
}
