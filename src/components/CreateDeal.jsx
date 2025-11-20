import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, GripVertical, Check } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction, getDeals } from "../store/Slices/deals";

const LOCAL_KEY = "create_deals_draft_v1";
const AUTOFILL_AMOUNTS = [1000, 2500, 5000, 10000];

export default function CreateDeal({ onClose, validWebsites }) {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { creating, error, message } = useSelector((state) => state.deals);
  const dispatch = useDispatch();

  // Helper: create an empty deal (website left empty for now)
  function createEmptyDeal(seed = Date.now()) {
    return {
      id: String(seed) + Math.random().toString(36).slice(2, 7),
      dealamount: "",
      website_c: "", // will be auto-filled later
      email: email,
      createdAt: new Date().toISOString(),
    };
  }

  // Load initial deals from localStorage, or one empty deal
  const [deals, setDeals] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
      return [createEmptyDeal(0)];
    } catch (e) {
      return [createEmptyDeal(0)];
    }
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Utility: produce a set of currently used websites
  const usedWebsites = (arr) =>
    new Set(arr.map((d) => d.website_c).filter(Boolean));

  // Utility: fill empty website_c values in order using available websites
  const fillEmptyWebsites = (arr) => {
    const used = new Set();
    const result = arr.map((d) => ({ ...d })); // shallow clone

    // first mark already assigned ones (respect existing choices)
    for (const r of result) {
      if (r.website_c) used.add(r.website_c);
    }

    // then fill empty slots with the first unused websites (in order)
    let siteIdx = 0;
    for (let i = 0; i < result.length; i++) {
      if (!result[i].website_c) {
        // find next available site
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
        } else {
          // no more available websites -> leave blank
          result[i].website_c = "";
        }
      }
    }
    return result;
  };

  // After component mounts / whenever validWebsites or deals change,
  // ensure empty website slots get auto-assigned (only when possible).
  // This will also fix the initial state case.
  useEffect(() => {
    setDeals((prev) => {
      // If there are any empty website slots AND there are available websites,
      // perform filling; otherwise keep prev as-is to avoid unnecessary re-renders.
      const hasEmpty = prev.some((d) => !d.website_c);
      if (!hasEmpty) return prev;

      const filled = fillEmptyWebsites(prev);
      // If nothing changed, return prev to avoid state update
      const changed = JSON.stringify(filled) !== JSON.stringify(prev);
      return changed ? filled : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validWebsites]); // run when available websites change

  // Persist drafts whenever deals change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    if (activeIndex >= deals.length)
      setActiveIndex(Math.max(0, deals.length - 1));
  }, [deals.length, activeIndex]);

  // Add a new deal and auto-fill websites afterwards
  const addDeal = () => {
    setDeals((prev) => {
      const next = [createEmptyDeal(), ...prev];
      return fillEmptyWebsites(next);
    });
    setActiveIndex(deals.length);
  };

  const removeDeal = (idx) => {
    if (deals.length === 1) {
      toast.warn("At least one deal is required");
      return;
    }
    setDeals((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // After removal, refill empty slots (frees up a website)
      return fillEmptyWebsites(next);
    });
  };

  const updateDeal = (idx, patch) => {
    setDeals((prev) => {
      const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      // If user cleared website (set to ""), attempt to refill automatic website for that slot
      if (patch.website_c === "") {
        return fillEmptyWebsites(next);
      }
      // If user set a new website, ensure no duplicates by leaving choices and letting dropdown logic restrict choices.
      return next;
    });
  };

  const valid = useMemo(
    () =>
      deals.every(
        (d) => String(d.dealamount).trim() !== "" && Number(d.dealamount) > 0
      ),
    [deals]
  );

  const totalAmount = useMemo(
    () => deals.reduce((s, d) => s + Number(d.dealamount || 0), 0),
    [deals]
  );

  const submitAll = () => {
    if (!valid) {
      toast.error("Please validate all deals before submitting");
      return;
    }
    dispatch(createDeal(deals));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      setDeals([createEmptyDeal(0)]);
      localStorage.removeItem(LOCAL_KEY);
      onClose();
      dispatch(dealsAction.clearAllMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
    }
  }, [dispatch, creating, error, message, timeline, email, onClose]);

  // Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;
    const arr = Array.from(deals);
    const [moved] = arr.splice(src, 1);
    arr.splice(dst, 0, moved);
    // after reorder, re-fill websites to keep uniqueness
    setDeals(fillEmptyWebsites(arr));
    setActiveIndex(dst);
  };

  // Autofill helper
  const applyAutofill = (idx, amount) =>
    updateDeal(idx, { dealamount: amount });

  return (
    <div className="w-full min-h-[80vh] p-6 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
        {/* LEFT: Forms (two-column layout) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Create Deals</h3>
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
                  title="Add deal"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
                >
                  <Plus size={16} /> Add
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem(LOCAL_KEY);
                    setDeals([createEmptyDeal()]);
                    toast.info("Draft cleared");
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

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
                          {(draggableProvided) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-100 rounded-lg cursor-grab">
                                    <GripVertical size={18} />
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-lg font-medium">
                                        Deal {idx + 1}
                                      </h4>

                                      {/* validation badge */}
                                      {String(deal.dealamount).trim() !== "" &&
                                      Number(deal.dealamount) > 0 ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                          <Check size={14} /> Valid
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">
                                          ⚠ Required
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs text-gray-500">
                                      {deal.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setActiveIndex(idx);
                                    }}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                      activeIndex === idx
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    Preview
                                  </button>

                                  <button
                                    onClick={() => removeDeal(idx)}
                                    className="text-red-500 p-2 rounded-lg hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Expandable form */}
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-1">
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

                                  <div className="mt-2 flex gap-2">
                                    {AUTOFILL_AMOUNTS.map((amt) => (
                                      <button
                                        key={amt}
                                        type="button"
                                        onClick={() => applyAutofill(idx, amt)}
                                        className="text-xs px-2 py-1 bg-gray-100 rounded-md"
                                      >
                                        {amt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="md:col-span-1">
                                  <label className="block text-xs text-gray-600">
                                    Website
                                  </label>

                                  <select
                                    value={deal.website_c}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        // if user explicitly selects blank, try to auto-fill
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
                                    {validWebsites
                                      .filter(
                                        (site) =>
                                          site === deal.website_c || // allow currently selected
                                          !deals.some(
                                            (d, i) =>
                                              d.website_c === site && i !== idx
                                          ) // hide if selected elsewhere
                                      )
                                      .map((site, i) => (
                                        <option key={i} value={site}>
                                          {site}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <div className="md:col-span-1">
                                  <label className="block text-xs text-gray-600">
                                    Email
                                  </label>
                                  <input
                                    value={deal.email}
                                    disabled
                                    onChange={(e) =>
                                      updateDeal(idx, { email: e.target.value })
                                    }
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

            {/* bottom actions */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Total Deals: <strong>{deals.length}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDeals([createEmptyDeal()]);
                    toast.info("New blank set created");
                  }}
                  className="px-3 py-2 bg-gray-50 rounded-lg"
                >
                  Reset
                </button>

                <button
                  disabled={!valid || creating}
                  onClick={submitAll}
                  className={`px-4 py-2 rounded-lg text-white ${
                    valid
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {creating ? "Submitting..." : "Submit All Deals"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar preview & summary */}
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
                <div className="flex justify-between mt-2">
                  <span>Websites</span>
                  <strong>
                    {[...new Set(deals.map((d) => d.website_c))]
                      .slice(0, 3)
                      .join(", ")}
                  </strong>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(deals));
                    toast.success("Copied payload");
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Copy Payload
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-semibold">Live Preview</h4>
              <div className="mt-3">
                {deals[activeIndex] ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Deal {activeIndex + 1}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="text-lg font-semibold">
                        ${deals[activeIndex].dealamount || "—"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {deals[activeIndex].website_c}
                      </div>
                      <div className="text-xs text-gray-500">
                        {deals[activeIndex].email}
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-xs text-gray-600">
                        Quick autofill
                      </label>
                      <div className="flex gap-2 mt-2">
                        {AUTOFILL_AMOUNTS.map((a) => (
                          <button
                            key={a}
                            className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                            onClick={() => applyAutofill(activeIndex, a)}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() =>
                          updateDeal(activeIndex, {
                            dealamount: String(
                              Number(deals[activeIndex].dealamount || 0) + 1000
                            ),
                          })
                        }
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm"
                      >
                        + Add 1000
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No deal selected</div>
                )}
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
