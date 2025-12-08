import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, MoveLeft } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import { createOrder, orderAction } from "../store/Slices/orders";
import PreviewOrders from "./PreviewOrders";
const LOCAL_KEY = "create_order_draft_v1";

export default function CreateOrder() {
  const { email } = useSelector((state) => state.ladger);
  const {
    creating,
    orders: prevOrders,
    error,
    message,
  } = useSelector((state) => state.orders);

  const dispatch = useDispatch();
  const navigate = useNavigate();



  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
      return [...prevOrders];
    } catch (e) {
      toast.error(e);
      return [...prevOrders];
    }
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);



  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
  }, [orders]);

  // ────────────────────────────────────────────────
  // Auto adjust active index
  useEffect(() => {
    if (activeIndex >= orders.length && orders.length > 0)
      setActiveIndex(orders.length - 1);
  }, [orders.length, activeIndex]);


  // ────────────────────────────────────────────────
  // Delete order (allow 0 orders)
  const removeOrder = (idx) => {
    setOrders((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
  };

  // ────────────────────────────────────────────────
  // Update order
  const updateOrder = (idx, patch) => {
    setOrders((prev) => {
      const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      return next;
    });
  };

  // ────────────────────────────────────────────────
  // Validation logic
  const valid = useMemo(
    () =>
      orders.length > 0 &&
      orders.every(
        (d) => String(d.orderamount).trim() !== "" && Number(d.orderamount) > 0
      ),
    [orders]
  );

  const totalAmount = useMemo(
    () => orders.reduce((s, d) => s + Number(d.orderamount || 0), 0),
    [orders]
  );

  // ────────────────────────────────────────────────
  // Submit
  const submitAll = () => {
    if (orders.length === 0) {
      toast.error("No orders to submit.");
      return;
    }

    if (!valid) {
      toast.error("Please validate all orders before submitting.");
      return;
    }

    dispatch(orderAction.UpdateOrders([...orders, ...prevOrders]));
    dispatch(createOrder(orders));
  };

  // ────────────────────────────────────────────────
  // Handle message or error
  useEffect(() => {
    if (message) {
      toast.success(message);
      setOrders([]);
      localStorage.removeItem(LOCAL_KEY);
      navigate("/orders");
      dispatch(orderAction.clearAllMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
  }, [message, error]);

  // ────────────────────────────────────────────────
  // Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(orders);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    setOrders(arr);
  };

  // ────────────────────────────────────────────────
  // UI
  return (
    <>

      <div className="w-full min-h-[80vh] p-6 bg-gray-50 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
          {/* LEFT SECTION */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <MoveLeft size={16} />
                    Back
                  </button>

                  <h3 className="text-2xl font-semibold">Create Order</h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
                      toast.success("Draft saved locally");
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm"
                  >
                    Save Draft
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
                        {prevOrders.map((order, idx) => (
                          <Draggable
                            key={order.id}
                            draggableId={order.id}
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
                                      Order for {order.name}
                                    </h4>
                                  </div>

                                  <button
                                    onClick={() => removeOrder(idx)}
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
                                        value={order.our_price_c}
                                        onChange={(e) =>
                                          updateOrder(idx, {
                                            our_price_c: e.target.value,
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
                                    <input
                                      value={order.website_c}
                                      className="w-full rounded-xl border px-3 py-2 bg-white mt-1"
                                    />
                                  </div>

                                  {/* Email */}
                                  <div>
                                    <label className="block text-xs text-gray-600">
                                      Email
                                    </label>
                                    <input
                                      value={order.client_email}
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
                  Total Orders: {prevOrders.length}
                </p>
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
                    <span>Orders</span>
                    <strong>{prevOrders.length}</strong>
                  </div>

                  {/* Website breakdown */}
                  <div className="mt-3">
                    <strong className="block mb-1">Websites</strong>

                    {prevOrders.length === 0 ? (
                      <p className="text-gray-400">No websites selected</p>
                    ) : (
                      <ul className="list-none space-y-1">
                        {prevOrders.map((d, i) => (
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
                    disabled={prevOrders.length === 0 || !valid || creating}
                    onClick={submitAll}
                    className={`w-full px-3 py-2 rounded-lg text-white ${prevOrders.length === 0 || !valid
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {creating ? "Submitting..." : "Submit All Orders"}
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

                <PreviewOrders
                  orders={prevOrders}
                  totalAmount={totalAmount}
                  userEmail={email}
                />

              </div>

              {/* FOOTER BUTTONS */}
              <div className="p-4 border-t flex items-center justify-between bg-white">

                <button
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
                  Submit Orders
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
      </div></>

  );
}
