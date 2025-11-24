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

const LOCAL_KEY = "create_deals_draft_v1";

export default function CreateDeal() {
  const { email } = useSelector((state) => state.ladger);
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
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
      return [];
    } catch (e) {
      toast.error(e);
      return [];
    }
  });

  const [validWebsites, setValidWebsites] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  // ────────────────────────────────────────────────
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(deals));
  }, [deals]);

  // ────────────────────────────────────────────────
  // Auto adjust active index
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
  };

  // ────────────────────────────────────────────────
  // Handle message or error
  useEffect(() => {
    if (message) {
      toast.success(message);
      setDeals([]);
      localStorage.removeItem(LOCAL_KEY);
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
                  onClick={() => {
                    localStorage.setItem(LOCAL_KEY, JSON.stringify(deals));
                    toast.success("Draft saved locally");
                  }}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm"
                >
                  Save Draft
                </button>

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
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-100 rounded-lg cursor-grab">
                                    <GripVertical size={18} />
                                  </div>

                                  <h4 className="text-lg font-medium">
                                    Deal for {deal.email}
                                  </h4>
                                </div>

                                <button
                                  onClick={() => removeDeal(idx)}
                                  className="text-red-500 p-2 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                    {validWebsites.length === 0 ? (
                                      <option value="">
                                        No Websites Available
                                      </option>
                                    ) : (
                                      validWebsites
                                        .filter(
                                          (site) =>
                                            site === deal.website_c ||
                                            !deals.some(
                                              (d, i) =>
                                                d.website_c === site &&
                                                i !== idx
                                            )
                                        )
                                        .map((site) => (
                                          <option key={site} value={site}>
                                            {site}
                                          </option>
                                        ))
                                    )}
                                  </select>
                                </div>

                                {/* Email */}
                                <div>
                                  <label className="block text-xs text-gray-600">
                                    Email
                                  </label>
                                  <input
                                    value={deal.email}
                                    disabled
                                    className="w-full rounded-xl border px-3 py-2 bg-white mt-1"
                                  />
                                </div>
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
              <h4 className="font-semibold">Summary</h4>

              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Deals</span>
                  <strong>{deals.length}</strong>
                </div>

                <div className="flex justify-between mt-2">
                  <span>Total Amount</span>
                  <strong>${totalAmount.toLocaleString()}</strong>
                </div>

                <div className="mt-2">
                  <strong className="block mb-1">Websites</strong>

                  {deals.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No websites selected
                    </p>
                  ) : (
                    <ul className="list-disc list-inside text-gray-700">
                      {[...new Set(deals.map((d) => d.website_c))]
                        .filter(Boolean)
                        .map((site, i) => (
                          <li key={i}>{site}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  disabled={deals.length === 0 || !valid || creating}
                  onClick={submitAll}
                  className={`w-full px-3 py-2 rounded-lg text-white ${
                    deals.length === 0 || !valid
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {creating ? "Submitting..." : "Submit All Deals"}
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-sm">
              <h4 className="font-semibold">Tips</h4>
              <ul className="mt-2 list-disc list-inside text-gray-600">
                <li>Use autofill for quick amounts.</li>
                <li>Save draft to continue later.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
