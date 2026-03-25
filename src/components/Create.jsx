import { useEffect, useState, useMemo } from "react";
import { Eye, MoveLeft, Pencil, Plus, ShoppingCart, Trash } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingChase } from "./Loading";
import { OrderView } from "./OrderView";
import PageLoader from "./PageLoader";
import CreateOrderForm from "./CreateOrderForm";

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
  messageId,
  lists = [],
  threadId,
  setCurrentOrderSend,
  submitData,
  handleDelete,
  websiteKey = "website",
  orderID = "order_id",
  handleUpdate,
  updating,
  renderPreview,
  amountKey,
  setNewDealsCreated,
  showPreview,
  setShowPreview,
}) {
  const navigate = useNavigate();
  const { loading, message } = useSelector((state) => state.threadEmail);
  const [button, setButton] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

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
        (d, i) => i !== idx && d[websiteKey] === value,
      );
      if (alreadyUsed) {
        toast.error("This website is already used in another deal");
        return;
      }
    }

    updateData(idx, { [field]: value });
  };

  const valid = useMemo(() => {
    if (data.length > 0) {
      if (type === "deals") {
        return data.every(
          (d) =>
            String(d.dealamount || "").trim() !== "" &&
            Number(d.dealamount) > 0 &&
            String(d[websiteKey]).trim() !== "",
        );
      } else if (type === "offers") {
        return data.every(
          (d) =>
            String(d.client_offer_c || "").trim() !== "" &&
            Number(d.client_offer_c) > 0 &&
            String(d[websiteKey]).trim() !== "",
        );
      }
    }
    return false;
  }, [data, type, websiteKey]);

  useEffect(() => {
    if (message) {
      navigate(-1);
    }
  }, [message, navigate]);

  const handleSubmit = (send = false) => {
    if (data.length === 0 && type !== "orders") {
      toast.error(`No ${type} to submit.`);
      return;
    }
    if (!valid && type !== "orders") {
      toast.error(`Please validate all ${type} before submitting.`);
      return;
    }
    submitData(data, send);
  };

  return (
    <>
      {(updating || sending || creating) && <PageLoader />}

      <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-9xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* MAIN CONTENT */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(-1, { state: { threadId, email } })}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <MoveLeft size={18} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {pageType === "view"
                      ? ""
                      : pageType.charAt(0).toUpperCase() +
                      pageType.slice(1)}{" "}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {pageType === "view" && (
                    <>
                      {type === "orders" && (
                        <button
                          onClick={() =>
                            navigate("/orders", { state: { email, threadId } })
                          }
                          className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/${type}/create`, {
                            state: { email, threadId, messageId },
                          })
                        }
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </>
                  )}

                  {pageType === "create" && type !== "orders" && (
                    <button
                      onClick={addData}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all font-medium"
                    >
                      <Plus size={18} /> Add New
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {pageType === "create" && type === "orders" ? (
                <div className="p-6">
                  <CreateOrderForm
                    order={data}
                    setOrder={setData}
                    creating={creating}
                    handleSubmit={handleSubmit}
                  />
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  {data.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      No {type} yet.{" "}
                      {pageType === "create" ? "Click 'Add New' to start." : ""}
                    </div>
                  ) : (
                    Array.isArray(data) &&
                    data.length > 0 &&
                    data.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`
                          relative rounded-xl border overflow-hidden transition-all
                          ${pageType === "view"
                            ? "border-l-4 border-l-indigo-500 bg-indigo-50/30"
                            : "border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow-md"
                          }
                        `}
                      >
                        {/* Action buttons – high z-index */}
                        <div className="absolute top-2 right-4 flex gap-2 z-30">
                          {pageType === "view" && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(`/${type}/edit/${item.id}`, {
                                    state: { email, threadId },
                                  })
                                }
                                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                                title="Edit this item"
                              >
                                <Pencil size={18} />
                              </button>

                              {type === "orders" && (
                                <button
                                  onClick={() => {
                                    setCurrentOrderSend(item);
                                    setShowPreview(true);
                                  }}
                                  className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                                  title="View preview"
                                >
                                  <Eye size={18} />
                                </button>
                              )}
                            </>
                          )}

                          {pageType !== "edit" && type !== "orders" && (
                            <button
                              onClick={() =>
                                pageType === "create"
                                  ? removeData(item.id)
                                  : handleDelete(item.id)
                              }
                              className="p-2.5 rounded-lg bg-white shadow hover:bg-red-50 text-red-600 transition-all hover:shadow-md active:scale-95"
                              disabled={deleting && deleteId === item.id}
                              title="Delete this item"
                            >
                              {deleting && deleteId === item.id ? (
                                <LoadingChase size="18" color="red" />
                              ) : (
                                <Trash size={18} />
                              )}
                            </button>
                          )}
                        </div>

                        {type === "orders" && pageType === "view" ? (
                          <div className="p-6">
                            <OrderView
                              data={item}
                              setData={setData}
                              sending={sending}
                              setCurrentOrderSend={setCurrentOrderSend}
                            />
                          </div>
                        ) : (
                          <div
                            className={`p-6 ${pageType === "edit" ? "pb-24" : "pb-6"}`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {fields.map((field) => (
                                <InputField
                                  key={field.name}
                                  pageType={pageType}
                                  {...field}
                                  data={item}
                                  onChange={(e) =>
                                    handelChange(idx, field.name, e)
                                  }
                                  websiteLists={validWebsite}
                                />
                              ))}
                            </div>

                            {/* Edit mode buttons – placed at bottom */}
                            {pageType === "edit" && (
                              <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                                <button
                                  onClick={() => {
                                    setButton(1);
                                    handleUpdate(item, false);
                                  }}
                                  disabled={updating || sending}
                                  className={`
                                    px-6 py-3 rounded-xl font-medium text-white transition-colors min-w-[140px] shadow-sm
                                    ${(updating || sending) && button === 1
                                      ? "bg-green-400 cursor-not-allowed"
                                      : "bg-green-600 hover:bg-green-700"
                                    }
                                  `}
                                >
                                  {(updating || sending) && button === 1
                                    ? "Updating..."
                                    : "Update"}
                                </button>

                                <button
                                  onClick={() => {
                                    setButton(2);
                                    handleUpdate(item, true);
                                  }}
                                  disabled={updating || sending}
                                  className={`
                                    px-6 py-3 rounded-xl font-medium text-white transition-colors min-w-[140px] shadow-sm
                                    ${(updating || sending) && button === 2
                                      ? "bg-blue-400 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700"
                                    }
                                  `}
                                >
                                  {(updating || sending) && button === 2
                                    ? "Updating..."
                                    : "Update & Send"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Footer summary */}
              {pageType !== "edit" && (
                <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600 flex justify-between items-center">
                  <span>
                    Total {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
                    <strong className="text-gray-900">{data.length}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {pageType !== "edit" && type !== "orders" && (
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total {type}:</span>
                    <strong className="text-gray-900">{data.length}</strong>
                  </div>

                  <div>
                    <strong className="block mb-2 text-gray-700">
                      {type === "orders" ? "Order IDs" : "Websites"}
                    </strong>
                    {data.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">
                        None added yet
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {data.map((d, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700 truncate max-w-[180px]">
                              {type === "orders"
                                ? d[orderID] || "—"
                                : d[websiteKey] || "—"}
                            </span>
                            {amountKey && (
                              <strong className="text-emerald-600">
                                $
                                {Number(d[amountKey])
                                  ? Number(d[amountKey]).toLocaleString()
                                  : "0"}
                              </strong>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {pageType === "view" ? (
                    <button
                      disabled={data.length === 0}
                      onClick={() => setShowPreview(true)}
                      className={`
                        flex-1 py-3 rounded-xl font-medium text-white transition-colors
                        ${data.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
                      `}
                    >
                      Preview
                    </button>
                  ) : (
                    <>
                      <button
                        disabled={data.length === 0 || !valid}
                        onClick={() => {
                          setButton(1);
                          handleSubmit(false);
                        }}
                        className={`
                          flex-1 py-3 rounded-xl font-medium text-white transition-colors
                          ${data.length === 0 || !valid
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                          }
                        `}
                      >
                        {creating && button === 1 ? "Saving..." : "Save"}
                      </button>

                      <button
                        disabled={data.length === 0 || !valid}
                        onClick={() => {
                          setButton(2);
                          handleSubmit(true);
                        }}
                        className={`
                          flex-1 py-3 rounded-xl font-medium text-white transition-colors
                          ${data.length === 0 || !valid
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                          }
                        `}
                      >
                        {creating && button === 2
                          ? "Sending..."
                          : "Save & Send"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold">Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {renderPreview({
                  data,
                  email,
                  onClose: () => setShowPreview(false),
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
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
  const isDisabled = pageType === "view" ? true : disabled;
  const inputType = pageType === "view" && type === "select" ? "text" : type;

  return (
    <div className="flex flex-col">
      <label
        className={`
          mb-1.5 font-medium
          ${pageType === "view" ? "text-gray-600 text-base" : "text-gray-700 text-sm"}
          ${label === "Order Status" ? "text-amber-700" : ""}
        `}
      >
        {label}
      </label>

      {inputType === "select" ? (
        <select
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          className={`
            w-full px-4 py-2.5 rounded-xl border transition-all
            ${isDisabled
              ? "bg-gray-50 text-gray-500 border-gray-200"
              : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }
          `}
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>

          {label === "Order Status"
            ? Object.entries(statusLists).map(([key, val]) => (
              <option key={key} value={key}>
                {val}
              </option>
            ))
            : (label === "Order Type"
              ? ["GUEST POST", "LINK INSERTION"].map(val => (
                <option key={val} value={val}>
                  {val}
                </option>
              )) : websiteLists.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              )))}
        </select>
      ) : inputType === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={pageType === "view" ? 2 : 3}
          className={`
            w-full px-4 py-2.5 rounded-xl border resize-y
            min-h-[20px] max-h-[80px] transition-all
            ${isDisabled
              ? "bg-gray-50 text-gray-500 border-gray-200"
              : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }
          `}
        />
      ) : (
        <div className="relative flex items-center">
          {inputType === "number" && (
            <span className="absolute left-3 text-gray-500">$</span>
          )}
          <input
            value={value === "N/A" ? "" : value}
            onChange={onChange}
            placeholder={placeholder}
            type={inputType}
            disabled={isDisabled}
            inputMode={inputType === "number" ? "numeric" : undefined}
            className={`
              w-full px-4 py-2.5 rounded-xl border transition-all
              ${inputType === "number" ? "pl-8" : ""}
              ${isDisabled
                ? "bg-gray-50 text-gray-500 border-gray-200"
                : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }
            `}
          />
        </div>
      )}
    </div>
  );
}
