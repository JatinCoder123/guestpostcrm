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
    if (activeIndex >= data.length && data.length > 0) {
      setActiveIndex(data.length - 1);
    }
  }, [data.length, activeIndex]);

  const removeData = (id) => setData((prev) => prev.filter((d) => d.id !== id));

  const updateData = (idx, patch) =>
    setData((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const addData = () => {
    const newData = getEmptyData(fields);
    setData((prev) => [newData, ...prev]);
  };

  const getEmptyData = (fields) => {
    const newData = { id: `${Date.now()}${Math.random()}` };
    fields.forEach((f) => (newData[f.name] = ""));
    newData.email = email;
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
    if (data.length === 0) return type === "orders";
    if (type === "deals") {
      return data.every(
        (d) =>
          String(d.dealamount ?? "").trim() &&
          Number(d.dealamount) > 0 &&
          String(d[websiteKey] ?? "").trim(),
      );
    }
    if (type === "offers") {
      return data.every(
        (d) =>
          String(d.client_offer_c ?? "").trim() &&
          Number(d.client_offer_c) > 0 &&
          String(d[websiteKey] ?? "").trim(),
      );
    }
    return false;
  }, [data, type, websiteKey]);

  useEffect(() => {
    if (message) navigate(-1);
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

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-950 dark:to-slate-900 pb-16 pt-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 bg-gradient-to-br from-blue-50 via-blue-100/40 to-blue-50 rounded-2xl p-4">
            {/* MAIN */}
            <div className="flex-1 order-2 lg:order-1 ">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                {/* HEADER - ultra clean, elevated */}
                <div className="px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/50 bg-gradient-to-r from-white/40 to-transparent dark:from-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        navigate(-1, { state: { threadId, email } })
                      }
                      className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 shadow-sm hover:shadow-md transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      <MoveLeft size={18} strokeWidth={2.2} />
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {pageType === "view"
                        ? ""
                        : pageType.charAt(0).toUpperCase() +
                          pageType.slice(1)}{" "}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h2>
                  </div>

                  <div className="flex gap-3 ">
                    {pageType === "view" && type === "orders" && (
                      <button
                        onClick={() =>
                          navigate("/orders", { state: { email, threadId } })
                        }
                        className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-all shadow-sm hover:shadow"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    )}

                    {pageType === "view" && (
                      <button
                        onClick={() =>
                          navigate(`/${type}/create`, {
                            state: { email, threadId },
                          })
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium "
                      >
                        <Plus size={18} /> New
                      </button>
                    )}

                    {pageType === "create" && type !== "orders" && (
                      <button
                        onClick={addData}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                      >
                        <Plus size={18} /> Add {type.slice(0, -1)}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 lg:p-8">
                  {pageType === "create" && type === "orders" ? (
                    <CreateOrderForm
                      order={data}
                      setOrder={setData}
                      creating={creating}
                      handleSubmit={handleSubmit}
                    />
                  ) : (
                    <div className="space-y-6 ">
                      {data.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group relative   backdrop-blur-lg rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-cyan-50"
                        >
                          {/* Floating actions - subtle & elevated */}
                          <div className="absolute top-4 right-4 flex gap-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            {pageType === "view" && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(`/${type}/edit/${item.id}`, {
                                      state: { email, threadId },
                                    })
                                  }
                                  className="p-2.5 rounded-xl  hover:bg-amber-100  text-amber-700 dark:text-amber-300 shadow-sm hover:shadow-md transition-all"
                                >
                                  <Pencil size={17} strokeWidth={2.5} />
                                </button>
                                {type === "orders" && (
                                  <button
                                    onClick={() => {
                                      setCurrentOrderSend(item);
                                      setShowPreview(true);
                                    }}
                                    className="p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 shadow-sm hover:shadow-md transition-all"
                                  >
                                    <Eye size={17} strokeWidth={2.5} />
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
                                disabled={deleting && deleteId === item.id}
                                className="p-2.5 rounded-xl bg-red-50/90 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                              >
                                {deleting && deleteId === item.id ? (
                                  <LoadingChase size="18" color="red" />
                                ) : (
                                  <Trash size={17} strokeWidth={2.5} />
                                )}
                              </button>
                            )}
                          </div>

                          {type === "orders" && pageType === "view" ? (
                            <OrderView
                              data={item}
                              setData={setData}
                              sending={sending}
                              setCurrentOrderSend={setCurrentOrderSend}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 p-3 mt-3">
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
                          )}

                          {pageType === "edit" && (
                            <div className="mt-10 pt-6 border-t border-slate-200/70 dark:border-slate-700/50 flex justify-center gap-5 px-6 pb-6">
                              <button
                                onClick={() => {
                                  setButton(1);
                                  handleUpdate(item, false);
                                }}
                                disabled={updating || sending}
                                className={`min-w-[160px] py-3.5 px-8 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 ${
                                  updating && button === 1
                                    ? "bg-green-500/70 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5"
                                }`}
                              >
                                {updating && button === 1
                                  ? "Updating..."
                                  : "Update"}
                              </button>
                              <button
                                onClick={() => {
                                  setButton(2);
                                  handleUpdate(item, true);
                                }}
                                disabled={updating || sending}
                                className={`min-w-[160px] py-3.5 px-8 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 ${
                                  updating && button === 2
                                    ? "bg-indigo-500/70 cursor-not-allowed"
                                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                                }`}
                              >
                                {updating && button === 2
                                  ? "Updating..."
                                  : "Update & Send"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR - glass + elevated */}
            {pageType !== "edit" && type !== "orders" && (
              <div className="lg:w-96 order-1 lg:order-2 lg:sticky lg:top-10 h-fit">
                <div className="bg-white/65 dark:bg-slate-900/65 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-7 ring-1 ring-black/5 dark:ring-white/5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
                    {type.charAt(0).toUpperCase() + type.slice(1)} • {email}
                  </h3>

                  <div className="space-y-5 text-sm">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Total:</span>
                      <span className="font-semibold">{data.length}</span>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                        {type === "orders" ? "Order IDs" : "Websites"}
                      </p>
                      {data.length === 0 ? (
                        <p className="text-slate-400 dark:text-slate-500 italic text-sm">
                          None added yet
                        </p>
                      ) : (
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                          {data.map((d, i) => (
                            <li
                              key={i}
                              className="flex justify-between items-center"
                            >
                              <span className="truncate max-w-[160px] font-medium">
                                {type === "orders"
                                  ? d[orderID] || "—"
                                  : d[websiteKey] || "—"}
                              </span>
                              {amountKey && (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  ${Number(d[amountKey] || 0).toLocaleString()}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    {pageType === "view" ? (
                      <button
                        disabled={data.length === 0}
                        onClick={() => setShowPreview(true)}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 ${
                            data.length === 0 || !valid
                              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5"
                          }`}
                        >
                          {creating && button === 1 ? "Saving..." : "Save"}
                        </button>

                        <button
                          disabled={data.length === 0 || !valid}
                          onClick={() => {
                            setButton(2);
                            handleSubmit(true);
                          }}
                          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 ${
                            data.length === 0 || !valid
                              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                          }`}
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
        </div>

        {/* PREVIEW MODAL - cinematic feel */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
              <div className="max-h-[90vh] overflow-y-auto">
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
    <div>
      <label
        className={`block mb-1.5 text-sm font-medium ${
          pageType === "view"
            ? "text-slate-700 dark:text-slate-400"
            : "text-slate-700 dark:text-slate-300"
        } ${label === "Order Status" ? "text-amber-700 dark:text-amber-400 font-semibold" : ""} `}
      >
        {label}
      </label>

      {inputType === "select" ? (
        <select
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-2xl border border-slate-300/70 dark:border-slate-600/70 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/40 focus:outline-none transition-all duration-200 shadow-inner ${
            isDisabled ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {label === "Order Status"
            ? Object.entries(statusLists).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))
            : websiteLists.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
        </select>
      ) : inputType === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={`w-full px-4 py-3 rounded-2xl border border-slate-300/70 dark:border-slate-600/70 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/40 focus:outline-none transition-all duration-200 resize-y min-h-[30px] shadow-inner ${
            isDisabled ? "opacity-70 cursor-not-allowed" : ""
          }`}
        />
      ) : (
        <div className="relative">
          {inputType === "number" && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 z-10">
              $
            </span>
          )}
          <input
            value={value === "N/A" ? "" : value}
            onChange={onChange}
            placeholder={placeholder}
            type={inputType}
            disabled={isDisabled}
            inputMode={inputType === "number" ? "numeric" : undefined}
            className={`w-full px-4 py-3 rounded-2xl border border-slate-300/70 dark:border-slate-600/70 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/40 focus:outline-none transition-all duration-200 shadow-inner ${
              inputType === "number" ? "pl-9" : ""
            } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
          />
        </div>
      )}
    </div>
  );
}
